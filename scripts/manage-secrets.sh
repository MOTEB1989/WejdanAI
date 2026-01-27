#!/usr/bin/env bash
set -e

echo "=================================="
echo "GitHub Secrets Management Helper"
echo "=================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh >/dev/null 2>&1; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "   Install from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status >/dev/null 2>&1; then
    echo "🔑 Please authenticate with GitHub..."
    gh auth login
fi

echo "✅ GitHub CLI is authenticated"
echo ""

# Get repository
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
echo "📂 Repository: $REPO"
echo ""

echo "=================================="
echo "Current Repository Secrets"
echo "=================================="
echo ""

if gh secret list >/dev/null 2>&1; then
    gh secret list
    echo ""
else
    echo "⚠️  Cannot list secrets (requires admin/maintain permissions)"
    echo ""
fi

echo "=================================="
echo "Secret Management Options"
echo "=================================="
echo ""
echo "1. Add a new secret"
echo "2. Update an existing secret"
echo "3. Delete a secret"
echo "4. View required secrets"
echo "5. Exit"
echo ""

read -p "Choose an option (1-5): " OPTION

case $OPTION in
    1)
        echo ""
        echo "Add New Secret"
        echo "--------------"
        echo ""
        
        read -p "Secret name: " SECRET_NAME
        
        echo ""
        echo "Enter secret value (input will be hidden):"
        read -s SECRET_VALUE
        echo ""
        
        echo "$SECRET_VALUE" | gh secret set "$SECRET_NAME"
        echo "✅ Secret '$SECRET_NAME' added successfully"
        ;;
        
    2)
        echo ""
        echo "Update Existing Secret"
        echo "---------------------"
        echo ""
        
        read -p "Secret name: " SECRET_NAME
        
        echo ""
        echo "Enter new secret value (input will be hidden):"
        read -s SECRET_VALUE
        echo ""
        
        echo "$SECRET_VALUE" | gh secret set "$SECRET_NAME"
        echo "✅ Secret '$SECRET_NAME' updated successfully"
        ;;
        
    3)
        echo ""
        echo "Delete Secret"
        echo "-------------"
        echo ""
        
        read -p "Secret name: " SECRET_NAME
        read -p "Are you sure you want to delete '$SECRET_NAME'? (y/n) " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            gh secret delete "$SECRET_NAME"
            echo "✅ Secret '$SECRET_NAME' deleted successfully"
        else
            echo "❌ Deletion cancelled"
        fi
        ;;
        
    4)
        echo ""
        echo "Required Secrets for WejdanAI"
        echo "============================"
        echo ""
        echo "1. VERCEL_TOKEN"
        echo "   Purpose: Vercel deployment"
        echo "   Get from: https://vercel.com/account/tokens"
        echo ""
        echo "2. POSTGRES_URL"
        echo "   Purpose: Database connection"
        echo "   Format: postgresql://user:pass@host:5432/db?sslmode=require"
        echo ""
        echo "3. AZURE_STATIC_WEB_APPS_API_TOKEN (Optional)"
        echo "   Purpose: Azure Static Web Apps deployment"
        echo "   Get from: Azure Portal"
        echo ""
        echo "4. GITHUB_TOKEN"
        echo "   Purpose: GitHub Actions (automatically provided)"
        echo "   Note: No manual configuration needed"
        echo ""
        
        echo "To add a secret, run this script again and choose option 1."
        ;;
        
    5)
        echo "Goodbye!"
        exit 0
        ;;
        
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

echo ""
echo "=================================="
echo "✅ Done"
echo "=================================="
echo ""
echo "Run './scripts/validate-tokens.sh' to test your configuration"
echo "Or go to: https://github.com/$REPO/actions"
echo "And run the 'Test Token Configuration' workflow"
echo ""
