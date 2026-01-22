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

# Nuxt 3 + Tailwind CSS + Vercel AI SDK Starter

A production-ready [Nuxt 3](https://nuxt.com/docs/getting-started/introduction) application with Tailwind CSS and Vercel AI SDK integration.

## ✨ Features

- ⚡️ **Nuxt 3** - The Intuitive Vue Framework
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🤖 **Vercel AI SDK** - Build AI-powered applications
- 🗄️ **PostgreSQL** - Reliable SQL database
- 🚀 **Vercel Ready** - Optimized for Vercel deployment

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Required environment variables:
- `POSTGRES_URL` - Your PostgreSQL connection string
- `OPENAI_API_KEY` - Your OpenAI API key (optional, only needed for AI features)

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

## 🎨 Tailwind CSS

This project uses Tailwind CSS v3 with custom configuration. The Tailwind directives are imported in `assets/css/main.css`.

To customize Tailwind, edit `tailwind.config.js`.

## 🤖 Vercel AI SDK

The project includes Vercel AI SDK integration for building AI-powered features. 

Example API endpoint: `/api/ai/chat` - Demonstrates streaming AI responses with OpenAI.

To use AI features:
1. Set `OPENAI_API_KEY` in your environment variables
2. Make requests to the AI endpoints from your Vue components

## 📦 Project Structure

```
├── assets/css/          # Global styles and Tailwind CSS
├── components/          # Vue components
├── pages/              # Application pages (auto-routing)
├── server/api/         # API endpoints
│   ├── ai/            # AI-powered endpoints
│   └── get-users.ts   # Database example
├── public/            # Static assets
├── nuxt.config.ts     # Nuxt configuration
├── tailwind.config.js # Tailwind CSS configuration
└── vercel.json        # Vercel deployment configuration
```

## 🚀 Deploy to Vercel

Deploy this project to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMOTEB1989%2FWejdanAI)

Make sure to set up the required environment variables in your Vercel project settings.
