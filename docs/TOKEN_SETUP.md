# Token Configuration Guide

This guide explains how to configure GitHub and Vercel tokens for the WejdanAI project.

## Required Tokens and Secrets

### 1. GitHub Token (GITHUB_TOKEN)

**Purpose**: Used for GitHub Actions workflows, API access, and PR comments.

**Configuration**: 
- Automatically provided by GitHub Actions in workflows
- No manual configuration needed for CI/CD
- For local development: `gh auth login`

**Verification**:
```bash
# Check if authenticated
gh auth status

# Or test with API (using Bearer token for PAT)
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.github.com/user
```

---

### 2. Vercel Token (VERCEL_TOKEN)

**Purpose**: Required for deploying to Vercel platform.

**How to Get**:
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Give it a descriptive name (e.g., "WejdanAI Deployment")
4. Copy the generated token

**Configuration**:
1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Name: `VERCEL_TOKEN`
5. Value: Paste your Vercel token
6. Click "Add secret"

**Local Development**:
```bash
# Login to Vercel CLI
vercel login

# Or set environment variable
export VERCEL_TOKEN=your_token_here
```

**Verification**:
```bash
# Using CLI
vercel whoami

# Using API
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.vercel.com/v2/user
```

---

### 3. Azure Static Web Apps Token (AZURE_STATIC_WEB_APPS_API_TOKEN)

**Purpose**: Required for Azure Static Web Apps deployment (currently configured in workflow).

**How to Get**:
1. Go to Azure Portal
2. Navigate to your Static Web App
3. Go to "Deployment tokens"
4. Copy the deployment token

**Configuration**:
1. Add to GitHub repository secrets as `AZURE_STATIC_WEB_APPS_API_TOKEN`

---

### 4. Database URL (POSTGRES_URL)

**Purpose**: Connection string for PostgreSQL database.

**Format**:
```
postgresql://username:password@host:port/database?sslmode=require
```

**Configuration**:
1. Add to GitHub repository secrets as `POSTGRES_URL`
2. For local development, create `.env` file:
```bash
POSTGRES_URL=postgresql://username:password@localhost:5432/database
```

---

## Validation Scripts

### Automated Validation (GitHub Actions)

A workflow runs automatically to validate tokens:
- Workflow: `.github/workflows/validate-tokens.yml`
- Runs: Weekly on Sundays
- Can be triggered manually from Actions tab

### Manual Validation

Run the validation script locally:

```bash
# Make sure script is executable
chmod +x scripts/validate-tokens.sh

# Run validation
./scripts/validate-tokens.sh
```

---

## Troubleshooting

### GitHub Token Issues

**Problem**: "Bad credentials" or authentication errors

**Solutions**:
1. Re-authenticate: `gh auth login`
2. Check token permissions (needs repo access)
3. Verify token hasn't expired

### Vercel Token Issues

**Problem**: Deployment fails or "Unauthorized" errors

**Solutions**:
1. Verify token is correctly added to GitHub secrets
2. Check token hasn't been revoked in Vercel dashboard
3. Ensure token has deployment permissions
4. Re-create token if needed

### Azure Token Issues

**Problem**: Azure deployment fails

**Solutions**:
1. Verify token in Azure portal is still valid
2. Check token is correctly copied (no extra spaces)
3. Regenerate token if expired

---

## Security Best Practices

1. **Never commit tokens to Git**
   - Use `.env` files (already in `.gitignore`)
   - Use GitHub Secrets for CI/CD
   - Use environment variables

2. **Rotate tokens regularly**
   - Create new tokens periodically
   - Delete old tokens after rotation

3. **Use minimal permissions**
   - Give tokens only the permissions they need
   - Use separate tokens for different purposes

4. **Monitor token usage**
   - Check token access logs
   - Revoke unused tokens
   - Set up alerts for suspicious activity

---

## Quick Setup Checklist

- [ ] GitHub authentication configured (`gh auth login`)
- [ ] Vercel token created and added to GitHub secrets
- [ ] Azure token added to GitHub secrets
- [ ] Database URL configured
- [ ] Run validation script: `./scripts/validate-tokens.sh`
- [ ] Test deployment workflow
- [ ] Verify all workflows pass

---

## Support

If you encounter issues:
1. Run the validation script for detailed diagnostics
2. Check GitHub Actions logs for error messages
3. Verify all secrets are correctly configured
4. Review the troubleshooting section above

For more information:
- GitHub Secrets: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- Vercel Tokens: https://vercel.com/docs/rest-api/authentication
- Azure Static Web Apps: https://docs.microsoft.com/en-us/azure/static-web-apps/
