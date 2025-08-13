#!/bin/bash

echo "🚀 Deploying Risk Documentation Hub to Vercel"
echo "============================================"

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the project first
echo "Building project..."
npm run build

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Configure custom domain in Vercel dashboard"
echo "2. Add johnnychung.com domain"
echo "3. Set up path rewrite for /ragdocumenthub"
echo "4. Configure environment variables:"
echo "   - DATABASE_URL (PostgreSQL)"
echo "   - NEXTAUTH_SECRET"
echo "   - NEXTAUTH_URL=https://johnnychung.com/ragdocumenthub"
echo "   - OPENAI_API_KEY"