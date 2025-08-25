#!/bin/bash

# Setup script for using Grok with Risk Documentation Hub

echo "Setting up Grok configuration for Risk Documentation Hub"
echo "========================================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
fi

# Function to update .env file
update_env() {
    key=$1
    value=$2
    if grep -q "^$key=" .env; then
        # Update existing key
        sed -i '' "s|^$key=.*|$key=\"$value\"|" .env
    else
        # Add new key
        echo "$key=\"$value\"" >> .env
    fi
}

# Get Grok configuration
echo "Please provide your Grok configuration:"
echo ""

read -p "Grok API Key (required - get from https://x.ai/api): " grok_key

while [ -z "$grok_key" ]; do
    echo "❌ Grok API key is required!"
    read -p "Grok API Key: " grok_key
done

read -p "Grok Base URL (default: https://api.x.ai/v1): " grok_url
grok_url=${grok_url:-https://api.x.ai/v1}

echo ""
echo "Updating configuration..."

# Update .env file
update_env "AI_PROVIDER" "grok"
update_env "GROK_BASE_URL" "$grok_url"
update_env "GROK_API_KEY" "$grok_key"

echo ""
echo "✅ Configuration updated!"
echo ""
echo "Current settings:"
echo "- AI Provider: grok"
echo "- Grok URL: $grok_url"
echo "- Grok Key: ${grok_key:0:10}..."
echo ""

# Test the connection
echo "Testing Grok connection..."
response=$(curl -s -w "\n%{http_code}" -X POST "$grok_url/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $grok_key" \
  -d '{
    "model": "grok-beta",
    "messages": [{"role": "user", "content": "test"}],
    "max_tokens": 1
  }' 2>/dev/null | tail -n 1)

if [ "$response" = "200" ]; then
    echo "✅ Successfully connected to Grok!"
elif [ "$response" = "401" ]; then
    echo "❌ Invalid API key. Please check your Grok API key."
else
    echo "⚠️  Could not verify Grok connection (HTTP $response)"
    echo "   This might be normal - proceed with deployment"
fi

echo ""
echo "Next steps:"
echo "1. Deploy to Vercel: vercel --prod"
echo "2. Set the same environment variables in Vercel dashboard:"
echo "   - AI_PROVIDER=grok"
echo "   - GROK_API_KEY=$grok_key"
echo "   - GROK_BASE_URL=$grok_url"
echo ""