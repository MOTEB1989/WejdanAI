import datetime as dt
import hashlib
import json
import os
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

SUPPORTED_MODELS = [
    "gpt",
    "gemini",
    "claude",
    "perplexity",
    "kimi",
    "taskade",
    "qwen",
    "copilot",
    "openrouter",
]

DEFAULT_ROOT_DIR = os.getenv("AI_KB_ROOT", "ai_knowledge_base")


@dataclass
class AIEntry:
    id: str
    title: str
    model: str
    date: str
    tags: List[str]
    filename: str
    url: str = ""
    external_id: str = ""


def _now_iso() -> str:
    return dt.datetime.now().replace(microsecond=0).isoformat()


def _slugify(title: str, max_len: int = 60) -> str:
    title = (title or "").strip()
    title = re.sub(r"[\\/*?:\"<>|]", "", title)
    title = re.sub(r"\s+", "_", title)
    return title[:max_len] if title else "untitled"


def _sha256(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


def _read_text(path: str) -> str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def _write_text(path: str, text: str) -> None:
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


def _frontmatter_json(meta: Dict[str, Any]) -> str:
    return "---\n" + json.dumps(meta, ensure_ascii=False, indent=2) + "\n---\n"


def _parse_frontmatter_json(text: str) -> Dict[str, Any]:
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


class AIDatabase:
    def __init__(self, root_dir: str = DEFAULT_ROOT_DIR):
        self.root_dir = root_dir
        self.index_file = os.path.join(root_dir, "db_index.json")
        self._ensure_structure()

    def _ensure_structure(self) -> None:
        os.makedirs(self.root_dir, exist_ok=True)
        for model in SUPPORTED_MODELS:
            os.makedirs(os.path.join(self.root_dir, model), exist_ok=True)

    def save_entry(
        self,
        model: str,
        title: str,
        content: str,
        url: str = "",
        tags: Optional[List[str]] = None,
        allow_duplicate: bool = False,
    ) -> str:
        model = (model or "").lower().strip()
        if model not in SUPPORTED_MODELS:
            raise ValueError(f"Model '{model}' is not supported. Use: {SUPPORTED_MODELS}")

        content = (content or "").strip()
        tags = [t.strip() for t in (tags or []) if t and t.strip()]

        external_id = _sha256(f"{model}|{title.strip()}|{url.strip()}|{content[:4000]}")

        if not allow_duplicate and self._external_id_exists(external_id):
            return ""

        ts = dt.datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_title = _slugify(title)
        filename = f"{ts}_{safe_title}.md"
        rel = os.path.join(model, filename)
        file_path = os.path.join(self.root_dir, rel)

        meta = {
            "id": ts,
            "title": title,
            "model": model,
            "date": _now_iso(),
            "tags": tags,
            "url": url or "",
            "external_id": external_id,
        }

        md = []
        md.append(_frontmatter_json(meta))
        md.append(f"# {title}\n")
        if url:
            md.append(f"- Source: {url}\n")
        md.append(content)

        _write_text(file_path, "\n".join(md).strip() + "\n")

        self.reindex()
        return file_path

    def reindex(self) -> int:
        entries: List[Dict[str, Any]] = []
        for model in SUPPORTED_MODELS:
            model_dir = os.path.join(self.root_dir, model)
            if not os.path.isdir(model_dir):
                continue

            for fname in os.listdir(model_dir):
                if not fname.endswith(".md"):
                    continue

                full_path = os.path.join(model_dir, fname)
                try:
                    text = _read_text(full_path)
                    meta = _parse_frontmatter_json(text)
                    if not meta:
                        continue
                    meta["filename"] = f"{model}/{fname}"
                    entries.append(meta)
                except Exception:
                    continue

        entries.sort(key=lambda x: x.get("date", ""), reverse=True)
        _write_text(self.index_file, json.dumps(entries, ensure_ascii=False, indent=2))
        return len(entries)

    def search(
        self,
        model: Optional[str] = None,
        tag: Optional[str] = None,
        text: Optional[str] = None,
        limit: int = 20,
    ) -> List[AIEntry]:
        idx = self._load_index()

        model_f = (model or "").lower().strip() or None
        tag_f = (tag or "").lower().strip() or None
        text_f = (text or "").lower().strip() or None

        out: List[AIEntry] = []
        for item in idx:
            try:
                if model_f and str(item.get("model", "")).lower() != model_f:
                    continue

                tags = [str(t).lower() for t in (item.get("tags") or [])]
                if tag_f and tag_f not in tags:
                    continue

                if text_f:
                    hay = " ".join(
                        [
                            str(item.get("title", "")),
                            str(item.get("url", "")),
                            " ".join(tags),
                            str(item.get("filename", "")),
                        ]
                    ).lower()
                    if text_f not in hay:
                        continue

                out.append(
                    AIEntry(
                        id=str(item.get("id", "")),
                        title=str(item.get("title", "")),
                        model=str(item.get("model", "")),
                        date=str(item.get("date", "")),
                        tags=list(item.get("tags") or []),
                        filename=str(item.get("filename", "")),
                        url=str(item.get("url", "")),
                        external_id=str(item.get("external_id", "")),
                    )
                )
                if len(out) >= limit:
                    break
            except Exception:
                continue

        return out

    def _load_index(self) -> List[Dict[str, Any]]:
        if not os.path.exists(self.index_file):
            return []
        try:
            return json.loads(_read_text(self.index_file))
        except Exception:
            return []

    def _external_id_exists(self, external_id: str) -> bool:
        for item in self._load_index():
            if str(item.get("external_id", "")) == external_id:
                return True
        return False


def add_interaction(
    model: str,
    title: str,
    content_path_or_text: str,
    url: str = "",
    tags_str: str = "",
) -> str:
    db = AIDatabase()
    if os.path.exists(content_path_or_text):
        body = _read_text(content_path_or_text)
    else:
        body = content_path_or_text
    tags = [t.strip() for t in tags_str.split(",") if t.strip()] if tags_str else []
    return db.save_entry(model=model, title=title, content=body, url=url, tags=tags, allow_duplicate=False)
