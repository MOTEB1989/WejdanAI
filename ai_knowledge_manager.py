import os
import re
import json
import shutil
import hashlib
import datetime
from typing import List, Optional, Dict, Any


class AIKnowledgeBase:
    """
    Flat-file Knowledge Base:
    - Records: Markdown files with JSON frontmatter (--- {..json..} ---)
    - Tables: model folders
    - Index: ai_knowledge_base/db_index.json rebuilt from files
    - Attachments: ai_knowledge_base/_attachments/<external_id>/<filename>
    """

    def __init__(self, root_dir: str = "ai_knowledge_base"):
        self.root_dir = root_dir
        self.index_file = os.path.join(root_dir, "db_index.json")
        self.attachments_dir = os.path.join(root_dir, "_attachments")

        # نماذج افتراضية (يمكنك إضافة غيرها، وسيُنشأ مجلدها تلقائيًا أيضًا)
        self.supported_models = ["gpt", "claude", "gemini", "copilot", "bsm"]

        os.makedirs(self.root_dir, exist_ok=True)
        os.makedirs(self.attachments_dir, exist_ok=True)

        # تأكد من وجود مجلدات النماذج دائمًا (حتى لو كان root_dir موجود مسبقًا)
        for model in self.supported_models:
            os.makedirs(os.path.join(self.root_dir, model), exist_ok=True)

        # تأكد من وجود index
        if not os.path.exists(self.index_file):
            with open(self.index_file, "w", encoding="utf-8") as f:
                json.dump([], f, ensure_ascii=False, indent=2)

    # -------------------------
    # Helpers
    # -------------------------
    def _slugify(self, text: str) -> str:
        # يدعم العربية + اللاتينية + الأرقام
        text = re.sub(r"[^\w\s\u0600-\u06FF-]", "", str(text or "")).strip().lower()
        return re.sub(r"[-\s]+", "_", text)

    def _sha256(self, s: str) -> str:
        return hashlib.sha256(s.encode("utf-8")).hexdigest()

    def _compute_external_id(self, model: str, title: str, content: str, url: str = "") -> str:
        key = f"{model}|{title}|{url}|{(content or '')[:4000]}"
        return self._sha256(key)

    def _read_text(self, path: str) -> str:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    def _write_text(self, path: str, text: str) -> None:
        with open(path, "w", encoding="utf-8") as f:
            f.write(text)

    def _frontmatter_json(self, meta: Dict[str, Any]) -> str:
        return "---\n" + json.dumps(meta, ensure_ascii=False, indent=2) + "\n---\n"

    def _parse_frontmatter_json(self, text: str) -> Dict[str, Any]:
        if not text.startswith("---"):
            return {}
        end = text.find("---", 3)
        if end == -1:
            return {}
        raw = text[3:end].strip()
        try:
            return json.loads(raw)
        except Exception:
            return {}

    def _copy_attachment(self, external_id: str, attach_path: str) -> str:
        """
        Copy attachment to KB attachments folder and return relative path within KB.
        """
        if not attach_path:
            return ""
        if not os.path.exists(attach_path):
            raise FileNotFoundError(f"Attachment not found: {attach_path}")

        dest_dir = os.path.join(self.attachments_dir, external_id)
        os.makedirs(dest_dir, exist_ok=True)

        safe_name = os.path.basename(attach_path)
        dest_path = os.path.join(dest_dir, safe_name)

        # لا نستبدل لو موجود
        if not os.path.exists(dest_path):
            shutil.copy2(attach_path, dest_path)

        rel = os.path.relpath(dest_path, start=self.root_dir)
        return rel.replace("\\", "/")

    def _external_id_exists(self, external_id: str) -> bool:
        # يعتمد على الفهرس الحالي (سريع). في حال فهرس قديم، rebuild_index يصلحه.
        if not os.path.exists(self.index_file):
            return False
        try:
            idx = json.loads(self._read_text(self.index_file))
        except Exception:
            return False
        return any(str(e.get("external_id", "")) == external_id for e in idx)

    # -------------------------
    # Core operations
    # -------------------------
    def add_entry(
        self,
        title: str,
        content: str,
        model: str,
        tags: Optional[List[str]] = None,
        url: str = "",
        attach: str = "",
        allow_duplicate: bool = False,
    ) -> Optional[str]:
        """
        Add a new KB entry.
        - Dedupe by external_id unless allow_duplicate=True
        - Copies attachment into KB if provided
        - Rebuilds index from files (source of truth)
        """
        model = (model or "").strip().lower()
        if not model:
            raise ValueError("model is required")

        # مرونة: إن لم يكن ضمن القائمة، ننشئ مجلده ونضيفه للقائمة
        if model not in self.supported_models:
            os.makedirs(os.path.join(self.root_dir, model), exist_ok=True)
            self.supported_models.append(model)

        tags = [t.strip() for t in (tags or []) if t and t.strip()]
        content = (content or "").strip()
        title = str(title or "").strip() or "Untitled"

        timestamp = datetime.datetime.now().replace(microsecond=0)
        date_str = timestamp.strftime("%Y%m%d_%H%M%S")
        safe_title = self._slugify(title)[:80] or "untitled"
        filename = f"{date_str}_{safe_title}.md"
        relative_path = os.path.join(model, filename).replace("\\", "/")
        full_path = os.path.join(self.root_dir, relative_path)

        external_id = self._compute_external_id(model=model, title=title, content=content, url=url)

        if (not allow_duplicate) and self._external_id_exists(external_id):
            # لا ننشئ ملفًا جديدًا
            return None

        attachment_rel = ""
        if attach:
            attachment_rel = self._copy_attachment(external_id, attach)

        frontmatter = {
            "id": date_str,
            "external_id": external_id,
            "title": title,
            "date": timestamp.isoformat(),
            "model": model,
            "tags": tags,
            "url": url or "",
            "attachment": attachment_rel,
        }

        md = []
        md.append(self._frontmatter_json(frontmatter))
        md.append(f"# {title}\n")
        if url:
            md.append(f"- Source: {url}\n")
        if attachment_rel:
            md.append(f"- Attachment: `{attachment_rel}`\n")
        md.append(content)
        md_text = "\n".join(md).strip() + "\n"

        self._write_text(full_path, md_text)

        # مصدر الحقيقة للفهرس: الملفات
        self.rebuild_index()
        return full_path

    def rebuild_index(self) -> int:
        """
        Rebuild db_index.json by scanning markdown files.
        """
        entries: List[Dict[str, Any]] = []

        # اجلب كل المجلدات داخل KB عدا _attachments
        for model in os.listdir(self.root_dir):
            if model == "_attachments":
                continue
            model_dir = os.path.join(self.root_dir, model)
            if not os.path.isdir(model_dir):
                continue

            for fname in os.listdir(model_dir):
                if not fname.endswith(".md"):
                    continue
                full_path = os.path.join(model_dir, fname)

                try:
                    text = self._read_text(full_path)
                    meta = self._parse_frontmatter_json(text)
                    if not meta:
                        continue
                    meta["filename"] = f"{model}/{fname}"
                    entries.append(meta)
                except Exception:
                    continue

        # أحدث أولًا
        entries.sort(key=lambda x: str(x.get("date", "")), reverse=True)
        self._write_text(self.index_file, json.dumps(entries, ensure_ascii=False, indent=2))
        return len(entries)

    def search_entries(self, query: str = "", model: Optional[str] = None, tag: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Search index by:
        - model exact match
        - tag membership
        - query in title OR filename OR url
        """
        if not os.path.exists(self.index_file):
            return []

        try:
            entries = json.loads(self._read_text(self.index_file))
        except Exception:
            return []

        q = (query or "").strip().lower()
        m = (model or "").strip().lower() or None
        t = (tag or "").strip().lower() or None

        results = []
        for entry in entries:
            if m and str(entry.get("model", "")).lower() != m:
                continue

            if t:
                tags = [str(x).lower() for x in (entry.get("tags") or [])]
                if t not in tags:
                    continue

            if q:
                hay = " ".join([
                    str(entry.get("title", "")),
                    str(entry.get("filename", "")),
                    str(entry.get("url", "")),
                ]).lower()
                if q not in hay:
                    continue

            results.append(entry)

        return results
