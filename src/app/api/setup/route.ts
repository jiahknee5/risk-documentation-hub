import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcryptjs from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Starting emergency database setup...')
    
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
    
    // Check if users exist
    const userCount = await prisma.user.count()
    
    if (userCount === 0) {
      console.log('🌱 Creating demo users...')
      
      const hashedPassword = await bcryptjs.hash('password123', 10)
      
      const users = [
        {
          id: 'admin-123',
          email: 'admin@example.com',
          name: 'System Admin',
          password: hashedPassword,
          role: 'ADMIN',
          department: 'IT',
          isActive: true
        },
        {
          id: 'manager-123',
          email: 'manager@example.com',
          name: 'Risk Manager',
          password: hashedPassword,
          role: 'MANAGER',
          department: 'Risk Management',
          isActive: true
        },
        {
          id: 'user-123',
          email: 'user@example.com',
          name: 'John User',
          password: hashedPassword,
          role: 'USER',
          department: 'Operations',
          isActive: true
        },
        {
          id: 'viewer-123',
          email: 'viewer@example.com',
          name: 'Jane Viewer',
          password: hashedPassword,
          role: 'VIEWER',
          department: 'Compliance',
          isActive: true
        }
      ]

      for (const userData of users) {
        await prisma.user.create({ data: userData })
      }
      
      console.log('✅ Demo users created')
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database setup completed successfully',
      userCount: await prisma.user.count()
    })
    
  } catch (error) {
    console.error('Database setup error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Database setup failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}