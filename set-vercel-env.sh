#!/bin/bash

echo "Setting Vercel environment variables..."

# Add each environment variable
echo "B+uEXbWX11IAAFyeTEyQzbPq4cKze7l9MTgPqmtddIs=" | vercel env add NEXTAUTH_SECRET production
echo "https://johnnycchung.com/ragdocumenthub" | vercel env add NEXTAUTH_URL production
echo "postgresql://postgres:Johnny!0312@db.vcfvdjdvmwimcvjlbxcf.supabase.co:5432/postgres" | vercel env add DATABASE_URL production

echo ""
echo "Environment variables set!"