# Quick Database Setup with Supabase (Free)

## 1. Create Supabase Account
1. Go to https://supabase.com
2. Sign up for free account
3. Create new project (takes ~2 minutes to provision)

## 2. Get Connection String
1. In Supabase dashboard, go to Settings → Database
2. Copy the "Connection string" → URI
3. It looks like:
```
postgresql://postgres.[your-project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

## 3. Add to Vercel
1. Go to https://vercel.com/dashboard
2. Select your `risk-documentation-hub` project
3. Settings → Environment Variables
4. Add:
   - Name: `DATABASE_URL`
   - Value: [Your Supabase connection string]
   - Environment: Production

## 4. Add Other Required Variables
Generate and add these:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32
```

Add to Vercel:
- `NEXTAUTH_SECRET`: [Generated secret]
- `NEXTAUTH_URL`: https://johnnycchung.com/ragdocumenthub
- `OPENAI_API_KEY`: [Your OpenAI key or leave empty for now]

## 5. Push Database Schema
```bash
# In your local project directory
DATABASE_URL="[your-supabase-connection-string]" npx prisma db push
```

## 6. Redeploy
In Vercel dashboard, click "Redeploy" or run:
```bash
vercel --prod --yes
```

## Alternative: Quick SQLite for Testing
If you want to test quickly without PostgreSQL:
1. Change DATABASE_URL in Vercel to: `file:./prod.db`
2. Note: This is NOT recommended for production