# Risk Documentation Hub - Manual Database Setup Instructions

## Problem Summary

The Risk Documentation Hub website at https://risk.johnnycchung.com is experiencing authentication issues because the database tables haven't been initialized. The middleware is currently blocking access to setup endpoints.

## Root Cause

1. **Database State**: PostgreSQL database exists but has no tables
2. **Middleware Issue**: All API routes are being redirected to the signin page
3. **Authentication Failure**: Users can't log in because the `users` table doesn't exist

## Solution: Manual Database Initialization

Since the automated setup endpoints are blocked, we need to manually trigger the database initialization. Here are multiple approaches:

### Method 1: Direct API Calls (Recommended)

Use these curl commands to initialize the database:

```bash
# Step 1: Test current database state
curl -s "https://risk.johnnycchung.com/api/test-db"

# Step 2: Initialize database tables
curl -s -X POST "https://risk.johnnycchung.com/api/bootstrap"

# Step 3: Seed demo data
curl -s -X POST "https://risk.johnnycchung.com/api/seed-db?secret=setup-risk-docs-2024"

# Step 4: Verify setup
curl -s "https://risk.johnnycchung.com/api/test-db"
```

### Method 2: JavaScript Initialization Script

Run the included script:

```bash
cd /path/to/risk-documentation-hub
node simple-init.js
```

### Method 3: Browser Console Method

1. Go to https://risk.johnnycchung.com
2. Open browser developer tools (F12)
3. Go to Console tab
4. Paste and run this code:

```javascript
// Database initialization via browser console
async function initDB() {
    console.log('🚀 Initializing database...');
    
    try {
        // Test connection
        let response = await fetch('/api/test-db');
        let result = await response.json();
        console.log('Database test:', result);
        
        // Initialize tables
        response = await fetch('/api/bootstrap', { method: 'POST' });
        result = await response.json();
        console.log('Bootstrap result:', result);
        
        // Seed data
        response = await fetch('/api/seed-db?secret=setup-risk-docs-2024', { method: 'POST' });
        result = await response.json();
        console.log('Seed result:', result);
        
        console.log('✅ Database initialization complete!');
        console.log('Demo accounts:');
        console.log('- admin@example.com / password123');
        console.log('- manager@example.com / password123');
        console.log('- user@example.com / password123');
        console.log('- viewer@example.com / password123');
        
    } catch (error) {
        console.error('❌ Initialization failed:', error);
    }
}

// Run initialization
initDB();
```

### Method 4: Using the Authentication System

The application is designed to auto-initialize when someone tries to log in. Try this:

1. Go to https://risk.johnnycchung.com
2. Try to log in with: `admin@example.com` / `password123`
3. The login will trigger the `ensureDatabase()` function in `auth.ts`
4. This should create the basic tables and users

## Expected Results

After successful initialization, you should be able to:

1. **Access the website**: https://risk.johnnycchung.com loads the signin page
2. **Log in successfully** with any of these demo accounts:
   - **Admin**: admin@example.com / password123
   - **Manager**: manager@example.com / password123  
   - **User**: user@example.com / password123
   - **Viewer**: viewer@example.com / password123
3. **Access the dashboard**: Users are redirected to `/dashboard` after login
4. **Use core features**: Document upload, search, user management, etc.

## Database Schema Created

The initialization process creates these tables:

- **users**: User accounts and authentication
- **documents**: Document metadata and storage info
- **audit_logs**: Activity tracking and compliance
- Additional tables for versioning, access control, etc.

## Troubleshooting

If initialization fails:

1. **Check Vercel deployment**: Ensure latest code is deployed
2. **Verify environment variables**: DATABASE_URL and NEXTAUTH_SECRET must be set
3. **Database connectivity**: Test if Vercel can connect to PostgreSQL
4. **Middleware conflicts**: The middleware.ts may need updates
5. **Try alternative methods**: If one approach fails, try another

## Security Notes

- The setup secret `setup-risk-docs-2024` is temporary for initialization only
- All demo passwords are `password123` - change them in production
- The admin account has full system access
- Setup endpoints should be disabled after initialization

## Next Steps

Once the database is initialized:

1. Test all demo accounts can log in
2. Upload a test document to verify file handling
3. Check that audit logs are being created
4. Review user permissions and roles
5. Consider changing demo passwords for security

## File Structure Reference

Key files involved in this issue:

- `src/middleware.ts` - Authentication middleware 
- `src/lib/auth.ts` - NextAuth configuration with auto-init
- `src/lib/db-init.ts` - Database initialization logic
- `src/app/api/bootstrap/route.ts` - Emergency database setup
- `src/app/api/test-db/route.ts` - Database connectivity test
- `prisma/schema.prisma` - Complete database schema

The problem should be resolved once any of these initialization methods successfully creates the database tables and demo users.