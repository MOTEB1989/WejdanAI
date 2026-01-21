# Kimi API Setup Guide

This guide explains how to configure the Kimi API key for the WejdanAI project in both local development and production (Vercel) environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Vercel Production Setup](#vercel-production-setup)
- [Verification](#verification)

## Prerequisites

- A valid Kimi API key (format: `sk-kimi-...`)
- Access to the project repository
- Vercel CLI installed (for production setup) or access to Vercel Dashboard

## Local Development Setup

### Step 1: Configure Environment Variables

The project already includes a `.env.example` file with the Kimi API key placeholder. If you're starting fresh:

1. **Copy the example file** (if `.env` doesn't exist):
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file** and add your Kimi API key:
   ```env
   # AI Provider API Keys
   KIMI_API_KEY=sk-kimi-2DEMejjmHzcT2v0MhAQxfzYOg3s7KTj5z5ct9IzxFP0T54OiYr7bo9TO1ADNuih7
   ```

3. **Verify the file is in `.gitignore`**:
   The `.env` file should already be listed in `.gitignore` to prevent accidentally committing secrets.

### Step 2: Usage in Code

Following the same pattern as other AI providers in this project, you can use the Kimi API key like this:

```python
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get the Kimi API key
kimi_api_key = os.environ.get("KIMI_API_KEY")

if not kimi_api_key:
    raise ValueError("KIMI_API_KEY not found in environment variables")

# Use the API key with your Kimi client
# Example: client = KimiClient(api_key=kimi_api_key)
```

## Vercel Production Setup

You have **three options** to add the Kimi API key to your Vercel deployment:

### Option 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   pnpm add -g vercel
   # or
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Add the environment variable**:
   ```bash
   vercel env add KIMI_API_KEY
   ```

   When prompted:
   - **What's the value of KIMI_API_KEY?**: Enter your Kimi API key
   - **Add to which Environments?**: Select `Production`, `Preview`, and `Development` (use arrow keys and space to select)
   - Press Enter to confirm

4. **Verify the variable was added**:
   ```bash
   vercel env ls
   ```

### Option 2: Using Vercel Dashboard (Web UI)

1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter:
   - **Key**: `KIMI_API_KEY`
   - **Value**: `sk-kimi-2DEMejjmHzcT2v0MhAQxfzYOg3s7KTj5z5ct9IzxFP0T54OiYr7bo9TO1ADNuih7`
   - **Environments**: Select Production, Preview, and Development
5. Click **Save**

### Option 3: Using Vercel API

If you're automating deployments, you can use the Vercel API to set environment variables:

```bash
curl -X POST "https://api.vercel.com/v9/projects/{PROJECT_ID}/env" \
  -H "Authorization: Bearer {VERCEL_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "encrypted",
    "key": "KIMI_API_KEY",
    "value": "sk-kimi-2DEMejjmHzcT2v0MhAQxfzYOg3s7KTj5z5ct9IzxFP0T54OiYr7bo9TO1ADNuih7",
    "target": ["production", "preview", "development"]
  }'
```

Replace `{PROJECT_ID}` and `{VERCEL_TOKEN}` with your actual values.

## Verification

### Verify Local Setup

1. **Create a test script** (`test_kimi.py`):
   ```python
   import os
   from dotenv import load_dotenv

   load_dotenv()

   kimi_key = os.environ.get("KIMI_API_KEY")

   if kimi_key:
       print(f"✓ Kimi API key loaded: {kimi_key[:15]}...")
   else:
       print("✗ Kimi API key not found")
   ```

2. **Run the test**:
   ```bash
   python test_kimi.py
   ```

### Verify Vercel Deployment

After adding the environment variable to Vercel:

1. **Trigger a new deployment** (push a commit or manually redeploy)
2. **Check the deployment logs** in Vercel Dashboard
3. **Test the API endpoint** that uses the Kimi API key

## Important Notes

### Security Best Practices

- ✓ **Never commit** the `.env` file to version control
- ✓ **Never hardcode** API keys in your source code
- ✓ **Rotate keys** regularly for security
- ✓ **Use different keys** for development and production if possible
- ✓ **Limit key permissions** to only what's necessary

### Deployment Notes

- Environment variables in Vercel are encrypted at rest
- Changing environment variables requires redeployment to take effect
- Preview deployments inherit environment variables from Production unless specifically overridden
- You can set different values for Production, Preview, and Development environments

## Troubleshooting

### "API key not found" Error

**Problem**: Code can't find the `KIMI_API_KEY` environment variable.

**Solutions**:
- Verify `.env` file exists in project root
- Ensure `python-dotenv` is installed: `pip install python-dotenv`
- Check that `load_dotenv()` is called before accessing the environment variable
- For Vercel: Verify the environment variable is set in the correct environment (Production/Preview/Development)

### Changes Not Reflecting in Vercel

**Problem**: Updated environment variable, but deployment still uses old value.

**Solutions**:
- Redeploy your application after changing environment variables
- Check that you updated the correct environment (Production/Preview/Development)
- Clear Vercel's cache by redeploying with "Force Redeploy"

### Vercel CLI Authentication Issues

**Problem**: `vercel env add` fails with authentication error.

**Solutions**:
- Run `vercel login` first to authenticate
- Check that you have the necessary permissions for the project
- Use `vercel whoami` to verify you're logged in
- Alternative: Use the Vercel Dashboard (Option 2 above)

## Related Documentation

- [Vercel Environment Variables Guide](https://vercel.com/docs/environment-variables)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Python-dotenv Documentation](https://pypi.org/project/python-dotenv/)

## API Provider Pattern in This Project

This project follows a consistent pattern for all AI providers:

```
AI Provider API Keys
├── ANTHROPIC_API_KEY    (Claude AI)
├── OPENAI_API_KEY       (GPT models)
├── GEMINI_API_KEY       (Google Gemini)
└── KIMI_API_KEY         (Kimi AI) ← New addition
```

All providers use the same configuration approach:
- Environment variables in `.env`
- Service wrapper classes in `/services/`
- LLM orchestrator integration in `/LLM`
- Example scripts in `/examples/`

For implementation patterns, refer to:
- `/docs/ANTHROPIC_SETUP.md` - Comprehensive guide for Anthropic integration
- `/services/anthropic_service.py` - Service wrapper example
- `/examples/anthropic_basic_example.py` - Basic usage example
