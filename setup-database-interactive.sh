#!/bin/bash

echo "🚀 Risk Documentation Hub - Database Setup"
echo "=========================================="
echo ""
echo "This script will help you set up the database for deployment."
echo ""

# Prompt for Supabase password
echo "Please enter your Supabase password for project vcfvdjdvmwimcvjlbxcf:"
echo "(You can find this in Supabase Dashboard → Settings → Database)"
read -s SUPABASE_PASSWORD
echo ""

# Construct database URL
DATABASE_URL="postgresql://postgres:${SUPABASE_PASSWORD}@db.vcfvdjdvmwimcvjlbxcf.supabase.co:5432/postgres"

echo "Testing database connection..."
# Test connection
DATABASE_URL="$DATABASE_URL" npx prisma db push --skip-seed

if [ $? -eq 0 ]; then
    echo "✅ Database connection successful!"
    echo ""
    echo "Seeding database with demo data..."
    DATABASE_URL="$DATABASE_URL" npx prisma db seed
    
    echo ""
    echo "✅ Database setup complete!"
    echo ""
    echo "Now you need to add these environment variables to Vercel:"
    echo "=================================================="
    echo "DATABASE_URL=$DATABASE_URL"
    echo "NEXTAUTH_SECRET=B+uEXbWX11IAAFyeTEyQzbPq4cKze7l9MTgPqmtddIs="
    echo "NEXTAUTH_URL=https://johnnycchung.com/ragdocumenthub"
    echo "OPENAI_API_KEY=[your-openai-key-optional]"
    echo "=================================================="
    echo ""
    echo "Add these at: https://vercel.com/johnnys-projects-0e834ac4/risk-documentation-hub/settings/environment-variables"
else
    echo "❌ Database connection failed. Please check your password and try again."
    exit 1
fi