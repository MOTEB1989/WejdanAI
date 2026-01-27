# Deployment Guide

This repository supports deployment to both **Azure Static Web Apps** and **Vercel**.

## Vercel Deployment

### Prerequisites

You need to set up the following GitHub repository secrets:

1. **VERCEL_TOKEN**: Your Vercel authentication token
   - Get it from: https://vercel.com/account/tokens
   - Go to Settings → Tokens → Create Token

2. **VERCEL_ORG_ID**: Your Vercel organization/team ID
   - Run `vercel link` locally to create `.vercel/project.json`
   - Copy the `orgId` value

3. **VERCEL_PROJECT_ID**: Your Vercel project ID
   - Run `vercel link` locally to create `.vercel/project.json`
   - Copy the `projectId` value

### Setting Up GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each of the three secrets mentioned above

### Automatic Deployment

Once secrets are configured, the workflow will automatically:
- Deploy on every push to `main` branch
- Deploy on every push to feature branches (for preview deployments)
- Deploy on pull requests to `main`

### Manual Deployment

To deploy manually from your local machine:

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Link to your Vercel project (first time only)
vercel link

# Deploy to production
vercel --prod
```

## Azure Static Web Apps Deployment

The Azure deployment is already configured via the GitHub Actions workflow in `.github/workflows/azure-staticwebapp.yml`.

To use it, ensure the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret is set in your repository.

## Build Information

- **Build Command**: `pnpm turbo build` or `pnpm build`
- **Output Directory**: `.output/` (Nuxt 3 default)
- **Package Manager**: pnpm
- **Framework**: Nuxt 3

## Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Troubleshooting

### Build Failures
- Ensure all dependencies are installed: `pnpm install`
- Clear cache: `rm -rf .nuxt .output node_modules && pnpm install`

### Deployment Failures
- Verify all required secrets are set correctly
- Check workflow logs in GitHub Actions tab
- Ensure your Vercel project is linked correctly

## Additional Resources

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps/)
