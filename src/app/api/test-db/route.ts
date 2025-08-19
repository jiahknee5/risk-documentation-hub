import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcryptjs from 'bcryptjs'

export async function GET() {
  try {
    // First, try to create tables if they don't exist
    try {
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
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`
      
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
        "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`
      
      console.log('✅ Tables created/verified')
    } catch (tableError) {
      console.log('Table creation error (may be normal):', tableError)
    }
    
    // Test user count
    let userCount = 0
    let adminExists = false
    let setupMessage = ''
    
    try {
      userCount = await prisma.user.count()
      console.log('User count:', userCount)
      
      // If no users, create demo users
      if (userCount === 0) {
        const hashedPassword = await bcryptjs.hash('password123', 10)
        
        await prisma.$executeRaw`INSERT OR IGNORE INTO users (id, email, name, password, role, department, isActive, createdAt, updatedAt) VALUES 
          ('admin-test', 'admin@example.com', 'System Admin', ${hashedPassword}, 'ADMIN', 'IT', 1, datetime('now'), datetime('now')),
          ('manager-test', 'manager@example.com', 'Risk Manager', ${hashedPassword}, 'MANAGER', 'Risk Management', 1, datetime('now'), datetime('now')),
          ('user-test', 'user@example.com', 'John User', ${hashedPassword}, 'USER', 'Operations', 1, datetime('now'), datetime('now')),
          ('viewer-test', 'viewer@example.com', 'Jane Viewer', ${hashedPassword}, 'VIEWER', 'Compliance', 1, datetime('now'), datetime('now'))
        `
        
        userCount = await prisma.user.count()
        setupMessage = '🚀 Database initialized with demo users!'
        console.log('✅ Demo users created')
      }
      
      // Test if admin exists
      const adminUser = await prisma.user.findUnique({
        where: { email: 'admin@example.com' }
      })
      adminExists = !!adminUser
      
    } catch (userError) {
      console.log('User operations error:', userError)
    }
    
    return NextResponse.json({
      success: true,
      connection: 'working',
      userCount: Number(userCount),
      adminExists,
      setupMessage: setupMessage || 'Database connection verified',
      credentials: userCount > 0 ? {
        admin: 'admin@example.com / password123',
        manager: 'manager@example.com / password123',
        user: 'user@example.com / password123',
        viewer: 'viewer@example.com / password123'
      } : null
    })
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
}