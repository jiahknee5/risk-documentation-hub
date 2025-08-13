# Quick Deploy to johnnycchung.com/ragdocumenthub

## Option 1: Interactive Deployment (Recommended)

Run this single command to deploy everything:

```bash
cd /Volumes/project_chimera/projects/risk-documentation-hub
./deploy-to-vercel.sh
```

This script will:
1. Prompt for your Supabase password
2. Set all environment variables in Vercel
3. Deploy your application

## Option 2: Manual Setup via Vercel Dashboard

### 1. Go to Environment Variables
https://vercel.com/johnnys-projects-0e834ac4/risk-documentation-hub/settings/environment-variables

### 2. Add These Variables

Click "Add Variable" for each:

**DATABASE_URL**
```
postgresql://postgres:[YOUR-PASSWORD]@db.vcfvdjdvmwimcvjlbxcf.supabase.co:5432/postgres
```
(Replace [YOUR-PASSWORD] with your actual Supabase password)

**NEXTAUTH_SECRET**
```
B+uEXbWX11IAAFyeTEyQzbPq4cKze7l9MTgPqmtddIs=
```

**NEXTAUTH_URL**
```
https://johnnycchung.com/ragdocumenthub
```

**OPENAI_API_KEY** (Optional)
```
[Your OpenAI API key if you have one]
```

### 3. Redeploy
After adding all variables, click "Redeploy" in the Vercel dashboard.

## Domain Configuration

1. Go to: https://vercel.com/johnnys-projects-0e834ac4/risk-documentation-hub/settings/domains
2. Add domain: `johnnycchung.com`
3. Configure path: `/ragdocumenthub`

## Test Your Deployment

Once deployed, access:
https://johnnycchung.com/ragdocumenthub

Login with demo credentials:
- admin@example.com / password123
- manager@example.com / password123
- user@example.com / password123

## Troubleshooting

If you see database errors:
1. Run `./setup-database-interactive.sh` to initialize the database
2. Make sure your Supabase password is correct
3. Check Vercel Function logs for detailed errors