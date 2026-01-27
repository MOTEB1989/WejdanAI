#!/usr/bin/env bash
set -e

echo "=================================="
echo "Vercel Deployment Setup Helper"
echo "=================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel >/dev/null 2>&1; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed successfully"
    echo ""
fi

# Check if logged in to Vercel
echo "🔑 Checking Vercel authentication..."
if vercel whoami >/dev/null 2>&1; then
    USERNAME=$(vercel whoami 2>/dev/null)
    echo "✅ Already logged in as: $USERNAME"
else
    echo "Please login to Vercel:"
    vercel login
fi

echo ""
echo "=================================="
echo "Project Setup"
echo "=================================="
echo ""

# Get project directory
PROJECT_DIR=$(pwd)
echo "📂 Project directory: $PROJECT_DIR"

# Check if already linked to Vercel
if [ -d ".vercel" ]; then
    echo "✅ Project is already linked to Vercel"
    cat .vercel/project.json 2>/dev/null || echo "Vercel project information:"
else
    echo "🔗 Linking project to Vercel..."
    vercel link
fi

echo ""
echo "=================================="
echo "Environment Variables"
echo "=================================="
echo ""

# Check if .env.example exists
if [ -f ".env.example" ]; then
    echo "📋 Required environment variables (from .env.example):"
    grep -v "^#" .env.example | grep "=" | cut -d'=' -f1 | while read var; do
        echo "  - $var"
    done
    echo ""
    
    # Ask if user wants to set environment variables
    read -p "Do you want to set environment variables for Vercel? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "Setting environment variables..."
        
        # Read POSTGRES_URL
        read -p "Enter POSTGRES_URL (or press Enter to skip): " POSTGRES_URL
        if [ -n "$POSTGRES_URL" ]; then
            vercel env add POSTGRES_URL production
            echo "$POSTGRES_URL"
        fi
        
        echo ""
        echo "You can add more environment variables using:"
        echo "  vercel env add <NAME> <environment>"
    fi
fi

echo ""
echo "=================================="
echo "✅ Setup Complete"
echo "=================================="
echo ""
echo "Next steps:"
echo "  1. Deploy to Vercel: vercel --prod"
echo "  2. View deployments: vercel ls"
echo "  3. View logs: vercel logs"
echo ""
echo "For GitHub integration:"
echo "  1. Get your Vercel token: https://vercel.com/account/tokens"
echo "  2. Add VERCEL_TOKEN to GitHub repository secrets"
echo "  3. Add other required secrets (POSTGRES_URL, etc.)"
echo ""
