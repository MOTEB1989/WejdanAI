import argparse
import os

# Chatlink (يفترض أنك تملك chatgpt_shared_ingestor.py في الجذر أو scripts حسب وضعك)
try:
    import chatgpt_shared_ingestor as chatlink
except Exception as e:
    chatlink = None
    CHATLINK_IMPORT_ERR = e

# BSM (إن كان لديك bsm_core_processor.py)
try:
    from bsm_core_processor import BSMProcessor
except Exception as e:
    BSMProcessor = None
    BSM_IMPORT_ERR = e

# Knowledge Base (ثابت داخل scripts/)
try:
    from scripts.ai_knowledge_manager import AIKnowledgeBase
except Exception as e:
    AIKnowledgeBase = None
    KB_IMPORT_ERR = e


def _ensure_chatlink():
    if chatlink is None:
        raise RuntimeError(f"chatgpt_shared_ingestor not available: {CHATLINK_IMPORT_ERR}")


def _ensure_bsm():
    if BSMProcessor is None:
        raise RuntimeError(f"bsm_core_processor not available: {BSM_IMPORT_ERR}")


def _ensure_kb():
    if AIKnowledgeBase is None:
        raise RuntimeError(f"scripts/ai_knowledge_manager not available: {KB_IMPORT_ERR}")


def cmd_ingest(args):
    os.makedirs(args.out_dir, exist_ok=True)

    # 1) BSM
    bsm_report_path = None
    if args.bsm_excel:
        _ensure_bsm()
        if not os.path.exists(args.bsm_excel):
            print(f"⚠️ BSM file not found: {args.bsm_excel}")
        else:
            proc = BSMProcessor(args.bsm_excel)
            proc.load_data()
            bsm_report_path = os.path.join(args.out_dir, "BSM_Strategic_Report.docx")

            if hasattr(proc, "generate_professional_report"):
                proc.generate_professional_report(bsm_report_path)
            elif hasattr(proc, "generate_word_report"):
                proc.generate_word_report(bsm_report_path)
            elif hasattr(proc, "generate_word"):
                proc.generate_word(bsm_report_path)
            else:
                raise RuntimeError("BSMProcessor has no report generator method.")

            print(f"📄 BSM report: {bsm_report_path}")

            if args.archive_kb:
                _ensure_kb()
                kb = AIKnowledgeBase()
                kb.add_entry(
                    title=f"BSM Strategic Analysis - {os.path.basename(args.bsm_excel)}",
                    content="Auto-ingested BSM report via codex ingest.",
                    model="bsm",
                    tags=["bsm", "fte", "automated"],
                    attach=bsm_report_path,
                )
                print("🗄️ BSM archived to KB.")

    # 2) Chat batch
    if args.chats_batch:
        _ensure_chatlink()
        if not os.path.exists(args.chats_batch):
            print(f"⚠️ Batch file not found: {args.chats_batch}")
        else:
            chatlink.process_batch_from_file(
                filepath=args.chats_batch,
                output_dir=args.out_dir,
                push_notion=args.push_notion,
                dry_run=args.dry_run,
                archive_kb=args.archive_kb,
            )

    print("✅ DONE")


def cmd_chatlink(args):
    _ensure_chatlink()

    if args.batch_file:
        chatlink.process_batch_from_file(
            filepath=args.batch_file,
            output_dir=args.out_dir or "Batch_Output",
            push_notion=args.push_notion,
            dry_run=args.dry_run,
            archive_kb=args.archive_kb,
        )
        return 0

    if args.url:
        chat = chatlink.fetch_shared_chat(args.url)
        out_dir = args.out_dir or "Output_Chat"
        os.makedirs(out_dir, exist_ok=True)

        out_docx = os.path.join(out_dir, "Chat_Link.docx")
        chatlink.write_word_report(chat, out_docx)
        print(f"📄 Saved: {out_docx}")

        if args.archive_kb:
            _ensure_kb()
            kb = AIKnowledgeBase()
            kb.add_entry(
                title=args.title or "ChatGPT Shared Chat",
                content=getattr(chat, "text", "") or getattr(chat, "content", ""),
                model="gpt",
                tags=["chat", "single"],
                url=args.url,
                attach=out_docx,
            )
            print("🗄️ Chat archived to KB.")

        if args.push_notion:
            ok, msg = chatlink.push_to_notion(
                chat,
                category=args.category or "ChatGPT Shared Link",
                status=args.status or "مكتمل",
                ai_tool=args.ai_tool or "ChatGPT",
                dry_run=args.dry_run,
            )
            print(("✅ " if ok else "❌ ") + f"Notion: {msg}")

        return 0

    print("❌ Provide either --batch-file or --url")
    return 2


def cmd_search_kb(args):
    _ensure_kb()
    kb = AIKnowledgeBase()

    results = kb.search_entries(query=args.query or "", model=args.model, tag=args.tag)
    if not results:
        print("ℹ️ لا توجد نتائج.")
        return 0

    for i, r in enumerate(results[: args.limit], start=1):
        print(f"{i}) [{r.get('model','')}] {r.get('title','')} ({r.get('date','')})")
        print(f"   file: ai_knowledge_base/{r.get('filename','')}")
        if r.get("url"):
            print(f"   url:  {r.get('url')}")
        if r.get("attachment"):
            print(f"   attach: ai_knowledge_base/{r.get('attachment')}")

    return 0


def main():
    parser = argparse.ArgumentParser(description="WejdanAI Codex CLI")
    sub = parser.add_subparsers(dest="command", required=True)

    p_ingest = sub.add_parser("ingest", help="One command: BSM + Chat Batch + Archive + Notion")
    p_ingest.add_argument("--bsm-excel", help="Path to BSM .xlsm")
    p_ingest.add_argument("--chats-batch", help="Path to links.txt or tasks.csv")
    p_ingest.add_argument("--out-dir", default="Output", help="Output directory")
    p_ingest.add_argument("--archive-kb", action="store_true")
    p_ingest.add_argument("--push-notion", action="store_true")
    p_ingest.add_argument("--dry-run", action="store_true")
    p_ingest.set_defaults(func=cmd_ingest)

    p_chat = sub.add_parser("chatlink", help="Process Chat Links (batch or single)")
    p_chat.add_argument("--url", help="Single shared URL")
    p_chat.add_argument("--title", help="Override title for single mode")
    p_chat.add_argument("--batch-file", help="Batch file path (TXT/CSV)")
    p_chat.add_argument("--out-dir", default="Output_Chat", help="Output directory")
    p_chat.add_argument("--push-notion", action="store_true")
    p_chat.add_argument("--archive-kb", action="store_true")
    p_chat.add_argument("--dry-run", action="store_true")
    p_chat.add_argument("--category")
    p_chat.add_argument("--status")
    p_chat.add_argument("--ai-tool", dest="ai_tool")
    p_chat.set_defaults(func=cmd_chatlink)

    p_kb = sub.add_parser("search-kb", help="Search Knowledge Base index")
    p_kb.add_argument("--query", default="")
    p_kb.add_argument("--model")
    p_kb.add_argument("--tag")
    p_kb.add_argument("--limit", type=int, default=20)
    p_kb.set_defaults(func=cmd_search_kb)

    args = parser.parse_args()
    raise SystemExit(args.func(args))


if __name__ == "__main__":
    main()
