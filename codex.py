#!/usr/bin/env python3
import argparse
import json
import os
from typing import Any, Dict, List, Optional

try:
    import notion_importer as importer
except ImportError as e:
    print("❌ Error: required module `notion_importer` not found.")
    print(
        "   Please ensure `notion_importer.py` exists in the repo and is imported correctly.\n"
    )
    raise


# Default values for chat fields (used when fields are missing)
DEFAULT_AI_TOOL = "Other"
DEFAULT_CATEGORY = "بحث"


def _print_json(obj: Any) -> None:
    print(json.dumps(obj, ensure_ascii=False, indent=2))


def cmd_sync(args: argparse.Namespace) -> int:
    """
    sync:
      - يقرأ ملفات المحادثات من المستودع
      - يرسل الجديد فقط إلى Notion (بفضل External ID)
      - يدعم dry-run لعرض ما سيتم إرساله بدون إرسال فعلي
    
    Exit codes:
      0 = success (all chats synced successfully)
      1 = failures occurred during sync
      2 = environment configuration error
    """
    try:
        importer.require_env()
    except Exception as exc:
        print(f"❌ إعدادات البيئة غير مكتملة: {exc}")
        import traceback
        traceback.print_exc()
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
        try:
            chats = importer.load_chats_from_file(file_path)
            all_chats.extend(chats)
        except Exception as exc:
            print(f"❌ فشل قراءة الملف {file_path}: {exc}")
            return 1

    print(f"📊 عدد المحادثات المكتشفة: {len(all_chats)}")

    successfully_synced = 0
    skipped = 0
    failed = 0

    for chat in all_chats:
        if not isinstance(chat, dict):
            print("⚠️ تم تجاهل عنصر ليس dict داخل القائمة.")
            skipped += 1
            continue

        title = str(chat.get("title", "محادثة غير معنونة"))
        external_id = importer.stable_external_id(chat)

        try:
            exists, page_id = importer.notion_page_exists_by_external_id(external_id)
        except Exception as exc:
            print(f"❌ تعذر التحقق من وجود الصفحة في Notion لـ external_id={external_id}: {exc}")
            failed += 1
            continue

        if exists:
            print(f"↩️ موجودة مسبقًا: {title} | page_id={page_id}")
            skipped += 1
            continue

        if args.dry_run:
            print(f"🧪 (dry-run) سيتم إرسال: {title} | external_id={external_id}")
            successfully_synced += 1
            continue

        try:
            if importer.add_chat_to_notion(chat):
                successfully_synced += 1
            else:
                failed += 1
        except Exception as exc:
            print(f"❌ فشل إرسال المحادثة إلى Notion: {title} | external_id={external_id} | الخطأ: {exc}")
            failed += 1

    print(f"✅ انتهى sync. جديد/مرسل: {successfully_synced} | متجاهل: {skipped} | فشل: {failed}")
    return 0 if failed == 0 else 1


def cmd_validate(args: argparse.Namespace) -> int:
    """
    validate:
      - يتحقق أن الملف JSON صالح
      - ويعرض external_id لكل محادثة (مفيد قبل الرفع)
    """
    file_path = args.file
    
    try:
        chats = importer.load_chats_from_file(file_path)
    except FileNotFoundError:
        print(f"❌ لم يتم العثور على الملف: {file_path}")
        return 1
    except json.JSONDecodeError as exc:
        print(f"❌ فشل في قراءة JSON من الملف: {file_path}")
        print(f"   التفاصيل: {exc}")
        return 1
    except OSError as exc:
        print(f"❌ تعذر قراءة الملف: {file_path}")
        print(f"   التفاصيل: {exc}")
        return 1
    except Exception as exc:
        print(f"❌ حدث خطأ غير متوقع أثناء تحميل الملف: {file_path}")
        print(f"   التفاصيل: {exc}")
        return 1
    
    if not chats:
        print("❌ لا توجد محادثات أو تنسيق غير صحيح.")
        return 1

    report: List[Dict[str, Any]] = []
    for index, chat in enumerate(chats, start=1):
        if not isinstance(chat, dict):
            report.append({"index": index, "ok": False, "reason": "not_a_dict"})
            continue
        
        try:
            external_id = importer.stable_external_id(chat)
        except Exception as exc:
            report.append(
                {
                    "index": index,
                    "ok": False,
                    "reason": "stable_external_id_error",
                    "error": str(exc),
                }
            )
            continue
        
        report.append(
            {
                "index": index,
                "ok": True,
                "title": chat.get("title", "محادثة غير معنونة"),
                "external_id": external_id,
                "ai_tool": chat.get("ai_tool", DEFAULT_AI_TOOL),
                "category": chat.get("category", DEFAULT_CATEGORY),
            }
        )

    _print_json(report)
    return 0


def cmd_print_config(_: argparse.Namespace) -> int:
    """
    print-config:
      - يعرض إعدادات Notion الفعالة (بدون طباعة التوكن)
      
    Warning: This command outputs configuration values that may contain
    sensitive information. Use with caution in shared environments.
    """
    cfg = {
        "DATABASE_ID": os.getenv("DATABASE_ID"),
        "NOTION_VERSION": os.getenv("NOTION_VERSION", "2022-06-28"),
        "PROP_TITLE": getattr(importer, "PROP_TITLE", None),
        "PROP_AI_TOOL": getattr(importer, "PROP_AI_TOOL", None),
        "PROP_CATEGORY": getattr(importer, "PROP_CATEGORY", None),
        "PROP_STATUS": getattr(importer, "PROP_STATUS", None),
        "PROP_CONTENT": getattr(importer, "PROP_CONTENT", None),
        "PROP_EXTERNAL_ID": getattr(importer, "PROP_EXTERNAL_ID", None),
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

    p_cfg = sub.add_parser(
        "print-config", 
        help="Print effective configuration (WARNING: may contain sensitive data)."
    )
    p_cfg.set_defaults(func=cmd_print_config)

    return parser


def main(argv: Optional[List[str]] = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return int(args.func(args))


if __name__ == "__main__":
    raise SystemExit(main())
