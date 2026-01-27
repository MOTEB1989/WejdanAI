#!/usr/bin/env bash
set -e

echo "=================================="
echo "Token Validation Script"
echo "=================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validation status
ALL_VALID=true

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate GitHub token
validate_github_token() {
    local token="$1"
    
    if ! command_exists curl; then
        echo -e "${YELLOW}⚠${NC} curl not available, skipping API validation"
        return 0
    fi
    
    local response=$(curl -s -H "Authorization: Bearer $token" \
                    -H "Accept: application/vnd.github.v3+json" \
                    https://api.github.com/user)
    
    if echo "$response" | grep -q "login"; then
        local username=$(echo "$response" | grep -o '"login": *"[^"]*"' | head -1 | cut -d'"' -f4)
        echo -e "${GREEN}✓${NC} GitHub token is valid"
        echo "  Authenticated as: $username"
        return 0
    else
        echo -e "${RED}✗${NC} GitHub token is invalid or expired"
        echo "  Response: $response"
        ALL_VALID=false
        return 1
    fi
}

# Function to validate Vercel token
validate_vercel_token() {
    local token="$1"
    
    if ! command_exists curl; then
        echo -e "${YELLOW}⚠${NC} curl not available, skipping API validation"
        return 0
    fi
    
    local response=$(curl -s -H "Authorization: Bearer $token" \
                    https://api.vercel.com/v2/user)
    
    if echo "$response" | grep -q "user"; then
        local username=$(echo "$response" | grep -o '"username": *"[^"]*"' | head -1 | cut -d'"' -f4)
        echo -e "${GREEN}✓${NC} Vercel token is valid"
        echo "  Authenticated as: $username"
        return 0
    else
        echo -e "${RED}✗${NC} Vercel token is invalid or expired"
        echo "  Response: $response"
        ALL_VALID=false
        return 1
    fi
}

echo "📋 Checking Prerequisites..."
echo ""

# Check if GitHub CLI is installed
if command_exists gh; then
    echo -e "${GREEN}✓${NC} GitHub CLI (gh) is installed"
    GH_CLI_VERSION=$(gh --version | head -n 1)
    echo "  Version: $GH_CLI_VERSION"
else
    echo -e "${YELLOW}⚠${NC} GitHub CLI (gh) is not installed"
    echo "  Install from: https://cli.github.com/"
fi

# Check if Vercel CLI is installed
if command_exists vercel; then
    echo -e "${GREEN}✓${NC} Vercel CLI is installed"
    VERCEL_CLI_VERSION=$(vercel --version)
    echo "  Version: $VERCEL_CLI_VERSION"
else
    echo -e "${YELLOW}⚠${NC} Vercel CLI is not installed"
    echo "  Install with: npm i -g vercel"
fi

echo ""
echo "=================================="
echo "🔑 Validating GitHub Token"
echo "=================================="
echo ""

# Check GitHub token
if [ -n "$GITHUB_TOKEN" ]; then
    echo -e "${GREEN}✓${NC} GITHUB_TOKEN environment variable is set"
    validate_github_token "$GITHUB_TOKEN"
elif command_exists gh; then
    # Try using gh CLI auth status
    if gh auth status >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} GitHub authentication is configured via gh CLI"
        gh auth status 2>&1 | grep -E "Logged in to|account"
    else
        echo -e "${RED}✗${NC} GitHub token is not configured"
        echo "  Set GITHUB_TOKEN environment variable or run: gh auth login"
        ALL_VALID=false
    fi
else
    echo -e "${YELLOW}⚠${NC} GITHUB_TOKEN not found and gh CLI not available"
    echo "  Set GITHUB_TOKEN environment variable or install gh CLI"
    ALL_VALID=false
fi

echo ""
echo "=================================="
echo "🔑 Validating Vercel Token"
echo "=================================="
echo ""

# Check Vercel token
if [ -n "$VERCEL_TOKEN" ]; then
    echo -e "${GREEN}✓${NC} VERCEL_TOKEN environment variable is set"
    validate_vercel_token "$VERCEL_TOKEN"
elif command_exists vercel; then
    # Try using vercel whoami
    if vercel whoami >/dev/null 2>&1; then
        USERNAME=$(vercel whoami 2>/dev/null)
        echo -e "${GREEN}✓${NC} Vercel authentication is configured via CLI"
        echo "  Authenticated as: $USERNAME"
    else
        echo -e "${RED}✗${NC} Vercel token is not configured"
        echo "  Set VERCEL_TOKEN environment variable or run: vercel login"
        ALL_VALID=false
    fi
else
    echo -e "${YELLOW}⚠${NC} VERCEL_TOKEN not found and vercel CLI not available"
    echo "  Set VERCEL_TOKEN environment variable or install vercel CLI"
    ALL_VALID=false
fi

echo ""
echo "=================================="
echo "🔑 Validating GitHub Secrets"
echo "=================================="
echo ""

# Check GitHub repository secrets (requires gh CLI and proper permissions)
if command_exists gh && gh auth status >/dev/null 2>&1; then
    echo "Checking repository secrets..."
    
    # Try to list secrets (this requires admin/maintain permissions)
    if gh secret list >/dev/null 2>&1; then
        SECRETS=$(gh secret list)
        echo -e "${GREEN}✓${NC} Repository secrets accessible"
        echo ""
        echo "Configured secrets:"
        echo "$SECRETS"
        
        # Check for specific required secrets
        if echo "$SECRETS" | grep -q "AZURE_STATIC_WEB_APPS_API_TOKEN"; then
            echo -e "${GREEN}✓${NC} AZURE_STATIC_WEB_APPS_API_TOKEN is configured"
        else
            echo -e "${YELLOW}⚠${NC} AZURE_STATIC_WEB_APPS_API_TOKEN is not configured (needed for Azure deployment)"
        fi
        
        if echo "$SECRETS" | grep -q "POSTGRES_URL"; then
            echo -e "${GREEN}✓${NC} POSTGRES_URL is configured"
        else
            echo -e "${YELLOW}⚠${NC} POSTGRES_URL is not configured (needed for database connection)"
        fi
        
        if echo "$SECRETS" | grep -q "VERCEL_TOKEN"; then
            echo -e "${GREEN}✓${NC} VERCEL_TOKEN is configured in repository secrets"
        else
            echo -e "${YELLOW}⚠${NC} VERCEL_TOKEN is not configured in repository secrets"
        fi
    else
        echo -e "${YELLOW}⚠${NC} Unable to list repository secrets (requires admin/maintain permissions)"
    fi
else
    echo -e "${YELLOW}⚠${NC} Cannot check repository secrets (gh CLI not authenticated)"
fi

echo ""
echo "=================================="
echo "📝 Summary"
echo "=================================="
echo ""

if [ "$ALL_VALID" = true ]; then
    echo -e "${GREEN}✓ All validated tokens are working correctly!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tokens are not configured or invalid${NC}"
    echo ""
    echo "Please ensure the following tokens are configured:"
    echo "  1. GitHub Token: Set GITHUB_TOKEN or authenticate with 'gh auth login'"
    echo "  2. Vercel Token: Set VERCEL_TOKEN or authenticate with 'vercel login'"
    echo "  3. Repository Secrets: Configure via GitHub Settings > Secrets and variables > Actions"
    echo ""
    exit 1
fi
