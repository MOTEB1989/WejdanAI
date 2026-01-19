# WejdanAI – Usage Guide

هذا الملف يوضح الأوامر الأساسية بعد آخر تحديثات (BSM + Chat Ingest + Knowledge Base).

---

## 1) BSM Processor (Excel → FTE → Word)

### تشغيل محلي
```bash
python bsm_core_processor.py
```

تخصيص المسارات عبر متغيرات بيئة (موصى به)

```bash
export BSM_XLSM_PATH="BSM_Final_Unified_Master_Register.xlsm"
export BSM_REPORT_OUT="BSM_Strategic_Report.docx"
python bsm_core_processor.py
```

---

## 2) Chat Ingest – رابط واحد (Single)

إذا كان الرابط يتطلب تسجيل دخول، استخدم --input-file (ملف نصي من تصدير المحادثة).

```bash
python codex.py chatlink --url "https://chatgpt.com/s/..." --out "Chat_Link.docx"
```

من ملف نصي:

```bash
python codex.py chatlink --input-file chat.txt --title "Chat Export" --out "Chat_Link.docx"
```

إرسال إلى Notion (اختياري):

```bash
export NOTION_TOKEN="..."
export DATABASE_ID="..."
python codex.py chatlink --input-file chat.txt --push-notion --dry-run
python codex.py chatlink --input-file chat.txt --push-notion
```

---

## 3) Chat Ingest – Batch (TXT/CSV)

Batch من ملف TXT (كل سطر رابط)

```bash
python codex.py chatlink --batch-file links.txt --out-dir Batch_Output
```

Batch من CSV (أعمدة اختيارية: url,title,category,status)

```bash
python codex.py chatlink --batch-file links.csv --out-dir Batch_Output
```

Batch + Notion:

```bash
python codex.py chatlink --batch-file links.txt --out-dir Batch_Output --push-notion --dry-run
python codex.py chatlink --batch-file links.txt --out-dir Batch_Output --push-notion
```

---

## 4) Knowledge Base (Archive/Search/Rebuild)

إضافة سجل جديد

```bash
python wejdan_cli.py add --title "عنوان" --model gpt --tags finance,analysis --content notes.txt
```

بحث

```bash
python wejdan_cli.py search --query "FTE"
python wejdan_cli.py search --tag finance
python wejdan_cli.py search --model gpt
```

إعادة بناء الفهرس

```bash
python wejdan_cli.py rebuild
```

---

## 5) ملاحظات إعداد Notion

تأكد من وجود Secrets:

- NOTION_TOKEN
- DATABASE_ID

وتأكد أن قاعدة البيانات تحتوي خصائص مثل:

- Page Title (Title)
- External ID (Rich text)
- Conversation Content (Rich text)
- Category (Select)
- Status (Status)

---

### اقتراح صغير يزيد الراحة

إذا تبي “كل شيء من codex.py فقط”، ممكن دمج أوامر `wejdan_cli.py` داخله لاحقًا (archive/search/rebuild) حتى ما تتذكر ملفين.
