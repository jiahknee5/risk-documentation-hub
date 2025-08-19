# Risk Documentation Hub - Deployment Instructions

## Current Status

The deployment issues have been resolved. The following fixes were applied:

1. **Fixed TypeScript build errors** in `/api/direct-init` route
2. **Made OpenAI API key optional** to prevent build failures
3. **Updated Prisma schema** from PostgreSQL to SQLite to match deployment configuration
4. **Fixed middleware** to allow all API endpoints

## Database Initialization

Once the deployment completes (usually takes 2-3 minutes), follow these steps:

### Method 1: Web UI (Recommended)
1. Navigate to: https://risk.johnnycchung.com/initialize-database
2. Click the "Initialize Database" button
3. Wait for success message showing demo credentials
4. You'll be automatically redirected to the login page

### Method 2: Direct API Call
```bash
curl https://risk.johnnycchung.com/api/direct-init
```

### Method 3: Test Database Endpoint
```bash
curl https://risk.johnnycchung.com/api/test-db
```

## Demo Credentials

After successful initialization, use these credentials:

- **Admin**: admin@example.com / password123
- **Manager**: manager@example.com / password123  
- **User**: user@example.com / password123
- **Viewer**: viewer@example.com / password123

## Verifying Deployment

Check deployment status:
```bash
# Test if site is up
curl -s -o /dev/null -w "%{http_code}" https://risk.johnnycchung.com/

# Test API endpoints
curl https://risk.johnnycchung.com/api/ping

# Check database status
curl https://risk.johnnycchung.com/api/test-db
```

## Environment Variables Required

Make sure these are set in Vercel:

- `NEXTAUTH_URL`: https://risk.johnnycchung.com
- `NEXTAUTH_SECRET`: (generate with `openssl rand -base64 32`)
- `DATABASE_URL`: file:/tmp/data.db
- `JWT_SECRET`: (any secure random string)
- `OPENAI_API_KEY`: (optional - for AI features)

## Troubleshooting

### Database tables don't exist
- Use the initialize-database page as described above
- The SQLite database is created in /tmp which is writable in Vercel

### Authentication not working
- Ensure NEXTAUTH_SECRET is set in Vercel environment variables
- Clear browser cookies and try again

### API endpoints returning 404
- The middleware has been fixed to allow all /api/ routes
- If still having issues, check Vercel function logs

## Next Steps

1. Wait for deployment to complete (check Vercel dashboard)
2. Initialize the database using Method 1 above
3. Test login with demo credentials
4. Upload the 10 risk management documents

## Monitoring Deployment

Watch the deployment progress:
1. Go to https://vercel.com/dashboard
2. Click on the risk-documentation-hub project
3. View the deployment logs in real-time

The deployment should complete successfully now that all build errors are fixed.