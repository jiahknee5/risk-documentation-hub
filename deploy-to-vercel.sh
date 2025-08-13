#!/bin/bash

echo "🚀 Deploying Risk Documentation Hub to johnnycchung.com/ragdocumenthub"
echo "====================================================================="
echo ""

# Check if logged in to Vercel
if ! vercel whoami > /dev/null 2>&1; then
    echo "Please login to Vercel first:"
    vercel login
fi

echo "Setting environment variables in Vercel..."
echo ""

# Prompt for Supabase password
echo "Enter your Supabase password:"
read -s SUPABASE_PASSWORD
echo ""

# Set environment variables
echo "Setting DATABASE_URL..."
echo "postgresql://postgres:${SUPABASE_PASSWORD}@db.vcfvdjdvmwimcvjlbxcf.supabase.co:5432/postgres" | vercel env add DATABASE_URL production --yes

echo "Setting NEXTAUTH_SECRET..."
echo "B+uEXbWX11IAAFyeTEyQzbPq4cKze7l9MTgPqmtddIs=" | vercel env add NEXTAUTH_SECRET production --yes

echo "Setting NEXTAUTH_URL..."
echo "https://johnnycchung.com/ragdocumenthub" | vercel env add NEXTAUTH_URL production --yes

echo ""
echo "Optional: Enter your OpenAI API key (press Enter to skip):"
read OPENAI_KEY
if [ ! -z "$OPENAI_KEY" ]; then
    echo "$OPENAI_KEY" | vercel env add OPENAI_API_KEY production --yes
fi

echo ""
echo "✅ Environment variables set!"
echo ""
echo "Deploying to production..."
vercel --prod --yes

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Configure domain at: https://vercel.com/johnnys-projects-0e834ac4/risk-documentation-hub/settings/domains"
echo "2. Add johnnycchung.com and set up /ragdocumenthub path"
echo "3. Access your app at: https://johnnycchung.com/ragdocumenthub"