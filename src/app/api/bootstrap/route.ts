import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcryptjs from 'bcryptjs'

export async function GET(request: NextRequest) {
  return createDatabase()
}

export async function POST(request: NextRequest) {
  return createDatabase()
}

async function createDatabase() {
  try {
    console.log('🚀 EMERGENCY DATABASE CREATION STARTING...')
    
    // Step 1: Create tables with raw SQL
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
      
      console.log('Creating documents table...')
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
      
      console.log('Creating audit_logs table...')
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
      
      console.log('✅ All tables created successfully')
      
    } catch (tableError) {
      console.error('Table creation error:', tableError)
      // Continue anyway - tables might already exist
    }
    
    // Step 2: Hash password
    console.log('Hashing passwords...')
    const hashedPassword = await bcryptjs.hash('password123', 10)
    
    // Step 3: Create users using raw SQL to avoid Prisma issues
    const users = [
      ['admin-001', 'admin@example.com', 'System Admin', hashedPassword, 'ADMIN', 'IT', 1],
      ['manager-002', 'manager@example.com', 'Risk Manager', hashedPassword, 'MANAGER', 'Risk Management', 1],
      ['user-003', 'user@example.com', 'John User', hashedPassword, 'USER', 'Operations', 1],
      ['viewer-004', 'viewer@example.com', 'Jane Viewer', hashedPassword, 'VIEWER', 'Compliance', 1]
    ]
    
    let created = 0
    for (const [id, email, name, password, role, department, isActive] of users) {
      try {
        console.log(`Creating user: ${email}`)
        await prisma.$executeRaw`
          INSERT OR REPLACE INTO users (id, email, name, password, role, department, isActive, createdAt, updatedAt)
          VALUES (${id}, ${email}, ${name}, ${password}, ${role}, ${department}, ${isActive}, datetime('now'), datetime('now'))
        `
        created++
        console.log(`✅ User created: ${email}`)
      } catch (userError) {
        console.error(`Error creating user ${email}:`, userError)
      }
    }
    
    // Step 4: Verify users exist
    let userCount = 0
    try {
      userCount = await prisma.user.count()
      console.log(`Total users in database: ${userCount}`)
    } catch (countError) {
      console.error('Error counting users:', countError)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'EMERGENCY DATABASE CREATION COMPLETED',
      details: {
        tablesCreated: ['users', 'documents', 'audit_logs'],
        usersCreated: created,
        totalUsers: userCount,
        timestamp: new Date().toISOString(),
        accounts: [
          'admin@example.com / password123 (ADMIN)',
          'manager@example.com / password123 (MANAGER)', 
          'user@example.com / password123 (USER)',
          'viewer@example.com / password123 (VIEWER)'
        ]
      }
    })
    
  } catch (error) {
    console.error('EMERGENCY DATABASE CREATION FAILED:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Emergency database creation failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}