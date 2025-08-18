#!/bin/bash

# Risk Documentation Hub - Production Deployment Script
# Deploy to johnnycchung.com/risk

set -e  # Exit on any error

echo "🚀 Deploying Risk Documentation Hub to johnnycchung.com/risk"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Run this script from the project root directory."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Set production environment
export NODE_ENV=production

echo "🔧 Setting up production configuration..."

# Generate production secrets
NEXTAUTH_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
JWT_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

echo "🗄️  Configuring database for production..."

# Generate Prisma client for PostgreSQL
echo "   - Generating Prisma client..."
npx prisma generate

# Test production build
echo "🏗️  Testing production build..."
npm run build

# Deploy to Vercel
echo "☁️  Deploying to Vercel..."

# Set Vercel environment variables
echo "🔐 Setting environment variables..."

vercel env add DATABASE_URL production <<< "postgresql://postgres:t5fqXLxFN2tUcHj@db.vcfvdjdvmwimcvjlbxcf.supabase.co:5432/postgres"
vercel env add NEXTAUTH_SECRET production <<< "$NEXTAUTH_SECRET"
vercel env add NEXTAUTH_URL production <<< "https://johnnycchung.com/risk"
vercel env add JWT_SECRET production <<< "$JWT_SECRET"
vercel env add APP_NAME production <<< "Risk Documentation Hub"
vercel env add APP_URL production <<< "https://johnnycchung.com/risk"
vercel env add MAX_FILE_SIZE production <<< "10485760"
vercel env add BCRYPT_ROUNDS production <<< "12"

# Deploy
echo "🚀 Deploying to production..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your application should be available at:"
echo "   https://johnnycchung.com/risk"
echo ""
echo "🔗 Configure your custom domain in Vercel dashboard:"
echo "   1. Go to your Vercel project settings"
echo "   2. Add 'johnnycchung.com' as a custom domain"
echo "   3. Set up a CNAME record: risk.johnnycchung.com -> your-vercel-url"
echo ""
echo "📋 Test credentials:"
echo "   Admin: admin@example.com / Admin123!"
echo "   Manager: manager@example.com / Manager123!"
echo "   User: user@example.com / User123!"
echo ""
echo "⚠️  Important next steps:"
echo "   1. Initialize the production database schema"
echo "   2. Seed the database with initial data"
echo "   3. Configure OpenAI API key (optional)"
echo "   4. Set up file storage (S3/Cloudinary)"
echo ""