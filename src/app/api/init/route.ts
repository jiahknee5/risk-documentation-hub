import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcryptjs from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Emergency database initialization...')
    
    // Create all tables manually with raw SQL
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
    
    console.log('✅ Tables created')
    
    // Create demo users if none exist
    const userCount = await prisma.user.count()
    console.log(`User count: ${userCount}`)
    
    if (userCount === 0) {
      const hashedPassword = await bcryptjs.hash('password123', 10)
      
      const userInserts = [
        ['admin-init', 'admin@example.com', 'System Admin', hashedPassword, 'ADMIN', 'IT'],
        ['manager-init', 'manager@example.com', 'Risk Manager', hashedPassword, 'MANAGER', 'Risk Management'],
        ['user-init', 'user@example.com', 'John User', hashedPassword, 'USER', 'Operations'],
        ['viewer-init', 'viewer@example.com', 'Jane Viewer', hashedPassword, 'VIEWER', 'Compliance']
      ]
      
      for (const [id, email, name, password, role, department] of userInserts) {
        await prisma.$executeRaw`
          INSERT OR REPLACE INTO users (id, email, name, password, role, department, isActive, createdAt, updatedAt)
          VALUES (${id}, ${email}, ${name}, ${password}, ${role}, ${department}, 1, datetime('now'), datetime('now'))
        `
        console.log(`✅ User created: ${email}`)
      }
    }
    
    const finalUserCount = await prisma.user.count()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Emergency database initialization completed',
      userCount: finalUserCount,
      timestamp: new Date().toISOString(),
      credentials: {
        admin: 'admin@example.com / password123',
        manager: 'manager@example.com / password123', 
        user: 'user@example.com / password123',
        viewer: 'viewer@example.com / password123'
      }
    })
    
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Database initialization failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}