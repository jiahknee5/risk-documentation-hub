# Vercel Environment Variables Setup

## Quick Setup via Vercel Dashboard

1. **Go to your Vercel project**: 
   https://vercel.com/johnnys-projects-0e834ac4/risk-documentation-hub/settings/environment-variables

2. **Add these environment variables** (click "Add Variable" for each):

### DATABASE_URL
```
postgresql://postgres.vcfvdjdvmwimcvjlbxcf:[YOUR_SUPABASE_PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require
```
**Note**: Replace `[YOUR_SUPABASE_PASSWORD]` with your actual Supabase database password

To get your password:
- Go to https://supabase.com/dashboard/project/vcfvdjdvmwimcvjlbxcf
- Settings → Database → Database Password
- Or use the password you set when creating the project

### NEXTAUTH_SECRET
```
B+uEXbWX11IAAFyeTEyQzbPq4cKze7l9MTgPqmtddIs=
```

### NEXTAUTH_URL
```
https://johnnycchung.com/ragdocumenthub
```

### OPENAI_API_KEY (Optional - for AI features)
```
sk-[your-openai-api-key]
```
Get from: https://platform.openai.com/api-keys

## 3. Push Database Schema

Once DATABASE_URL is set, run locally:

```bash
# Test connection first
DATABASE_URL="postgresql://postgres.vcfvdjdvmwimcvjlbxcf:[YOUR_PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require" \
npx prisma db push

# If successful, seed with demo data
DATABASE_URL="postgresql://postgres.vcfvdjdvmwimcvjlbxcf:[YOUR_PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require" \
npx prisma db seed
```

## 4. Redeploy

After setting all environment variables:

Option A - From Dashboard:
- Click "Redeploy" button in Vercel

Option B - From CLI:
```bash
vercel --prod --yes
```

## 5. Configure Domain

In Vercel Dashboard:
1. Go to Settings → Domains
2. Add domain: `johnnycchung.com`
3. Configure subdirectory for `/ragdocumenthub`

## Your Supabase Details
- **Project**: vcfvdjdvmwimcvjlbxcf
- **URL**: https://vcfvdjdvmwimcvjlbxcf.supabase.co
- **Region**: us-west-1
- **Dashboard**: https://supabase.com/dashboard/project/vcfvdjdvmwimcvjlbxcf