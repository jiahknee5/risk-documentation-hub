#!/bin/bash

# Script to configure Vercel environment variables for Grok

echo "Setting up Grok on Vercel..."
echo "============================"
echo ""

# Set the environment variables
echo "Setting AI_PROVIDER=grok..."
vercel env add AI_PROVIDER production <<< "grok"

echo "Setting GROK_API_KEY..."
echo "Please enter your Grok API key when prompted"
vercel env add GROK_API_KEY production

echo "Setting GROK_BASE_URL..."
vercel env add GROK_BASE_URL production <<< "https://api.x.ai/v1"

echo ""
echo "✅ Environment variables configured!"
echo ""
echo "Next steps:"
echo "1. Deploy to apply changes: vercel --prod"
echo "2. Your app will use Grok for AI-enhanced search"
echo ""