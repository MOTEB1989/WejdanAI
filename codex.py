import argparse
import os

# modules
try:
    import chatgpt_shared_ingestor as chatlink
except Exception as e:
    chatlink = None
    CHATLINK_IMPORT_ERR = e

try:
    from bsm_core_processor import BSMProcessor
except Exception as e:
    BSMProcessor = None
    BSM_IMPORT_ERR = e

try:
    from ai_knowledge_manager import AIKnowledgeBase
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
        raise RuntimeError(f"ai_knowledge_manager not available: {KB_IMPORT_ERR}")


# ------------------------------------------------------------------
# 1) One Command: ingest
# ------------------------------------------------------------------
def cmd_ingest(args):
    print("\n🚀 STARTING WEJDAN UNIFIED INGEST PIPELINE")
    print("=" * 60)

    os.makedirs(args.out_dir, exist_ok=True)

    # STEP 1: BSM
    bsm_report_path = None
    if args.bsm_excel:
        try:
            _ensure_bsm()
            if not os.path.exists(args.bsm_excel):
                print(f"⚠️ BSM file not found: {args.bsm_excel}")
            else:
                print(f"\n📊 [1/3] BSM Processing: {args.bsm_excel}")
                proc = BSMProcessor(args.bsm_excel)
                proc.load_data()

                bsm_report_path = os.path.join(args.out_dir, "BSM_Strategic_Report.docx")

                # دعم اختلاف أسماء الدوال بين الإصدارات
                if hasattr(proc, "generate_professional_report"):
                    proc.generate_professional_report(bsm_report_path)
                elif hasattr(proc, "generate_word_report"):
                    proc.generate_word_report(bsm_report_path)
                elif hasattr(proc, "generate_word"):
                    proc.generate_word(bsm_report_path)
                else:
                    raise RuntimeError("BSMProcessor has no report generator method.")

                print(f"   📄 BSM report: {bsm_report_path}")

                # Archive BSM into KB
                if args.archive_kb:
                    _ensure_kb()
                    kb = AIKnowledgeBase()
                    fte_value = None
                    if hasattr(proc, "calculate_fte"):
                        try:
                            fte_value = proc.calculate_fte()
                        except Exception:
                            fte_value = None

                    summary = "Report generated automatically via ingest pipeline."
                    if fte_value is not None:
                        summary += f"\nFTE Calculated: {fte_value}"

                    kb.add_entry(
                        title=f"BSM Strategic Analysis - {os.path.basename(args.bsm_excel)}",
                        content=summary,
                        model="bsm",
                        tags=["bsm", "fte", "automated"],
                        attach=bsm_report_path,
                    )
                    print("   🗄️ BSM archived to KB.")
        except Exception as e:
            print(f"   ❌ BSM Error: {e}")
    else:
        print("\n⏭️ [1/3] Skipping BSM (no --bsm-excel provided).")

    # STEP 2: Chats batch
    if args.chats_batch:
        try:
            _ensure_chatlink()
            print(f"\n💬 [2/3] Chat Batch: {args.chats_batch}")
            if not os.path.exists(args.chats_batch):
                print(f"   ⚠️ Batch file not found: {args.chats_batch}")
            else:
                chatlink.process_batch_from_file(
                    filepath=args.chats_batch,
                    output_dir=args.out_dir,
                    push_notion=args.push_notion,
                    dry_run=args.dry_run,
                    archive_kb=args.archive_kb,
                )
        except Exception as e:
            print(f"   ❌ Chat Batch Error: {e}")
    else:
        print("\n⏭️ [2/3] Skipping Chat Batch (no --chats-batch provided).")

    # STEP 3: Done
    print("\n" + "=" * 60)
    print("✅ PIPELINE COMPLETED")
    return 0


# ------------------------------------------------------------------
# 2) chatlink command (batch and single)
# ------------------------------------------------------------------
def cmd_chatlink(args):
    _ensure_chatlink()

    # Batch
    if args.batch_file:
        chatlink.process_batch_from_file(
            filepath=args.batch_file,
            output_dir=args.out_dir or "Batch_Output",
            push_notion=args.push_notion,
            dry_run=args.dry_run,
            archive_kb=args.archive_kb,
        )
        return 0

    # Single URL
    if args.url:
        # best-effort: fetch + word + optional notion
        # يعتمد على وجود الدوال داخل chatgpt_shared_ingestor.py
        chat = chatlink.fetch_shared_chat(args.url)
        out_dir = args.out_dir or "Output_Chat"
        os.makedirs(out_dir, exist_ok=True)

        title = args.title or "ChatGPT Shared Chat"
        out_docx = os.path.join(out_dir, "Chat_Link.docx")

        chatlink.write_word_report(chat, out_docx)
        print(f"📄 Saved: {out_docx}")

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


def main():
    parser = argparse.ArgumentParser(description="WejdanAI Integrated System")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # ingest
    p_ingest = subparsers.add_parser("ingest", help="One command: BSM + Chat Batch + Archive + Notion")
    p_ingest.add_argument("--bsm-excel", help="Path to BSM Master Register .xlsm")
    p_ingest.add_argument("--chats-batch", help="Path to links.txt or tasks.csv")
    p_ingest.add_argument("--out-dir", default="Output_Ingest", help="Directory for all reports")
    p_ingest.add_argument("--archive-kb", action="store_true", help="Archive outputs to Knowledge Base")
    p_ingest.add_argument("--push-notion", action="store_true", help="Push summaries to Notion")
    p_ingest.add_argument("--dry-run", action="store_true", help="Simulate Notion push")
    p_ingest.set_defaults(func=cmd_ingest)

    # chatlink
    p_chat = subparsers.add_parser("chatlink", help="Process Chat Links (batch or single)")
    p_chat.add_argument("--url", help="Single shared URL")
    p_chat.add_argument("--title", help="Override title for single mode")
    p_chat.add_argument("--batch-file", help="Batch file path (TXT/CSV)")
    p_chat.add_argument("--out-dir", default="Output_Chat", help="Output directory")
    p_chat.add_argument("--push-notion", action="store_true")
    p_chat.add_argument("--archive-kb", action="store_true")
    p_chat.add_argument("--dry-run", action="store_true")
    p_chat.add_argument("--category", help="Notion Category")
    p_chat.add_argument("--status", help="Notion Status")
    p_chat.add_argument("--ai-tool", dest="ai_tool", help="Notion AI Tool")
    p_chat.set_defaults(func=cmd_chatlink)

    args = parser.parse_args()
    raise SystemExit(args.func(args))


if __name__ == "__main__":
    main()
