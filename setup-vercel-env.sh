#!/bin/bash

echo "Setting up Vercel environment variables..."

# Your Supabase connection string
DATABASE_URL="postgresql://postgres.vcfvdjdvmwimcvjlbxcf:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require"

# Set environment variables
echo "Setting DATABASE_URL..."
echo "$DATABASE_URL" | vercel env add DATABASE_URL production

echo "Setting NEXTAUTH_SECRET..."
echo "B+uEXbWX11IAAFyeTEyQzbPq4cKze7l9MTgPqmtddIs=" | vercel env add NEXTAUTH_SECRET production

echo "Setting NEXTAUTH_URL..."
echo "https://johnnycchung.com/ragdocumenthub" | vercel env add NEXTAUTH_URL production

echo "Setting OPENAI_API_KEY (optional)..."
echo "sk-your-openai-key-here" | vercel env add OPENAI_API_KEY production

echo "Environment variables set! Now redeploying..."
vercel --prod --yes