# Risk Documentation Hub - Troubleshooting Guide

## Problem: 404 Error After Login

If you're seeing a 404 error after trying to log in, here are the most common causes and solutions:

### 1. Database Not Initialized

**Symptoms**: 
- Sign-in page loads fine
- After entering credentials, you get a 404 error
- No user records in database

**Solution**:
1. Go to Supabase SQL Editor
2. Run the `init-database.sql` script first
3. Run the `seed-database.sql` script to add test users
4. Verify users exist:
   ```sql
   SELECT email, name, role FROM users;
   ```

### 2. Browser Cache Issues

**Solution**:
1. Clear browser cache and cookies for the domain
2. Try in an incognito/private browser window
3. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### 3. Wrong Credentials

**Test Credentials**:
- Email: `admin@example.com`
- Password: `Admin123!` (capital A, exclamation mark at end)

### 4. Database Connection Issues

**Check in Vercel**:
1. Go to Vercel dashboard
2. Check environment variables
3. Ensure DATABASE_URL is set correctly:
   ```
   postgresql://postgres:t5fqXLxFN2tUcHj@db.vcfvdjdvmwimcvjlbxcf.supabase.co:5432/postgres
   ```

### 5. Session/Cookie Issues

**Solution**:
1. Check browser console for errors
2. Look for session-related errors
3. Ensure cookies are enabled for the domain

## How to Debug

### 1. Check Browser Console
Press F12 and look for:
- Network errors (red requests)
- Console errors (red text)
- Failed API calls

### 2. Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to login
4. Look for:
   - `/api/auth/callback/credentials` - Should return 200 or 302
   - Any 404 responses

### 3. Direct API Test
Try accessing these URLs directly:
- https://risk-documentation-hub.vercel.app/ragdocumenthub/api/auth/providers
- https://risk-documentation-hub.vercel.app/ragdocumenthub/api/auth/csrf

Both should return JSON data.

### 4. Database Query Test
In Supabase SQL Editor, run:
```sql
-- Check if users table exists
SELECT COUNT(*) FROM users;

-- Check specific user
SELECT id, email, name, role, "isActive" 
FROM users 
WHERE email = 'admin@example.com';

-- Check password (should show a bcrypt hash)
SELECT password 
FROM users 
WHERE email = 'admin@example.com';
```

## If Nothing Works

1. **Redeploy the Application**:
   ```bash
   vercel --prod --force
   ```

2. **Check Deployment Logs**:
   - Go to Vercel dashboard
   - Click on the deployment
   - Check "Functions" tab for errors

3. **Verify Environment Variables**:
   ```bash
   vercel env pull
   ```
   Check that all required variables are set:
   - DATABASE_URL
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL

4. **Test with Fresh Database**:
   - Create a new Supabase project
   - Update DATABASE_URL
   - Run init and seed scripts
   - Redeploy

## Working Test URLs

These are confirmed working endpoints:
- Sign-in page: https://risk-documentation-hub.vercel.app/ragdocumenthub/auth/signin
- Main app: https://risk-documentation-hub.vercel.app/ragdocumenthub

## Contact Support

If you continue to experience issues:
1. Check the browser console for specific error messages
2. Look at Vercel function logs
3. Verify database connectivity in Supabase
4. Ensure all environment variables are correctly set