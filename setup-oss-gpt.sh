#!/bin/bash

# Setup script for using OSS-GPT with Risk Documentation Hub

echo "Setting up OSS-GPT configuration for Risk Documentation Hub"
echo "========================================================="
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

# Get OSS-GPT configuration
echo "Please provide your OSS-GPT configuration:"
echo ""

read -p "OSS-GPT Base URL (default: http://localhost:8080): " oss_gpt_url
oss_gpt_url=${oss_gpt_url:-http://localhost:8080}

read -p "OSS-GPT API Key (press enter if not required): " oss_gpt_key

echo ""
echo "Updating configuration..."

# Update .env file
update_env "AI_PROVIDER" "oss-gpt"
update_env "OSS_GPT_BASE_URL" "$oss_gpt_url"
update_env "OSS_GPT_API_KEY" "$oss_gpt_key"

echo ""
echo "✅ Configuration updated!"
echo ""
echo "Current settings:"
echo "- AI Provider: oss-gpt"
echo "- OSS-GPT URL: $oss_gpt_url"
echo "- OSS-GPT Key: $([ -z "$oss_gpt_key" ] && echo "Not set" || echo "Set")"
echo ""

# Test the connection
echo "Testing OSS-GPT connection..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$oss_gpt_url/health" 2>/dev/null || echo "000")

if [ "$response" = "200" ]; then
    echo "✅ Successfully connected to OSS-GPT!"
else
    echo "⚠️  Could not connect to OSS-GPT at $oss_gpt_url"
    echo "   Please ensure your OSS-GPT server is running"
fi

echo ""
echo "Next steps:"
echo "1. Ensure your OSS-GPT server is running at $oss_gpt_url"
echo "2. Deploy to Vercel: vercel --prod"
echo "3. Set the same environment variables in Vercel dashboard"
echo ""