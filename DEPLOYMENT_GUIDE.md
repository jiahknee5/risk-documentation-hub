# Deployment Guide for johnnycchung.com/ragdocumenthub

## Current Status
- ✅ GitHub Repository: https://github.com/jiahknee5/risk-documentation-hub
- ✅ Vercel Project Created: risk-documentation-hub
- ⏳ Environment Variables: Need to be configured

## Required Environment Variables

Login to Vercel Dashboard: https://vercel.com/dashboard

### 1. Navigate to your project settings:
- Click on the `risk-documentation-hub` project
- Go to Settings → Environment Variables

### 2. Add the following variables:

#### DATABASE_URL (Required)
For production, use PostgreSQL. Options:
- **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres
- **Supabase**: https://supabase.com (Free tier available)
- **Neon**: https://neon.tech (Free tier available)

Example format:
```
postgresql://username:password@host:5432/risk_docs?sslmode=require
```

#### NEXTAUTH_SECRET (Required)
Generate a secure secret:
```bash
openssl rand -base64 32
```

#### NEXTAUTH_URL (Required)
```
https://johnnycchung.com/ragdocumenthub
```

#### OPENAI_API_KEY (Required for AI features)
Get from: https://platform.openai.com/api-keys

### 3. Domain Configuration

In Vercel Dashboard:
1. Go to Settings → Domains
2. Add domain: `johnnycchung.com`
3. Configure DNS (if needed)
4. Add the following redirect rules:

```
Source: /ragdocumenthub/:path*
Destination: https://risk-documentation-hub-[your-vercel-subdomain].vercel.app/:path*
```

### 4. Database Setup

Once DATABASE_URL is configured:

```bash
# Install dependencies locally
npm install

# Push schema to production database
npx prisma db push

# Seed with demo data (optional)
npx prisma db seed
```

### 5. Redeploy

After setting environment variables:
```bash
vercel --prod --yes
```

Or trigger redeployment from Vercel dashboard.

## Quick Setup Commands

```bash
# 1. Generate secrets
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"

# 2. Set up free PostgreSQL with Supabase
# Visit: https://supabase.com/dashboard
# Create new project and get connection string

# 3. Redeploy
vercel --prod --yes
```

## Testing

Once deployed, access at:
- https://johnnycchung.com/ragdocumenthub

Test credentials:
- admin@example.com / password123
- manager@example.com / password123
- user@example.com / password123

## Troubleshooting

If you encounter issues:
1. Check Vercel Functions logs
2. Verify environment variables are set
3. Ensure database is accessible
4. Check browser console for errors

## Support

For issues with:
- Deployment: Check Vercel docs or dashboard logs
- Database: Check your database provider's documentation
- Application: Review the README.md and code