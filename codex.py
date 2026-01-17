#!/usr/bin/env python3
import argparse
from typing import Any, Dict, List, Optional

import notion_importer as importer


def cmd_sync(args: argparse.Namespace) -> int:
    """
    - يقرأ ملفات chats من المستودع
    - dedupe عبر External ID
    - إن كانت --update-existing: يحدث الصفحة بدل التخطي
    - إن كانت --dry-run: لا ينشئ/لا يحدث، فقط يطبع القرار
    """
    importer.require_env()

    files = importer.collect_chat_files(repo_dir=args.repo_dir, file_pattern=args.file_pattern)
    if not files:
        print("ℹ️ لا توجد ملفات مطابقة للنمط المحدد.")
        return 0

    all_chats: List[Dict[str, Any]] = []
    for fp in files:
        print(f"🔍 يُفحص الملف: {fp}")
        all_chats.extend(importer.load_chats_from_file(fp))

    print(f"📊 عدد المحادثات المكتشفة: {len(all_chats)}")

    created = 0
    updated = 0
    skipped = 0
    failed = 0

    for chat in all_chats:
        if not isinstance(chat, dict):
            print("⚠️ تم تجاهل عنصر ليس dict داخل القائمة.")
            skipped += 1
            continue

        title = str(chat.get("title", "محادثة غير معنونة"))
        external_id = importer.stable_external_id(chat)

        exists, page_id = importer.notion_page_exists_by_external_id(external_id)

        # Dry-run: لا كتابة على Notion
        if args.dry_run:
            if exists and page_id:
                if args.update_existing:
                    print(f"🧪 (dry-run) UPDATE: {title} | page_id={page_id}")
                else:
                    print(f"🧪 (dry-run) SKIP:   {title} | page_id={page_id}")
            else:
                print(f"🧪 (dry-run) CREATE: {title} | external_id={external_id}")
            continue

        # تنفيذ فعلي
        if exists and page_id:
            if args.update_existing:
                ok = importer.update_chat_in_notion(page_id, chat)
                if ok:
                    updated += 1
                else:
                    failed += 1
            else:
                print(f"↩️ تم تجاوز محادثة موجودة: {title} | page_id={page_id}")
                skipped += 1
        else:
            ok = importer.add_chat_to_notion(chat)
            if ok:
                created += 1
            else:
                failed += 1

    print(
        f"✅ انتهى sync. "
        f"Created: {created} | Updated: {updated} | Skipped: {skipped} | Failed: {failed}"
    )
    return 0 if failed == 0 else 1


def cmd_validate(args: argparse.Namespace) -> int:
    chats = importer.load_chats_from_file(args.file)
    if not chats:
        print("❌ لا توجد محادثات أو تنسيق غير صحيح.")
        return 1

    for i, chat in enumerate(chats, start=1):
        if not isinstance(chat, dict):
            print(f"#{i}: ❌ not a dict")
            continue
        ext = importer.stable_external_id(chat)
        title = str(chat.get("title", "محادثة غير معنونة"))
        print(f"#{i}: ✅ {title} | external_id={ext}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Codex: Notion Chat Sync Tool")
    sub = p.add_subparsers(dest="command", required=True)

    p_sync = sub.add_parser("sync", help="Sync chats to Notion")
    p_sync.add_argument("--repo-dir", dest="repo_dir", default=".", help="Repository directory to scan")
    p_sync.add_argument("--file-pattern", dest="file_pattern", default="chats.json", help="Pattern for JSON files")
    p_sync.add_argument("--update-existing", action="store_true", help="Update existing Notion pages instead of skipping")
    p_sync.add_argument("--dry-run", action="store_true", help="Print actions without writing to Notion")
    p_sync.set_defaults(func=cmd_sync)

    p_val = sub.add_parser("validate", help="Validate a chats JSON file and print external IDs")
    p_val.add_argument("--file", required=True, help="Path to chats JSON file")
    p_val.set_defaults(func=cmd_validate)

    return p


def main(argv: Optional[List[str]] = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return int(args.func(args))


if __name__ == "__main__":
    raise SystemExit(main())
