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

# WejdanAI - Nuxt 3 + Postgres + Real-time Chat

A modern web application built with Nuxt 3, featuring PostgreSQL database integration and real-time chat functionality powered by WebSockets.

## Features

- 🗄️ **PostgreSQL Integration**: Seamless database operations with auto-migration
- 💬 **Real-time Chat**: WebSocket-based chat with typing indicators and message persistence
- 🎨 **Modern UI**: Glassmorphism design with Tailwind CSS
- 🌓 **Dark Mode**: Full dark mode support
- 📱 **Responsive**: Mobile-first responsive design
- ⚡ **Fast**: Built with Nuxt 3 for optimal performance

## Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (required for full functionality)

### Setup

1. Clone the repository and install dependencies:

```bash
pnpm install
```

2. Configure environment variables:

Create a `.env` file in the root directory:

```bash
POSTGRES_URL=postgres://username:password@host:port/database
```

See `.env.example` for reference.

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

### Using the Chat Feature

1. Navigate to `/chat` or click "💬 Try Chat Demo" on the homepage
2. Start sending messages in real-time
3. Open multiple browser windows to test real-time synchronization

For detailed chat documentation, see [CHAT_DOCUMENTATION.md](./CHAT_DOCUMENTATION.md).

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
