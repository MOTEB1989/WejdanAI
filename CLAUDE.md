# CLAUDE.md - WejdanAI Repository Guide

**Last Updated**: 2026-01-17
**Purpose**: Guide for AI assistants working with the WejdanAI codebase

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Repository Structure](#repository-structure)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Development Workflows](#development-workflows)
7. [Notion Integration (Codex)](#notion-integration-codex)
8. [Frontend Components](#frontend-components)
9. [Coding Conventions](#coding-conventions)
10. [Testing & CI/CD](#testing--cicd)
11. [Deployment](#deployment)
12. [Common Tasks](#common-tasks)

---

## Project Overview

**WejdanAI** is a full-stack application combining:
- A Nuxt 3 web application for operations management (Banking COP - Operations in Banking)
- A REST API logging system for AI conversation tracking
- Python-based Notion integration for knowledge management
- PostgreSQL database for user profiles and logs

**Primary Use Cases**:
1. Operations playbook and task management dashboard
2. AI chat logging and conversation history
3. Notion database synchronization for chat archival
4. User profile management

**Language Support**: Arabic and English

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend Framework** | Nuxt | 3.4.2 |
| **UI Framework** | Vue 3 | (via Nuxt) |
| **Backend** | Nuxt Server Routes | (h3 framework) |
| **Database** | PostgreSQL | Vercel Postgres |
| **Database Driver** | postgres | 3.4.5 |
| **Styling** | Tailwind CSS | 3.3.2 |
| **Build Tool** | Turborepo | 1.9.3 |
| **Package Manager** | pnpm | - |
| **TypeScript** | Node Types | @types/node ^18 |
| **Python** | Python | 3.11 |
| **API Integration** | Notion API | 2022-06-28 |
| **WebSockets** | ws | 8.13.0 |
| **Deployment** | Vercel | - |

**Key Dependencies**:
- `ms`: Millisecond parsing utility
- `postgres`: PostgreSQL client for Node.js
- `requests`: Python HTTP library for Notion API

---

## Repository Structure

```
/home/user/WejdanAI/
├── .github/                      # GitHub configuration
│   └── workflows/               # CI/CD pipelines
│       ├── ci.yml              # Lint, test, security scan
│       ├── notion-sync.yml     # Automated Notion sync
│       ├── automerge.yml       # Auto-merge PRs with label
│       ├── pr-comment.yml      # Post CI results to PRs
│       ├── labeler.yml         # Auto-label PRs
│       └── dependabot.yml      # Dependency updates
│
├── server/                      # Backend API handlers
│   └── api/
│       ├── logs.ts             # Logging API (GET/POST)
│       └── get-users.ts        # User profiles API
│
├── pages/                       # Vue page components
│   └── index.vue               # Main landing page (COP dashboard)
│
├── components/                  # Reusable Vue components
│   └── Table.vue               # User table component
│
├── assets/                      # CSS and static assets
│   └── css/
│       └── main.css            # Global styles with Tailwind
│
├── scripts/                     # Python utility scripts
│   ├── notion_importer.py      # Legacy Notion importer
│   ├── notion_chat_logger.py  # Standalone chat logger
│   └── chats.example.json     # Example chat JSON format
│
├── public/                      # Static files
│   ├── nuxt.svg
│   ├── github.svg
│   ├── vercel.svg
│   └── favicon.ico
│
├── codex.py                     # Main Notion sync CLI
├── notion_importer.py           # Notion integration module
├── requirements.txt             # Python dependencies
│
├── app.vue                      # Root application component
├── nuxt.config.ts              # Nuxt configuration
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── turbo.json                  # Turborepo configuration
├── vercel.json                 # Vercel deployment config
├── package.json                # Node.js dependencies
├── pnpm-lock.yaml              # pnpm lock file
├── .npmrc                      # pnpm configuration
│
├── README.md                   # Project documentation
├── README_CODEX.md             # Codex setup guide
└── LOGGING_API.md              # API documentation
```

**Important Directories**:
- `/server/api/`: Backend API route handlers (Nuxt auto-routes)
- `/pages/`: Frontend routes (Nuxt auto-routing)
- `/components/`: Reusable Vue components
- `/scripts/`: Python utilities for data import
- `.github/workflows/`: CI/CD automation

---

## Database Schema

**Connection**: PostgreSQL (Vercel Postgres)
**Environment Variable**: `POSTGRES_URL`
**SSL**: Required (`{ ssl: 'require' }`)

### Tables

#### `profiles` - User Management

```sql
CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  image VARCHAR(255),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Default Seed Data**:
- Guillermo Rauch (rauchg@vercel.com)
- Lee Robinson (lee@vercel.com)
- Steven Tey (stey@vercel.com)

**Location**: `server/api/get-users.ts:15-21`

#### `logs` - AI Conversation Logging

```sql
CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES profiles(id) ON DELETE SET NULL,
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Features**:
- Auto-creates table on first use
- Optional user association (nullable `user_id`)
- Foreign key constraint with `ON DELETE SET NULL`
- Automatic timestamping

**Location**: `server/api/logs.ts:22-29`

---

## API Endpoints

### GET `/api/logs`

**Purpose**: Retrieve all logs from database
**Location**: `server/api/logs.ts:66-73`

**Response**:
```json
[
  {
    "id": 1,
    "user_id": 1,
    "query": "ما هو الطقس اليوم؟",
    "response": "الجو مشمس في الرياض",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
]
```

**Ordering**: Newest first (`created_at DESC`)

---

### POST `/api/logs`

**Purpose**: Add new log entry
**Location**: `server/api/logs.ts:32-64`

**Request Body**:
```json
{
  "user_id": 1,           // Optional: References profiles table
  "query": "User query",  // Required
  "response": "AI response" // Required
}
```

**Success Response** (201):
```json
{
  "message": "✅ Log saved successfully",
  "log": {
    "id": 1,
    "user_id": 1,
    "query": "User query",
    "response": "AI response",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response** (400):
```json
{
  "error": "⚠️ Both 'query' and 'response' are required."
}
```

**Validation**:
- Both `query` and `response` are required
- `user_id` is optional (can be null for anonymous logging)

---

### GET `/api/get-users`

**Purpose**: Retrieve all user profiles (auto-seeds if empty)
**Location**: `server/api/get-users.ts`

**Response**:
```json
{
  "users": [
    {
      "id": 1,
      "name": "Guillermo Rauch",
      "email": "rauchg@vercel.com",
      "image": "https://images.vercel.com/image/upload/v1576282281/front/vercel/dps/rauchg.jpg",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "duration": "23ms"
}
```

**Auto-seeding**: Creates `profiles` table and inserts 3 default users if table doesn't exist

---

## Development Workflows

### Initial Setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
export POSTGRES_URL="postgres://..."
export NOTION_TOKEN="secret_..."  # For Notion integration
export DATABASE_ID="abc123..."    # For Notion integration
```

### Development Server

```bash
# Start dev server on http://localhost:3000
pnpm dev
```

### Build & Preview

```bash
# Build for production
pnpm build

# Preview production build locally
pnpm preview
```

### Package Manager

**IMPORTANT**: This project uses **pnpm**, not npm or yarn.

**Configuration** (`.npmrc`):
- `shamefully-hoist=true`: Flattens node_modules for compatibility
- `strict-peer-dependencies=false`: Relaxed peer dependency checks

---

## Notion Integration (Codex)

The Codex system syncs chat conversations from JSON files to a Notion database.

### Notion Database Requirements

Create these properties in your Notion database:
- **Page Title** (Title)
- **AI Tool** (Select)
- **Category** (Select)
- **Status** (Status)
- **Conversation Content** (Rich text)
- **External ID** (Rich text) - For deduplication

### Chat JSON Format

```json
{
  "title": "تحليل بيانات مالية",
  "ai_tool": "ChatGPT",
  "category": "تحليل",
  "content": "المحادثة الكاملة هنا...",
  "id": "custom-unique-id",         // Optional
  "external_id": "alternative-id"   // Optional
}
```

**File Location**: `scripts/chats.example.json`

### CLI Usage

**Main Command**: `python codex.py`

```bash
# Sync all chats to Notion (create new + update existing)
python codex.py sync --update-existing

# Dry run (preview changes without making them)
python codex.py sync --dry-run

# Sync from specific directory with custom pattern
python codex.py sync --repo-dir "./data" --file-pattern "*.json"

# Validate JSON file structure
python codex.py validate --file "chats.json"
```

### Key Functions

**Location**: `notion_importer.py`

- `require_env()`: Validates required environment variables
- `stable_external_id(chat)`: Generates SHA256 hash for deduplication
- `load_chats_from_file(file_path)`: Parses JSON chat files
- `collect_chat_files(repo_dir, pattern)`: Discovers JSON files
- `notion_page_exists_by_external_id(external_id)`: Checks for duplicates
- `add_chat_to_notion(chat)`: Creates new Notion page
- `update_chat_in_notion(page_id, chat)`: Updates existing page
- `chunk_rich_text(text, max_len=1800)`: Splits large content
- `request_with_retry(func, *args, max_retries=5)`: Retry with exponential backoff

### Deduplication Strategy

**External ID Generation** (`notion_importer.py:27-36`):
1. Uses `chat['id']` if present
2. Falls back to `chat['external_id']` if present
3. Otherwise generates SHA256 hash of: `title|ai_tool|category|content`

This ensures the same chat is never imported twice.

### Automated Sync

**GitHub Actions**: `.github/workflows/notion-sync.yml`

**Triggers**:
- Push to JSON files, `codex.py`, `notion_importer.py`, `requirements.txt`
- Daily schedule at 2:00 AM UTC
- Manual dispatch with parameters

**Manual Dispatch Parameters**:
- `repo_dir`: Repository directory (default: ".")
- `file_pattern`: JSON file pattern (default: "chats.json")
- `update_existing`: Update existing pages (default: "true")
- `dry_run`: Preview mode (default: "false")

**Concurrency**: Prevents duplicate runs (max 1 active sync)

---

## Frontend Components

### `app.vue`

**Location**: Root component
**Purpose**: Wrapper for NuxtPage router
**Structure**: Single `<NuxtPage />` component

### `pages/index.vue`

**Location**: Main landing page
**Purpose**: Operations in Banking (COP) playbook dashboard
**Features**:
- Task management interface
- Displays "Operations in Banking (COP)" title
- Integrates with backend for data

### `components/Table.vue`

**Location**: Reusable user table component
**Purpose**: Display user profiles with avatars and timestamps
**Features**:
- Avatar images
- User name and email
- Creation timestamp
- Responsive design

---

## Coding Conventions

### TypeScript

- Use TypeScript for all new `.ts` files
- `tsconfig.json` extends Nuxt's auto-generated config
- Nuxt auto-imports: No need to import `ref`, `computed`, `useState`, etc.

### Vue 3 / Nuxt 3

- Use Composition API (`<script setup>`)
- Auto-routing: Files in `/pages` become routes
- API routes: Files in `/server/api` become endpoints
- Auto-imports: Composables, components, and utilities

### Tailwind CSS

**Configuration**: `tailwind.config.js`
**Global Styles**: `assets/css/main.css`

**Dark Mode Support**:
```css
/* assets/css/main.css uses CSS variables */
--background
--foreground
```

**Patterns**:
- Use utility classes over custom CSS
- Follow mobile-first responsive design
- Use `@apply` sparingly in component styles

### Python

**Version**: Python 3.11
**Style**: Follow PEP 8

**Linting**: Ruff (configured in CI)
```bash
ruff check .
```

**Security**: pip-audit (runs in CI)

### Database Queries

**Pattern**: Use `postgres` package with tagged templates

```typescript
import postgres from 'postgres';
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// Good: Parameterized query (prevents SQL injection)
await sql`SELECT * FROM logs WHERE user_id = ${userId}`;

// Bad: String concatenation (vulnerable to SQL injection)
await sql`SELECT * FROM logs WHERE user_id = ${userId}`; // NO
```

**Auto-table Creation Pattern**:
```typescript
await sql`CREATE TABLE IF NOT EXISTS table_name (...)`;
```

### Error Handling

**API Routes**: Always handle errors and return appropriate status codes

```typescript
try {
  // Operation
  return { message: '✅ Success', data };
} catch (error) {
  console.error('Error:', error);
  return { error: '⚠️ Error message', status: 500 };
}
```

### Environment Variables

**Required**:
- `POSTGRES_URL`: PostgreSQL connection string
- `NOTION_TOKEN`: Notion API token (for Codex)
- `DATABASE_ID`: Notion database ID (for Codex)

**Access**:
- Node.js: `process.env.VARIABLE_NAME`
- Python: `os.getenv('VARIABLE_NAME')`

**Security**: Never commit `.env` files (excluded in `.gitignore`)

---

## Testing & CI/CD

### CI Pipeline

**Workflow**: `.github/workflows/ci.yml`

**Triggers**: Pull requests, pushes to main

**Steps**:
1. Checkout code
2. Set up Python 3.11
3. Install dependencies: `ruff`, `pip-audit`, `pytest`, `requests`
4. Lint with Ruff: `ruff check .`
5. Run tests with pytest (optional, non-blocking)
6. Security audit with pip-audit

**Exit Codes**:
- Ruff failures: Pipeline fails
- pytest failures: Pipeline continues (non-blocking)
- pip-audit vulnerabilities: Pipeline fails

### Auto-merge

**Workflow**: `.github/workflows/automerge.yml`

**Logic**:
- Auto-merge PRs with `automerge` label
- Blocked by `do-not-merge` label
- Uses squash merge strategy

**Auto-labels** (via `labeler.yml`):
- `automerge`: JSON, Python scripts, workflows
- `do-not-merge`: Markdown files

### PR Comments

**Workflow**: `.github/workflows/pr-comment.yml`

**Purpose**: Posts CI results as PR comments with status and run link

### Dependabot

**Configuration**: `.github/workflows/dependabot.yml`

**Schedules**:
- **pip**: Weekly updates, max 5 open PRs
- **github-actions**: Weekly updates, max 5 open PRs

**Auto-labels**: All Dependabot PRs get `automerge` label

---

## Deployment

### Platform

**Vercel** (configured in `vercel.json`)

### Build Configuration

**Build Command**: `pnpm turbo build`
**Ignore Command**: `pnpm dlx turbo-ignore`

**Outputs** (`turbo.json`):
- `.nuxt`
- `.nitro`
- `.output`
- `.vercel`
- `dist`
- `build`

### Environment Variables

Set in Vercel dashboard:
- `POSTGRES_URL`: Database connection string
- `NOTION_TOKEN`: For Notion integration
- `DATABASE_ID`: For Notion database

### Deployment URL

**Production**: `https://wejdanai.vercel.app`

**API Base URL**: `https://wejdanai.vercel.app/api`

---

## Common Tasks

### Add a New API Endpoint

1. Create file in `/server/api/` (e.g., `server/api/my-endpoint.ts`)
2. Export default event handler:

```typescript
export default defineEventHandler(async (event) => {
  // Handle GET
  if (event.node.req.method === 'GET') {
    return { data: 'response' };
  }

  // Handle POST
  if (event.node.req.method === 'POST') {
    const body = await readBody(event);
    return { success: true };
  }

  return { error: 'Method not allowed' };
});
```

3. Access at `/api/my-endpoint`

### Add a New Page

1. Create file in `/pages/` (e.g., `pages/about.vue`)
2. Use Vue 3 Composition API:

```vue
<script setup lang="ts">
const title = ref('About Page');
</script>

<template>
  <div>
    <h1>{{ title }}</h1>
  </div>
</template>
```

3. Access at `/about`

### Query the Database

```typescript
import postgres from 'postgres';

export default defineEventHandler(async (event) => {
  const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

  // SELECT
  const users = await sql`SELECT * FROM profiles`;

  // INSERT
  const [newUser] = await sql`
    INSERT INTO profiles (name, email)
    VALUES (${name}, ${email})
    RETURNING *
  `;

  // UPDATE
  await sql`UPDATE profiles SET name = ${newName} WHERE id = ${id}`;

  return { users };
});
```

### Add a New Chat to Notion

**Option 1: Via JSON file**
1. Create `chats.json` with chat data
2. Run: `python codex.py sync --update-existing`

**Option 2: Programmatically**
```python
from notion_importer import add_chat_to_notion

chat = {
    "title": "My Chat",
    "ai_tool": "ChatGPT",
    "category": "General",
    "content": "Full conversation here..."
}

add_chat_to_notion(chat)
```

### Update Tailwind Configuration

1. Edit `tailwind.config.js`
2. Add custom theme, colors, or plugins
3. Restart dev server: `pnpm dev`

### Debug API Issues

**Check logs**:
```bash
# Local development
pnpm dev  # Console shows API requests

# Vercel production
# View logs in Vercel dashboard -> Functions tab
```

**Test endpoints**:
```bash
# GET request
curl https://wejdanai.vercel.app/api/logs

# POST request
curl -X POST https://wejdanai.vercel.app/api/logs \
  -H "Content-Type: application/json" \
  -d '{"query":"test","response":"test response"}'
```

### Run Linting

```bash
# Python (Ruff)
ruff check .

# Auto-fix issues
ruff check . --fix
```

### Security Audit

```bash
# Python dependencies
pip-audit
```

---

## Important Notes for AI Assistants

### When Making Changes

1. **Read before modifying**: Always read existing files before making changes
2. **Use existing patterns**: Follow established code patterns in the repository
3. **Database migrations**: This project auto-creates tables, no formal migrations
4. **Test locally**: Use `pnpm dev` to test changes before committing
5. **API documentation**: Update `LOGGING_API.md` if modifying API endpoints

### Common Pitfalls to Avoid

1. **SQL Injection**: Always use parameterized queries with `sql` tagged templates
2. **Environment Variables**: Never hardcode secrets; use `process.env`
3. **Package Manager**: Use `pnpm`, not `npm` or `yarn`
4. **Auto-imports**: Nuxt auto-imports composables; avoid manual imports
5. **Table Creation**: Use `CREATE TABLE IF NOT EXISTS` for idempotency

### Git Workflow

**Branch Naming**: Follow the pattern `claude/claude-md-<identifier>`

**Commit Messages**: Clear, descriptive messages
- Good: "Add user authentication endpoint"
- Bad: "Update files"

**Before Pushing**:
```bash
# Check status
git status

# Review changes
git diff

# Stage changes
git add .

# Commit
git commit -m "Descriptive message"

# Push to feature branch
git push -u origin branch-name
```

### Arabic Language Support

- The application supports Arabic content
- Use UTF-8 encoding for all files
- Test Arabic text in UI components
- Database columns use TEXT type to support Arabic characters

### Performance Considerations

- **Database Queries**: Use `LIMIT` for large result sets
- **Notion API**: Built-in retry logic with exponential backoff
- **Rich Text Chunking**: Notion API limits text to ~2000 chars; use `chunk_rich_text()`
- **Concurrent Syncs**: GitHub Actions prevents concurrent Notion syncs

---

## Additional Resources

- **Nuxt 3 Documentation**: https://nuxt.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Notion API**: https://developers.notion.com/
- **Vercel Deployment**: https://vercel.com/docs
- **postgres.js**: https://github.com/porsager/postgres

---

## Questions or Issues?

For repository-specific questions:
1. Check existing documentation in `README.md`, `README_CODEX.md`, `LOGGING_API.md`
2. Review recent commits and PRs for context
3. Examine related files for patterns and conventions

For framework questions:
- Nuxt: https://nuxt.com/docs
- Notion API: https://developers.notion.com/reference

---

**End of CLAUDE.md**
