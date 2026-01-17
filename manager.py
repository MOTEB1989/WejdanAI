import hashlib
import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


NOTION_API_VERSION = "2022-06-28"


class WejdanAIManager:
    """
    WejdanAI Manager: manages auth, Notion sync and basic project ops.
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        notion_token: Optional[str] = None,
        database_id: Optional[str] = None,
    ):
        self.base_url = base_url or os.getenv("WEJDANAI_BASE_URL", "http://localhost:3000")
        self.notion_token = notion_token or os.getenv("NOTION_TOKEN")
        self.database_id = database_id or os.getenv("DATABASE_ID")
        self.auth_token: Optional[str] = None
        self.session = self._create_session()

        if not self.notion_token or not self.database_id:
            raise ValueError("NOTION_TOKEN and DATABASE_ID must be set as environment variables or passed as arguments.")

    def _create_session(self) -> requests.Session:
        """Create requests session with retries and default User-Agent."""
        session = requests.Session()
        retries = Retry(total=3, backoff_factor=0.3, status_forcelist=[429, 500, 502, 503, 504])
        adapter = HTTPAdapter(max_retries=retries)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        session.headers.update({"User-Agent": "WejdanAI-Manager/1.0"})
        return session

    def authenticate(self, username: Optional[str] = None) -> str:
        """
        Authenticate with backend to fetch JWT token.
        Does not print the full token for safety.
        """
        if username:
            url = f"{self.base_url}/api/auth"
            payload = {"username": username}
        else:
            url = f"{self.base_url}/api/auth/auto"
            payload = {}

        try:
            resp = self.session.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            self.auth_token = data["token"]
            safe = (self.auth_token[:8] + "...") if self.auth_token else "None"
            print(f"✅ Authenticated successfully. Token start: {safe}")
            return self.auth_token
        except requests.exceptions.RequestException as e:
            print(f"❌ Authentication failed: {e}")
            if hasattr(e, "response") and e.response is not None:
                print(f"Response: {e.response.text}")
            raise

    def _ensure_authenticated(self):
        if not self.auth_token:
            self.authenticate()

    def list_models(self) -> List[Dict[str, Any]]:
        self._ensure_authenticated()
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        try:
            resp = self.session.get(f"{self.base_url}/api/models", headers=headers)
            resp.raise_for_status()
            return resp.json()
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to list models: {e}")
            return []

    def add_model(self, name: str, version: str, description: str = "") -> Dict[str, Any]:
        self._ensure_authenticated()
        headers = {"Authorization": f"Bearer {self.auth_token}", "Content-Type": "application/json"}
        payload = {"name": name, "version": version, "description": description}
        try:
            resp = self.session.post(f"{self.base_url}/api/models", headers=headers, json=payload)
            resp.raise_for_status()
            result = resp.json()
            print(f"✅ Model '{name}' (v{version}) added successfully.")
            return result
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to add model: {e}")
            if hasattr(e, "response") and e.response is not None:
                print(f"Response: {e.response.text}")
            return {}

    def _stable_external_id(self, chat_data: Dict[str, Any]) -> str:
        title = str(chat_data.get("title", "")).strip()
        ai_tool = str(chat_data.get("ai_tool", "")).strip()
        category = str(chat_data.get("category", "")).strip()
        content = str(chat_data.get("content", "")).strip()
        payload = "\n".join([title, ai_tool, category, content]).encode("utf-8")
        return hashlib.sha256(payload).hexdigest()

    def _notion_page_exists_by_external_id(self, external_id: str) -> Tuple[bool, Optional[str]]:
        """
        Query the Notion database and handle pagination. Return (exists, page_id).
        """
        url = f"https://api.notion.com/v1/databases/{self.database_id}/query"
        headers = {
            "Authorization": f"Bearer {self.notion_token}",
            "Content-Type": "application/json",
            "Notion-Version": NOTION_API_VERSION,
        }

        payload = {
            "filter": {
                "property": "External ID",
                "rich_text": {"equals": external_id}
            },
            "page_size": 100
        }

        try:
            has_more = True
            next_cursor = None
            while True:
                if next_cursor:
                    payload["start_cursor"] = next_cursor
                resp = self.session.post(url, headers=headers, json=payload)
                resp.raise_for_status()
                data = resp.json()
                for r in data.get("results", []):
                    # Double-check the property exists and matches:
                    props = r.get("properties", {})
                    ext_prop = props.get("External ID", {})
                    texts = ext_prop.get("rich_text", [])
                    for t in texts:
                        txt = t.get("text", {}).get("content") or t.get("plain_text") or ""
                        if txt == external_id:
                            return True, r.get("id")
                if not data.get("has_more"):
                    break
                next_cursor = data.get("next_cursor")
            return False, None
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to query Notion for external ID {external_id}: {e}")
            return False, None

    def _chunk_rich_text(self, text: str, chunk_size: int = 1800) -> List[Dict[str, Any]]:
        """Return list of Notion text objects with explicit type for compatibility."""
        if not text:
            return [{"type": "text", "text": {"content": ""}}]
        chunks = [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]
        return [{"type": "text", "text": {"content": chunk}} for chunk in chunks]

    def sync_chat_to_notion(self, chat_data: Dict[str, Any], update_existing: bool = False, dry_run: bool = False) -> str:
        """
        Sync a single chat to Notion.
        Returns one of: "created", "updated", "skipped", "failed"
        """
        external_id = self._stable_external_id(chat_data)
        exists, page_id = self._notion_page_exists_by_external_id(external_id)

        if exists and page_id:
            if update_existing:
                if dry_run:
                    print(f"(dry-run) ♻️ Would update Notion page {page_id} for chat: {chat_data.get('title')}")
                    return "updated"
                ok = self._update_chat_in_notion(page_id, chat_data, external_id=external_id)
                return "updated" if ok else "failed"
            else:
                print(f"↩️ Skipping duplicate chat: {chat_data.get('title', 'Untitled')} | page_id={page_id}")
                return "skipped"

        if dry_run:
            print(f"(dry-run) ✅ Would create Notion page for chat: {chat_data.get('title', 'Untitled')}")
            return "created"
        ok = self._create_chat_in_notion(chat_data, external_id)
        return "created" if ok else "failed"

    def _create_chat_in_notion(self, chat_data: Dict[str, Any], external_id: str) -> bool:
        url = "https://api.notion.com/v1/pages"
        headers = {
            "Authorization": f"Bearer {self.notion_token}",
            "Content-Type": "application/json",
            "Notion-Version": NOTION_API_VERSION,
        }

        properties = {
            "Page Title": {
                "title": [
                    {"type": "text", "text": {"content": chat_data.get("title", "Untitled Chat")}}
                ]
            },
            "AI Tool": {"select": {"name": chat_data.get("ai_tool", "Other")}},
            "Category": {"select": {"name": chat_data.get("category", "General")}},
            "Status": {"status": {"name": "Completed"}},
            "External ID": {"rich_text": [{"type": "text", "text": {"content": external_id}}]},
            "Conversation Content": {"rich_text": self._chunk_rich_text(chat_data.get("content", ""))}
        }

        payload = {"parent": {"database_id": self.database_id}, "properties": properties}

        try:
            resp = self.session.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            print(f"✅ Created Notion page for chat: {chat_data.get('title', 'Untitled')}")
            return True
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to create Notion page for chat: {chat_data.get('title', 'Untitled')}. Error: {e}")
            if hasattr(e, "response") and e.response is not None:
                print(f"Response: {e.response.text}")
            return False

    def _update_chat_in_notion(self, page_id: str, chat_data: Dict[str, Any], external_id: Optional[str] = None) -> bool:
        url = f"https://api.notion.com/v1/pages/{page_id}"
        headers = {
            "Authorization": f"Bearer {self.notion_token}",
            "Content-Type": "application/json",
            "Notion-Version": NOTION_API_VERSION,
        }

        props = {
            "Page Title": {
                "title": [
                    {"type": "text", "text": {"content": chat_data.get("title", "Untitled Chat")}}
                ]
            },
            "AI Tool": {"select": {"name": chat_data.get("ai_tool", "Other")}},
            "Category": {"select": {"name": chat_data.get("category", "General")}},
            "Status": {"status": {"name": "Completed"}},
            "Conversation Content": {"rich_text": self._chunk_rich_text(chat_data.get("content", ""))}
        }

        # ensure external id present if provided
        if external_id:
            props["External ID"] = {"rich_text": [{"type": "text", "text": {"content": external_id}}]}

        payload = {"properties": props}

        try:
            resp = self.session.patch(url, headers=headers, json=payload)
            resp.raise_for_status()
            print(f"♻️ Updated Notion page for chat: {chat_data.get('title', 'Untitled')} | page_id={page_id}")
            return True
        except requests.exceptions.RequestException as e:
            print(f"❌ Failed to update Notion page {page_id} for chat: {chat_data.get('title', 'Untitled')}. Error: {e}")
            if hasattr(e, "response") and e.response is not None:
                print(f"Response: {e.response.text}")
            return False

    def sync_local_chats_to_notion(
        self,
        repo_dir: str = ".",
        file_pattern: str = "chats.json",
        update_existing: bool = False,
        dry_run: bool = False,
    ) -> Dict[str, int]:
        """
        Scan repo_dir for JSON files whose filename contains file_pattern and sync them.
        Returns stats dict with keys: created, updated, skipped, failed, total
        """
        files: List[Path] = []
        for root, _, filenames in os.walk(repo_dir):
            for filename in filenames:
                if filename.endswith(".json") and file_pattern in filename:
                    files.append(Path(root) / filename)

        all_chats: List[Dict[str, Any]] = []
        for file_path in files:
            print(f"🔍 Scanning file: {file_path}")
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        all_chats.extend(data)
                    elif isinstance(data, dict) and "chats" in data and isinstance(data["chats"], list):
                        all_chats.extend(data["chats"])
                    else:
                        print(f"⚠️ Unsupported format in file: {file_path}")
            except (json.JSONDecodeError, FileNotFoundError) as e:
                print(f"⚠️ Error reading file {file_path}: {e}")

        print(f"📊 Found {len(all_chats)} chat entries to process.")

        stats = {"created": 0, "updated": 0, "skipped": 0, "failed": 0, "total": len(all_chats)}
        for chat in all_chats:
            if not isinstance(chat, dict):
                print("⚠️ Skipping non-dict item in chat list.")
                stats["failed"] += 1
                continue

            result = self.sync_chat_to_notion(chat, update_existing=update_existing, dry_run=dry_run)
            if result in stats:
                stats[result] += 1
            else:
                stats["failed"] += 1

        print(f"✅ Sync completed. Created: {stats['created']}, Updated: {stats['updated']}, Skipped: {stats['skipped']}, Failed: {stats['failed']}")
        return stats

    def run_tests(self, run_remote_tests: bool = False):
        """Basic smoke checks. By default doesn't perform destructive remote ops unless run_remote_tests=True."""
        print("🧪 Running basic tests (non-destructive)...")
        try:
            # Local-only checks could be added here.
            if run_remote_tests:
                token = self.authenticate(username="test_user")
                assert token is not None
                print("✅ Authentication test passed.")

                models = self.list_models()
                print(f"✅ Retrieved {len(models)} models.")

                new_model = self.add_model("TestModel", "1.0", "For testing purposes.")
                if not new_model:
                    raise RuntimeError("Add model returned empty result.")
                print("✅ Add model test passed.")

                test_chat = {
                    "title": "Test Sync Chat",
                    "ai_tool": "TestAI",
                    "category": "Testing",
                    "content": "This is a test chat for the sync functionality."
                }
                success = self.sync_chat_to_notion(test_chat, dry_run=False)
                if success not in ("created", "updated"):
                    raise RuntimeError("Notion sync test failed.")
                print("✅ Notion sync test passed.")

            print("🎉 Non-destructive tests passed!")
        except Exception as e:
            print(f"❌ Test failed: {e}")
            raise


if __name__ == "__main__":
    # Simple CLI-like behavior suitable for iPhone execution
    import argparse

    parser = argparse.ArgumentParser(description="WejdanAI Manager")
    parser.add_argument("--repo-dir", default=".", help="Repository directory to scan")
    parser.add_argument("--file-pattern", default="chats.json", help="File name pattern to match")
    parser.add_argument("--update-existing", action="store_true", help="Update existing Notion pages")
    parser.add_argument("--dry-run", action="store_true", help="Do not perform create/update calls; only print actions")
    parser.add_argument("--run-remote-tests", action="store_true", help="Run remote integration tests (destructive)")
    args = parser.parse_args()

    manager = WejdanAIManager()
    if args.run_remote_tests:
        manager.run_tests(run_remote_tests=True)
    else:
        manager.sync_local_chats_to_notion(repo_dir=args.repo_dir, file_pattern=args.file_pattern, update_existing=args.update_existing, dry_run=args.dry_run)
