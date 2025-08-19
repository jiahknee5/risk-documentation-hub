import { prisma } from '@/lib/db'
import bcryptjs from 'bcryptjs'

export async function ensureDatabase() {
  try {
    // First ensure all the tables exist
    try {
      // Create users table
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
    
    const users = [
      {
        email: 'admin@example.com',
        name: 'System Admin',
        password: hashedPassword,
        role: 'ADMIN' as const,
        department: 'IT',
        isActive: true
      },
      {
        email: 'manager@example.com',
        name: 'Risk Manager',
        password: hashedPassword,
        role: 'MANAGER' as const,
        department: 'Risk Management',
        isActive: true
      },
      {
        email: 'user@example.com',
        name: 'John User',
        password: hashedPassword,
        role: 'USER' as const,
        department: 'Operations',
        isActive: true
      },
      {
        email: 'viewer@example.com',
        name: 'Jane Viewer',
        password: hashedPassword,
        role: 'VIEWER' as const,
        department: 'Compliance',
        isActive: true
      }
    ]

    for (const userData of users) {
      await prisma.user.create({ data: userData })
    }

    console.log('✅ Database initialized successfully')
    return true
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    return false
  }
}