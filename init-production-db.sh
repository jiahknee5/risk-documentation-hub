#!/bin/bash

# Initialize Production Database for Risk Documentation Hub
# Run this AFTER deploying to Vercel

set -e

echo "🗄️  Initializing production database..."
echo "======================================="

# Use production environment
export NODE_ENV=production
export DATABASE_URL="postgresql://postgres:t5fqXLxFN2tUcHj@db.vcfvdjdvmwimcvjlbxcf.supabase.co:5432/postgres"

echo "📋 Pushing database schema to production..."
npx prisma db push --force-reset

echo "🌱 Seeding production database..."
npx prisma generate
tsx src/lib/seed.ts

echo "✅ Production database initialized!"
echo ""
echo "👤 Test users created:"
echo "   Admin: admin@example.com / Admin123!"
echo "   Manager: manager@example.com / Manager123!"
echo "   User: user@example.com / User123!"
echo "   Viewer: viewer@example.com / User123!"
echo ""
echo "🌐 You can now test the application at:"
echo "   https://johnnycchung.com/risk"
echo ""