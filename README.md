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

## Token Configuration

This project requires GitHub and Vercel tokens for deployment and CI/CD workflows.

### Quick Setup

1. **Copy environment variables template:**
   ```bash
   cp .env.example .env
   ```

2. **Configure tokens:**
   ```bash
   # For local development
   gh auth login          # GitHub authentication
   vercel login           # Vercel authentication
   
   # For repository secrets (CI/CD)
   ./scripts/manage-secrets.sh    # Interactive secret management
   ```

3. **Validate configuration:**
   ```bash
   ./scripts/validate-tokens.sh   # Run local validation
   ```
   
   Or test via GitHub Actions: Go to Actions tab → "Test Token Configuration" → "Run workflow"

### Required Secrets

For GitHub Actions workflows, configure these secrets in repository settings:

- `GITHUB_TOKEN` - Automatically provided by GitHub Actions ✅
- `VERCEL_TOKEN` - Get from https://vercel.com/account/tokens
- `POSTGRES_URL` - Your PostgreSQL connection string
- `AZURE_STATIC_WEB_APPS_API_TOKEN` - Get from Azure Portal (optional)

### Helper Scripts

| Script | Purpose |
|--------|---------|
| `scripts/validate-tokens.sh` | Validate all token configurations |
| `scripts/manage-secrets.sh` | Manage GitHub repository secrets |
| `scripts/setup-vercel.sh` | Interactive Vercel deployment setup |

### Documentation

- 📖 [Complete Setup Guide](docs/TOKEN_SETUP.md) - Detailed token configuration instructions
- 📋 [Quick Reference](docs/TOKEN_QUICK_REFERENCE.md) - Quick lookup for token setup

### Automated Validation

- **Weekly checks**: Tokens are automatically validated every Sunday
- **Manual trigger**: Run "Token Validation" workflow from Actions tab
- **On-demand testing**: Run "Test Token Configuration" workflow for comprehensive testing
