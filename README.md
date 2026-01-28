---
name: Postgres + Nuxt Starter
slug: postgres-nuxt
description: Simple Nuxt template that uses a Postgres database.
framework: Nuxt
useCase: Starter
css: Tailwind
database: Postgres
deployUrl: https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FWejdan-AI%2FLexNexus&project-name=lexnexus&repository-name=LexNexus&demo-title=LexNexus&demo-description=LexNexus%20platform
demoUrl: https://postgres-nuxt.vercel.app/
relatedTemplates:
  - postgres-starter
  - postgres-prisma
  - postgres-sveltekit
---

# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

### 1. Install Dependencies

Make sure to install the dependencies:

```bash
pnpm install
```

### 2. Configure Environment Variables

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env
```

Edit the `.env` file and add your API keys:

- **POSTGRES_URL**: PostgreSQL connection URL (required for database operations)
  - Format: `postgres://username:password@host:port/database?sslmode=require`
  - Get this from your PostgreSQL provider (e.g., Vercel Postgres, Supabase, etc.)

- **OPENAI_API_KEY**: OpenAI API key (required for AI features)
  - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

- **AZURE_STATIC_WEB_APPS_API_TOKEN**: Azure deployment token (required for Azure deployment)
  - Get this from Azure Portal: Static Web Apps > Management > Deployment token

**Important**: Never commit your `.env` file to version control. It's already listed in `.gitignore`.

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
