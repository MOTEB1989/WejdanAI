---
name: Postgres + Nuxt Starter
slug: postgres-nuxt
description: Simple Nuxt template that uses a Postgres database.
framework: Nuxt
useCase: Starter
css: Tailwind
database: Postgres
deployUrl: https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fexamples%2Ftree%2Fmain%2Fstorage%2Fpostgres-nuxt&project-name=postgres-nuxt&repository-name=postgres-nuxt&demo-title=Vercel%20Postgres%20%2B%20Nuxt%20Starter&demo-description=Simple%20Nuxt%20template%20that%20uses%20Vercel%20Postgres%20as%20the%20database&demo-url=https%3A%2F%2Fpostgres-nuxt.vercel.app%2F&demo-image=https%3A%2F%2Fpostgres-nuxt.vercel.app%2Fopengraph-image.png&products=%5B%7B%22type%22%3A%22integration%22%2C%22group%22%3A%22postgres%22%7D%5D
demoUrl: https://postgres-nuxt.vercel.app/
relatedTemplates:
  - postgres-starter
  - postgres-prisma
  - postgres-sveltekit
---

# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## CLI (اختياري)

### Overview / نظرة عامة

The `codex.py` CLI tool provides commands for syncing AI chat conversations to Notion with automatic deduplication. It requires the `notion_importer` module to be present in the repository.

### Prerequisites / المتطلبات

- Python 3.x
- `notion_importer.py` module (must be present in the repository)
- Notion API token and Database ID (set as environment variables)

### Chat File Format / تنسيق ملف المحادثات

The CLI expects a JSON file (default: `chats.json`) containing an array of chat objects with the following structure:

```json
[
  {
    "title": "Chat title",
    "ai_tool": "ChatGPT",
    "category": "بحث",
    "content": "Chat content..."
  }
]
```

### Usage / الاستخدام

تشغيل مزامنة محلية:

```bash
export NOTION_TOKEN="..."
export DATABASE_ID="..."
python codex.py sync
```

Dry-run:

```bash
python codex.py sync --dry-run
```

التحقق من ملف محادثات:

```bash
python codex.py validate --file chats.json
```

عرض الإعدادات الفعالة:

```bash
python codex.py print-config
```

### Exit Codes / رموز الخروج

- `0`: Success
- `1`: Sync failures occurred or validation error
- `2`: Environment configuration error
