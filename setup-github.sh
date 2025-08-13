#!/bin/bash

echo "📦 Setting up GitHub repository for Risk Documentation Hub"
echo "========================================================="

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI (gh) is not installed."
    echo "Please install it: brew install gh"
    exit 1
fi

# Check if already in a git repo
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
    git add -A
    git commit -m "Initial commit: Risk Documentation Hub MVP"
fi

# Create GitHub repository
echo "Creating GitHub repository..."
gh repo create risk-documentation-hub --public --source=. --remote=origin --push

echo "✅ GitHub repository created and code pushed!"
echo ""
echo "Repository URL: https://github.com/$(gh api user -q .login)/risk-documentation-hub"
echo ""
echo "Next step: Run ./deploy.sh to deploy to Vercel"