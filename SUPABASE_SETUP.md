# Supabase Database Setup Instructions

Follow these steps to initialize your Risk Documentation Hub database in Supabase.

## Method 1: Using Supabase Dashboard (Recommended)

1. **Log in to Supabase**
   - Go to https://supabase.com/dashboard
   - Navigate to your project: `vcfvdjdvmwimcvjlbxcf`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the initialization script**
   - Copy the entire contents of `init-database.sql`
   - Paste it into the SQL editor
   - Click "Run" or press Ctrl+Enter

4. **Run the seed data script (optional)**
   - Create a new query
   - Copy the contents of `seed-database.sql`
   - **IMPORTANT**: Update the admin password hash or use the provided test credentials
   - Click "Run"

## Method 2: Using psql Command Line

If you have network access to Supabase from your environment:

```bash
# Using the connection string
psql "postgresql://postgres:t5fqXLxFN2tUcHj@db.vcfvdjdvmwimcvjlbxcf.supabase.co:5432/postgres" -f init-database.sql

# Then run seed data
psql "postgresql://postgres:t5fqXLxFN2tUcHj@db.vcfvdjdvmwimcvjlbxcf.supabase.co:5432/postgres" -f seed-database.sql
```

## Method 3: Using Prisma (from environment with access)

If you're in an environment that can connect to Supabase:

```bash
# Set the correct DATABASE_URL
export DATABASE_URL="postgresql://postgres:t5fqXLxFN2tUcHj@db.vcfvdjdvmwimcvjlbxcf.supabase.co:5432/postgres"

# Push the schema
npx prisma db push

# Run the seed
npm run db:seed
```

## Test Credentials

After running the seed script, you can log in with these test accounts:

- **Admin**: admin@example.com / Admin123!
- **Manager**: manager@example.com / Manager123!
- **User**: user@example.com / User123!
- **Viewer**: viewer@example.com / User123!

## Important Security Notes

1. **Change default passwords immediately** after first login
2. **Review and customize RLS policies** in the init script based on your security requirements
3. **Enable 2FA** for admin accounts
4. **Set up proper backup procedures** in Supabase

## Troubleshooting

### Connection Issues
- Ensure your IP is whitelisted in Supabase (Settings > Database > Connection Pooling)
- Try using the connection pooler URL if direct connection fails
- Check if you need to use SSL mode

### Schema Conflicts
- If tables already exist, you may need to drop them first
- Run `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` to start fresh (WARNING: This deletes all data)

### Permission Issues
- Ensure you're using the postgres user or a user with sufficient privileges
- Check Supabase logs for detailed error messages

## Next Steps

1. Verify the schema by checking Tables in Supabase dashboard
2. Test the application at your deployment URL
3. Configure custom domain routing in Vercel
4. Set up regular backups in Supabase
5. Monitor usage and performance

## Support

For issues specific to:
- Database setup: Check Supabase documentation at https://supabase.com/docs
- Application issues: Check the deployment logs in Vercel
- Schema questions: Refer to `prisma/schema.prisma`