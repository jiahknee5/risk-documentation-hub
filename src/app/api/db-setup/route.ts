import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcryptjs from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Starting database setup...')
    
    // Create tables manually
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
    
    // Create users
    const hashedPassword = await bcryptjs.hash('password123', 10)
    
    await prisma.$executeRaw`INSERT OR IGNORE INTO users (id, email, name, password, role, department, isActive, createdAt, updatedAt) VALUES 
      ('admin-123', 'admin@example.com', 'System Admin', ${hashedPassword}, 'ADMIN', 'IT', 1, datetime('now'), datetime('now')),
      ('manager-123', 'manager@example.com', 'Risk Manager', ${hashedPassword}, 'MANAGER', 'Risk Management', 1, datetime('now'), datetime('now')),
      ('user-123', 'user@example.com', 'John User', ${hashedPassword}, 'USER', 'Operations', 1, datetime('now'), datetime('now')),
      ('viewer-123', 'viewer@example.com', 'Jane Viewer', ${hashedPassword}, 'VIEWER', 'Compliance', 1, datetime('now'), datetime('now'))
    `
    
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully',
      userCount: Number(userCount),
      credentials: {
        admin: 'admin@example.com / password123',
        manager: 'manager@example.com / password123',
        user: 'user@example.com / password123',
        viewer: 'viewer@example.com / password123'
      }
    })
    
  } catch (error) {
    console.error('Setup error:', error)
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