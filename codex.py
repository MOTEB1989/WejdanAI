#!/usr/bin/env python3
import argparse
import json
import os
from typing import Any, Dict, List, Optional

import notion_importer as importer


def _print_json(obj: Any) -> None:
    print(json.dumps(obj, ensure_ascii=False, indent=2))


def cmd_sync(args: argparse.Namespace) -> int:
    """
    sync:
      - يقرأ ملفات المحادثات من المستودع
      - يرسل الجديد فقط إلى Notion (بفضل External ID)
      - يدعم dry-run لعرض ما سيتم إرساله بدون إرسال فعلي
    """
    try:
        importer.require_env()
    except Exception as exc:
        print(f"❌ إعدادات البيئة غير مكتملة: {exc}")
        return 2

    repo_dir = args.repo
    pattern = args.pattern

    files = importer.collect_chat_files(repo_dir=repo_dir, file_pattern=pattern)
    if not files:
        print("ℹ️ لا توجد ملفات مطابقة للنمط المحدد.")
        return 0

    all_chats: List[Dict[str, Any]] = []
    for file_path in files:
        print(f"🔍 قراءة الملف: {file_path}")
        all_chats.extend(importer.load_chats_from_file(file_path))

    print(f"📊 عدد المحادثات المكتشفة: {len(all_chats)}")

    ok = 0
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
        if exists:
            print(f"↩️ موجودة مسبقًا: {title} | page_id={page_id}")
            skipped += 1
            continue

        if args.dry_run:
            print(f"🧪 (dry-run) سيتم إرسال: {title} | external_id={external_id}")
            ok += 1
            continue

        if importer.add_chat_to_notion(chat):
            ok += 1
        else:
            failed += 1

    print(f"✅ انتهى sync. جديد/مرسل: {ok} | متجاهل: {skipped} | فشل: {failed}")
    return 0 if failed == 0 else 1


def cmd_validate(args: argparse.Namespace) -> int:
    """
    validate:
      - يتحقق أن الملف JSON صالح
      - ويعرض external_id لكل محادثة (مفيد قبل الرفع)
    """
    file_path = args.file
    chats = importer.load_chats_from_file(file_path)
    if not chats:
        print("❌ لا توجد محادثات أو تنسيق غير صحيح.")
        return 1

    report: List[Dict[str, Any]] = []
    for index, chat in enumerate(chats, start=1):
        if not isinstance(chat, dict):
            report.append({"index": index, "ok": False, "reason": "not_a_dict"})
            continue
        external_id = importer.stable_external_id(chat)
        report.append(
            {
                "index": index,
                "ok": True,
                "title": chat.get("title", "محادثة غير معنونة"),
                "external_id": external_id,
                "ai_tool": chat.get("ai_tool", "Other"),
                "category": chat.get("category", "بحث"),
            }
        )

    _print_json(report)
    return 0


def cmd_print_config(_: argparse.Namespace) -> int:
    """
    print-config:
      - يعرض إعدادات Notion الفعالة (بدون طباعة التوكن)
    """
    cfg = {
        "DATABASE_ID": os.getenv("DATABASE_ID"),
        "NOTION_VERSION": os.getenv("NOTION_VERSION", "2022-06-28"),
        "PROP_TITLE": importer.PROP_TITLE,
        "PROP_AI_TOOL": importer.PROP_AI_TOOL,
        "PROP_CATEGORY": importer.PROP_CATEGORY,
        "PROP_STATUS": importer.PROP_STATUS,
        "PROP_CONTENT": importer.PROP_CONTENT,
        "PROP_EXTERNAL_ID": importer.PROP_EXTERNAL_ID,
    }
    _print_json(cfg)
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="codex", description="Codex CLI for syncing AI chats into Notion."
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p_sync = sub.add_parser(
        "sync", help="Sync new chats from repo to Notion (dedupe by External ID)."
    )
    p_sync.add_argument(
        "--repo", default=".", help="Repository directory to scan (default: .)"
    )
    p_sync.add_argument(
        "--pattern",
        default="chats.json",
        help="File pattern to match (default: chats.json)",
    )
    p_sync.add_argument(
        "--dry-run", action="store_true", help="Show what would be sent without sending."
    )
    p_sync.set_defaults(func=cmd_sync)

    p_val = sub.add_parser(
        "validate", help="Validate a chats JSON file and print external IDs."
    )
    p_val.add_argument("--file", required=True, help="Path to chats JSON file.")
    p_val.set_defaults(func=cmd_validate)

    p_cfg = sub.add_parser("print-config", help="Print effective configuration (safe).")
    p_cfg.set_defaults(func=cmd_print_config)

    return parser


def main(argv: Optional[List[str]] = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return int(args.func(args))


if __name__ == "__main__":
    raise SystemExit(main())
