-- Verify Database Setup
-- Run these queries to confirm everything was created correctly

-- 1. Check if tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check if ENUMs were created
SELECT typname AS enum_name
FROM pg_type
WHERE typtype = 'e'
ORDER BY typname;

-- 3. Count records in each table
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'documents', COUNT(*) FROM documents
UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs
UNION ALL
SELECT 'comments', COUNT(*) FROM comments
UNION ALL
SELECT 'system_config', COUNT(*) FROM system_config;

-- 4. List users (without passwords)
SELECT id, email, name, role, department, "isActive" 
FROM users 
ORDER BY role, email;

-- 5. List documents
SELECT id, title, category, "riskLevel", "complianceStatus", "uploadedBy"
FROM documents
ORDER BY "createdAt" DESC;

-- 6. Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;