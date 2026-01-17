import hashlib
import json
import os
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import requests

NOTION_TOKEN = os.getenv("NOTION_TOKEN", "")
DATABASE_ID = os.getenv("DATABASE_ID", "")
NOTION_VERSION = os.getenv("NOTION_VERSION", "2022-06-28")

PROP_TITLE = os.getenv("NOTION_PROP_TITLE", "Title")
PROP_AI_TOOL = os.getenv("NOTION_PROP_AI_TOOL", "AI Tool")
PROP_CATEGORY = os.getenv("NOTION_PROP_CATEGORY", "Category")
PROP_STATUS = os.getenv("NOTION_PROP_STATUS", "Status")
PROP_CONTENT = os.getenv("NOTION_PROP_CONTENT", "Content")
PROP_EXTERNAL_ID = os.getenv("NOTION_PROP_EXTERNAL_ID", "External ID")
DEFAULT_STATUS = os.getenv("NOTION_DEFAULT_STATUS", "New")


def require_env() -> None:
    missing = []
    if not NOTION_TOKEN:
        missing.append("NOTION_TOKEN")
    if not DATABASE_ID:
        missing.append("DATABASE_ID")
    if missing:
        raise SystemExit(f"❌ Missing required env: {', '.join(missing)}")


def request_with_retry(method: str, url: str, json_body: Optional[Dict[str, Any]] = None) -> requests.Response:
    headers = {
        "Authorization": f"Bearer {NOTION_TOKEN}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    }

    for attempt in range(5):
        resp = requests.request(method, url, headers=headers, json=json_body, timeout=30)
        if resp.status_code < 500 and resp.status_code != 429:
            return resp
        time.sleep(2**attempt)
    return resp


def collect_chat_files(repo_dir: str, file_pattern: str) -> List[str]:
    root = Path(repo_dir)
    if not root.exists():
        return []
    files = sorted(str(path) for path in root.rglob(file_pattern))
    return files


def load_chats_from_file(path: str) -> List[Dict[str, Any]]:
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    if isinstance(data, list):
        return data
    if isinstance(data, dict) and isinstance(data.get("chats"), list):
        return data["chats"]
    return []


def stable_external_id(chat: Dict[str, Any]) -> str:
    payload = json.dumps(chat, ensure_ascii=False, sort_keys=True)
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def chunk_rich_text(content: str, chunk_size: int = 2000) -> List[Dict[str, Any]]:
    chunks = [content[i : i + chunk_size] for i in range(0, len(content), chunk_size)]
    return [{"text": {"content": chunk}} for chunk in chunks]


def notion_page_exists_by_external_id(external_id: str) -> Tuple[bool, Optional[str]]:
    url = f"https://api.notion.com/v1/databases/{DATABASE_ID}/query"
    body = {
        "filter": {"property": PROP_EXTERNAL_ID, "rich_text": {"equals": external_id}},
        "page_size": 1,
    }
    resp = request_with_retry("POST", url, json_body=body)
    if resp.status_code != 200:
        print(f"❌ فشل البحث عن External ID: {external_id}\n{resp.text}")
        return False, None

    data = resp.json()
    results = data.get("results", [])
    if not results:
        return False, None

    return True, results[0].get("id")


def add_chat_to_notion(chat: Dict[str, Any]) -> bool:
    title = str(chat.get("title", "محادثة غير معنونة"))
    ai_tool = str(chat.get("ai_tool", "Other"))
    category = str(chat.get("category", "بحث"))
    content = str(chat.get("content", ""))
    external_id = stable_external_id(chat)

    url = "https://api.notion.com/v1/pages"
    body = {
        "parent": {"database_id": DATABASE_ID},
        "properties": {
            PROP_TITLE: {"title": [{"text": {"content": title}}]},
            PROP_AI_TOOL: {"select": {"name": ai_tool}},
            PROP_CATEGORY: {"select": {"name": category}},
            PROP_STATUS: {"status": {"name": DEFAULT_STATUS}},
            PROP_CONTENT: {"rich_text": chunk_rich_text(content)},
            PROP_EXTERNAL_ID: {"rich_text": [{"text": {"content": external_id}}]},
        },
    }

    resp = request_with_retry("POST", url, json_body=body)
    if resp.status_code == 200:
        print(f"✅ تمت إضافة المحادثة: {title} | external_id={external_id}")
        return True

    print(f"❌ خطأ في الإضافة: {title}\n{resp.text}")
    return False


def update_chat_in_notion(page_id: str, chat: Dict[str, Any]) -> bool:
    """
    تحديث صفحة موجودة في Notion. (Upsert path)
    - يحدث الخصائص الأساسية + المحتوى
    - لا يغيّر External ID لأنه هو مفتاح التطابق
    """
    title = str(chat.get("title", "محادثة غير معنونة"))
    ai_tool = str(chat.get("ai_tool", "Other"))
    category = str(chat.get("category", "بحث"))
    content = str(chat.get("content", ""))

    url = f"https://api.notion.com/v1/pages/{page_id}"
    body = {
        "properties": {
            PROP_TITLE: {"title": [{"text": {"content": title}}]},
            PROP_AI_TOOL: {"select": {"name": ai_tool}},
            PROP_CATEGORY: {"select": {"name": category}},
            PROP_STATUS: {"status": {"name": DEFAULT_STATUS}},
            PROP_CONTENT: {"rich_text": chunk_rich_text(content)},
        }
    }

    resp = request_with_retry("PATCH", url, json_body=body)
    if resp.status_code == 200:
        print(f"♻️ تم تحديث المحادثة: {title} | page_id={page_id}")
        return True

    print(f"❌ خطأ في تحديث: {title} | page_id={page_id}\n{resp.text}")
    return False
