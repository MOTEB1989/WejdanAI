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

Make sure to install the dependencies:

```bash
pnpm install
```

## Environment Variables

Create a `.env` file in the root directory and add your Postgres database URL:

```bash
POSTGRES_URL=your_postgres_connection_string_here
```

You can use the `.env.example` file as a template. If you don't have a Postgres database, you can get one from:
- [Vercel Postgres](https://vercel.com/storage/postgres)
- [Neon](https://neon.tech/)
- [Supabase](https://supabase.com/)

## Development Server

Start the development server on `http://localhost:3000`

```bash
pnpm dev
```

## Features

- **Database Demo**: View a simple Postgres database demo with user profiles
- **Web Chat**: Interactive chat interface at `/chat`

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
