#!/usr/bin/env python3
import argparse
from typing import Any, Dict, List, Optional

import ai_model_manager
import notion_importer as importer


def cmd_sync(args: argparse.Namespace) -> int:
    importer.require_env()

    files = importer.collect_chat_files(repo_dir=args.repo_dir, file_pattern=args.file_pattern)
    if not files:
        print("ℹ️ لا توجد ملفات مطابقة.")
        return 0

    all_chats: List[Dict[str, Any]] = []
    for file_path in files:
        print(f"🔍 {file_path}")
        all_chats.extend(importer.load_chats_from_file(file_path))

    created = updated = skipped = failed = 0
    for chat in all_chats:
        if not isinstance(chat, dict):
            skipped += 1
            continue

        title = str(chat.get("title", "محادثة غير معنونة"))
        external_id = importer.stable_external_id(chat)
        exists, page_id = importer.notion_page_exists_by_external_id(external_id)

        if args.dry_run:
            if exists and page_id:
                print(f"🧪 (dry-run) {'UPDATE' if args.update_existing else 'SKIP'}: {title}")
            else:
                print(f"🧪 (dry-run) CREATE: {title}")
            continue

        if exists and page_id:
            if args.update_existing:
                ok = importer.update_chat_in_notion(page_id, chat)
                updated += 1 if ok else 0
                failed += 0 if ok else 1
            else:
                print(f"↩️ Skip existing: {title}")
                skipped += 1
        else:
            ok = importer.add_chat_to_notion(chat)
            created += 1 if ok else 0
            failed += 0 if ok else 1

    print(f"✅ Done. Created={created} Updated={updated} Skipped={skipped} Failed={failed}")
    return 0 if failed == 0 else 1


def cmd_validate(args: argparse.Namespace) -> int:
    chats = importer.load_chats_from_file(args.file)
    if not chats:
        print("❌ ملف غير صالح أو فارغ.")
        return 1
    for i, chat in enumerate(chats, start=1):
        if isinstance(chat, dict):
            print(f"#{i} ✅ {chat.get('title','(no title)')} | {importer.stable_external_id(chat)}")
        else:
            print(f"#{i} ❌ not dict")
    return 0


def cmd_archive(args: argparse.Namespace) -> int:
    try:
        path = ai_model_manager.add_interaction(
            model=args.model,
            title=args.title,
            content_path_or_text=args.file,
            url=args.url or "",
            tags_str=args.tags or "",
        )
        if not path:
            print("↩️ تم تجاوز الأرشفة: موجود مسبقًا (External ID).")
            return 0
        print(f"✅ Archived: {path}")
        return 0
    except Exception as e:
        print(f"❌ Archive failed: {e}")
        return 2


def cmd_search(args: argparse.Namespace) -> int:
    db = ai_model_manager.AIDatabase()
    results = db.search(model=args.model, tag=args.tag, text=args.text, limit=args.limit)
    if not results:
        print("ℹ️ لا توجد نتائج.")
        return 0

    for r in results:
        print(f"- [{r.model}] {r.title} ({r.date})")
        print(f"  file: {db.root_dir}/{r.filename}")
        if r.url:
            print(f"  url:  {r.url}")
    return 0


def cmd_reindex(_args: argparse.Namespace) -> int:
    db = ai_model_manager.AIDatabase()
    n = db.reindex()
    print(f"✅ Reindexed: {n} records")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Codex CLI")
    sub = parser.add_subparsers(dest="command", required=True)

    sync_parser = sub.add_parser("sync", help="Sync chats to Notion")
    sync_parser.add_argument("--repo-dir", default=".")
    sync_parser.add_argument("--file-pattern", default="chats.json")
    sync_parser.add_argument("--update-existing", action="store_true")
    sync_parser.add_argument("--dry-run", action="store_true")
    sync_parser.set_defaults(func=cmd_sync)

    validate_parser = sub.add_parser("validate", help="Validate JSON")
    validate_parser.add_argument("--file", required=True)
    validate_parser.set_defaults(func=cmd_validate)

    archive_parser = sub.add_parser("archive", help="Save AI interaction to the Github Knowledge Base")
    archive_parser.add_argument("--model", required=True, choices=ai_model_manager.SUPPORTED_MODELS)
    archive_parser.add_argument("--title", required=True)
    archive_parser.add_argument("--file", required=True, help="Path to text file OR raw text")
    archive_parser.add_argument("--url")
    archive_parser.add_argument("--tags", help="Comma separated tags (e.g. 'code,python,fix')")
    archive_parser.set_defaults(func=cmd_archive)

    search_parser = sub.add_parser("search", help="Search the knowledge base index")
    search_parser.add_argument("--model", choices=ai_model_manager.SUPPORTED_MODELS)
    search_parser.add_argument("--tag")
    search_parser.add_argument("--text", help="Free text filter over title/url/tags/filename")
    search_parser.add_argument("--limit", type=int, default=20)
    search_parser.set_defaults(func=cmd_search)

    reindex_parser = sub.add_parser("reindex", help="Rebuild db_index.json from markdown files")
    reindex_parser.set_defaults(func=cmd_reindex)

    return parser


def main(argv: Optional[List[str]] = None) -> int:
    args = build_parser().parse_args(argv)
    return int(args.func(args))


if __name__ == "__main__":
    raise SystemExit(main())
