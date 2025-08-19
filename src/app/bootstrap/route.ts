import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcryptjs from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Starting emergency database bootstrap...')
    
    // Create all tables manually with raw SQL - ensure they exist
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
      
      console.log('✅ All tables created')
      
    } catch (error) {
      console.error('Table creation error:', error)
    }
    
    // Create demo users with proper IDs
    const hashedPassword = await bcryptjs.hash('password123', 10)
    
    const users = [
      {
        id: 'admin-user-001',
        email: 'admin@example.com',
        name: 'System Admin',
        password: hashedPassword,
        role: 'ADMIN',
        department: 'IT',
        isActive: true
      },
      {
        id: 'manager-user-002',
        email: 'manager@example.com',
        name: 'Risk Manager',
        password: hashedPassword,
        role: 'MANAGER',
        department: 'Risk Management',
        isActive: true
      },
      {
        id: 'regular-user-003',
        email: 'user@example.com',
        name: 'John User',
        password: hashedPassword,
        role: 'USER',
        department: 'Operations',
        isActive: true
      },
      {
        id: 'viewer-user-004',
        email: 'viewer@example.com',
        name: 'Jane Viewer',
        password: hashedPassword,
        role: 'VIEWER',
        department: 'Compliance',
        isActive: true
      }
    ]

    // Insert users one by one, handling conflicts
    let usersCreated = 0
    // Use raw SQL to avoid TypeScript type issues
    for (const user of users) {
      try {
        await prisma.$executeRaw`
          INSERT OR REPLACE INTO users (id, email, name, password, role, department, isActive, createdAt, updatedAt)
          VALUES (${user.id}, ${user.email}, ${user.name}, ${user.password}, ${user.role}, ${user.department}, 1, datetime('now'), datetime('now'))
        `
        usersCreated++
        console.log(`✅ User created/updated: ${user.email}`)
      } catch (error) {
        console.log(`User ${user.email} creation failed:`, error)
      }
    }
    
    const finalUserCount = await prisma.user.count()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database bootstrap completed successfully',
      usersCreated,
      totalUsers: finalUserCount,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Bootstrap error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Database bootstrap failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}