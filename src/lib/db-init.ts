import { prisma } from '@/lib/db'
import bcryptjs from 'bcryptjs'

export async function ensureDatabase() {
  try {
    console.log('🚀 Starting database initialization...')
    
    // First ensure all the tables exist
    try {
      console.log('Creating users table...')
      await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'USER',
        "department" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "lastLogin" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`
      
      // Create documents table
      await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "documents" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "filename" TEXT NOT NULL,
        "filepath" TEXT NOT NULL,
        "filesize" INTEGER NOT NULL,
        "mimetype" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "tags" TEXT,
        "uploadedById" TEXT NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )`
      
      // Create audit logs table
      await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "action" TEXT NOT NULL,
        "resource" TEXT,
        "details" TEXT,
        "category" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "userEmail" TEXT NOT NULL,
        "userName" TEXT,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      )`
      
      console.log('✅ All database tables created/verified')
    } catch (schemaError) {
      console.log('Schema may already exist, continuing...', schemaError)
    }
    
    // Try to connect and check if users exist
    const userCount = await prisma.user.count()
    
    if (userCount > 0) {
      console.log('✅ Database already initialized with', userCount, 'users')
      return true
    }
    
    console.log('🌱 Initializing database with demo users...')
    
    // Create demo users
    const hashedPassword = await bcryptjs.hash('password123', 10)
    
    // Create users using raw SQL to avoid Prisma issues
    const users = [
      ['admin-001', 'admin@example.com', 'System Admin', hashedPassword, 'ADMIN', 'IT'],
      ['manager-002', 'manager@example.com', 'Risk Manager', hashedPassword, 'MANAGER', 'Risk Management'],
      ['user-003', 'user@example.com', 'John User', hashedPassword, 'USER', 'Operations'],
      ['viewer-004', 'viewer@example.com', 'Jane Viewer', hashedPassword, 'VIEWER', 'Compliance']
    ]

    for (const [id, email, name, password, role, department] of users) {
      try {
        console.log(`Creating user: ${email}`)
        await prisma.$executeRaw`
          INSERT OR REPLACE INTO users (id, email, name, password, role, department, isActive, createdAt, updatedAt)
          VALUES (${id}, ${email}, ${name}, ${password}, ${role}, ${department}, 1, datetime('now'), datetime('now'))
        `
        console.log(`✅ User created: ${email}`)
      } catch (userError) {
        console.error(`Failed to create user ${email}:`, userError)
      }
    }

    console.log('✅ Database initialized successfully')
    return true
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    return false
  }
}