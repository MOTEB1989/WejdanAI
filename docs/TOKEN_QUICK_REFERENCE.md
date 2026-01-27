# Token Quick Reference

## 🚀 Quick Start

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Run validation script
./scripts/validate-tokens.sh

# 3. Setup Vercel (optional)
./scripts/setup-vercel.sh
```

---

## 🔑 Token Locations

### Local Development

| Token | Location | Command |
|-------|----------|---------|
| GitHub | `gh auth login` | `gh auth status` |
| Vercel | `vercel login` | `vercel whoami` |
| Database | `.env` file | `echo $POSTGRES_URL` |

### GitHub Actions (Repository Secrets)

Go to: `Settings > Secrets and variables > Actions`

| Secret Name | Required | Get From |
|-------------|----------|----------|
| `GITHUB_TOKEN` | ✅ Auto | Provided by GitHub |
| `VERCEL_TOKEN` | ✅ Manual | https://vercel.com/account/tokens |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | ⚠️ Optional | Azure Portal |
| `POSTGRES_URL` | ✅ Manual | Your database provider |

---

## 📝 Token Format Examples

```bash
# GitHub Token
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Vercel Token  
VERCEL_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# PostgreSQL URL
POSTGRES_URL=postgresql://user:pass@host:5432/db?sslmode=require

# Azure Token
AZURE_STATIC_WEB_APPS_API_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## ✅ Validation Checklist

### Local Setup
- [ ] Install GitHub CLI: `brew install gh` or from https://cli.github.com/
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Authenticate GitHub: `gh auth login`
- [ ] Authenticate Vercel: `vercel login`
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in `.env` values
- [ ] Run: `./scripts/validate-tokens.sh`

### GitHub Actions Setup
- [ ] Create Vercel token at https://vercel.com/account/tokens
- [ ] Add `VERCEL_TOKEN` to repository secrets
- [ ] Add `POSTGRES_URL` to repository secrets
- [ ] Add `AZURE_STATIC_WEB_APPS_API_TOKEN` (if using Azure)
- [ ] Test workflow: Run "Token Validation" workflow from Actions tab

---

## 🐛 Quick Troubleshooting

| Error | Solution |
|-------|----------|
| `gh: command not found` | Install GitHub CLI |
| `vercel: command not found` | Run `npm i -g vercel` |
| `Bad credentials` | Re-run `gh auth login` |
| `Unauthorized` (Vercel) | Re-run `vercel login` |
| Workflow fails | Check repository secrets are set |

---

## 📚 Documentation Links

- **Full Setup Guide**: [docs/TOKEN_SETUP.md](TOKEN_SETUP.md)
- **GitHub Secrets**: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- **Vercel Tokens**: https://vercel.com/docs/rest-api/authentication
- **Vercel CLI**: https://vercel.com/docs/cli

---

## 🔄 Weekly Automated Checks

A GitHub Action runs every Sunday at midnight to validate all tokens.

**Manual trigger**: Go to Actions tab → "Token Validation" → "Run workflow"

---

## 🆘 Need Help?

1. Run validation script: `./scripts/validate-tokens.sh`
2. Check workflow logs in GitHub Actions tab
3. Review [TOKEN_SETUP.md](TOKEN_SETUP.md) for detailed guide
4. Verify all secrets in repository settings

---

## 🔒 Security Reminders

- ✅ Never commit tokens to Git
- ✅ Use `.env` files (already in `.gitignore`)
- ✅ Rotate tokens regularly
- ✅ Use minimal required permissions
- ❌ Don't share tokens in issues or PRs
