import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcryptjs from 'bcryptjs'

export async function GET() {
  try {
    console.log('🚀 Direct database initialization starting...')
    
    // Create tables using Prisma's raw SQL
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
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
      )
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "documents" (
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
      )
    `
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
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
      )
    `
    
    console.log('✅ Tables created')
    
    // Create demo users
    const hashedPassword = await bcryptjs.hash('password123', 10)
    
    // Insert users one by one
    await prisma.$executeRaw`
      INSERT OR IGNORE INTO users (id, email, name, password, role, department, isActive, createdAt, updatedAt) 
      VALUES ('admin-direct', 'admin@example.com', 'System Admin', ${hashedPassword}, 'ADMIN', 'IT', 1, datetime('now'), datetime('now'))
    `
    
    await prisma.$executeRaw`
      INSERT OR IGNORE INTO users (id, email, name, password, role, department, isActive, createdAt, updatedAt) 
      VALUES ('manager-direct', 'manager@example.com', 'Risk Manager', ${hashedPassword}, 'MANAGER', 'Risk Management', 1, datetime('now'), datetime('now'))
    `
    
    await prisma.$executeRaw`
      INSERT OR IGNORE INTO users (id, email, name, password, role, department, isActive, createdAt, updatedAt) 
      VALUES ('user-direct', 'user@example.com', 'John User', ${hashedPassword}, 'USER', 'Operations', 1, datetime('now'), datetime('now'))
    `
    
    await prisma.$executeRaw`
      INSERT OR IGNORE INTO users (id, email, name, password, role, department, isActive, createdAt, updatedAt) 
      VALUES ('viewer-direct', 'viewer@example.com', 'Jane Viewer', ${hashedPassword}, 'VIEWER', 'Compliance', 1, datetime('now'), datetime('now'))
    `
    
    console.log('✅ Demo users created')
    
    // Count users
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      success: true,
      message: '✅ Direct database initialization complete!',
      userCount: Number(userCount),
      method: 'prisma-direct',
      credentials: {
        admin: 'admin@example.com / password123',
        manager: 'manager@example.com / password123',
        user: 'user@example.com / password123',
        viewer: 'viewer@example.com / password123'
      }
    })
    
  } catch (error) {
    console.error('Direct initialization failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Direct initialization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}