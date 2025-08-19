import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcryptjs from 'bcryptjs'

export async function GET() {
  try {
    console.log('🚀 Starting database initialization via test-db...')
    
    // Create tables with raw SQL - step by step
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
    console.log('✅ Users table created')
    
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
    console.log('✅ Documents table created')
    
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
    console.log('✅ Audit logs table created')
    
    // Create demo users
    const hashedPassword = await bcryptjs.hash('password123', 10)
    
    await prisma.$executeRaw`
      INSERT OR IGNORE INTO users (id, email, name, password, role, department, isActive, createdAt, updatedAt) 
      VALUES ('admin-init', 'admin@example.com', 'System Admin', ${hashedPassword}, 'ADMIN', 'IT', 1, datetime('now'), datetime('now'))
    `
    
    await prisma.$executeRaw`
      INSERT OR IGNORE INTO users (id, email, name, password, role, department, isActive, createdAt, updatedAt) 
      VALUES ('manager-init', 'manager@example.com', 'Risk Manager', ${hashedPassword}, 'MANAGER', 'Risk Management', 1, datetime('now'), datetime('now'))
    `
    
    await prisma.$executeRaw`
      INSERT OR IGNORE INTO users (id, email, name, password, role, department, isActive, createdAt, updatedAt) 
      VALUES ('user-init', 'user@example.com', 'John User', ${hashedPassword}, 'USER', 'Operations', 1, datetime('now'), datetime('now'))
    `
    
    await prisma.$executeRaw`
      INSERT OR IGNORE INTO users (id, email, name, password, role, department, isActive, createdAt, updatedAt) 
      VALUES ('viewer-init', 'viewer@example.com', 'Jane Viewer', ${hashedPassword}, 'VIEWER', 'Compliance', 1, datetime('now'), datetime('now'))
    `
    
    console.log('✅ Demo users created')
    
    // Verify
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      success: true,
      message: '🚀 DATABASE FULLY INITIALIZED!',
      userCount: Number(userCount),
      tablesCreated: ['users', 'documents', 'audit_logs'],
      credentials: {
        admin: 'admin@example.com / password123',
        manager: 'manager@example.com / password123',
        user: 'user@example.com / password123',
        viewer: 'viewer@example.com / password123'
      }
    })
    
  } catch (error) {
    console.error('Database initialization failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error,
      note: 'Database initialization attempted but failed'
    }, { status: 500 })
  }
}