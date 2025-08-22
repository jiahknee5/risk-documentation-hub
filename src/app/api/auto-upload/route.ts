import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import fs from 'fs'
import path from 'path'

// Ensure database exists
async function ensureDatabase() {
  try {
    // Check if we can query the database
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.log('[Auto Upload] Database not ready, attempting to create...')
    
    // For SQLite, ensure the file exists
    if (process.env.DATABASE_URL?.startsWith('file:')) {
      const dbPath = process.env.DATABASE_URL.replace('file:', '')
      const dbDir = path.dirname(dbPath)
      
      try {
        if (!fs.existsSync(dbDir)) {
          fs.mkdirSync(dbDir, { recursive: true })
        }
        
        // Try to push schema
        const { execSync } = require('child_process')
        execSync('npx prisma db push --skip-generate', {
          env: process.env,
          stdio: 'pipe'
        })
        
        console.log('[Auto Upload] Database created')
        return true
      } catch (e) {
        console.error('[Auto Upload] Failed to create database:', e)
        return false
      }
    }
    
    return false
  }
}

// Ensure user exists
async function ensureUser() {
  try {
    let user = await prisma.user.findFirst()
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: 'upload-user',
          email: 'upload@system',
          name: 'Upload User',
          password: 'not-used',
          role: 'USER',
          isActive: true
        }
      })
    }
    return user
  } catch (error) {
    console.error('[Auto Upload] Failed to ensure user:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  console.log('[Auto Upload] Request received')
  
  // Step 1: Ensure database is ready
  const dbReady = await ensureDatabase()
  if (!dbReady) {
    return NextResponse.json({
      success: false,
      error: 'Database not available',
      suggestion: 'Try the no-database upload endpoint instead'
    }, { status: 503 })
  }
  
  // Step 2: Ensure user exists
  const user = await ensureUser()
  if (!user) {
    return NextResponse.json({
      success: false,
      error: 'Could not create user'
    }, { status: 500 })
  }
  
  try {
    // Step 3: Parse upload
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 })
    }
    
    // Step 4: Create document
    const document = await prisma.document.create({
      data: {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: formData.get('title') as string || file.name,
        description: formData.get('description') as string || '',
        category: (formData.get('category') as any) || 'OTHER',
        riskLevel: (formData.get('riskLevel') as any) || 'MEDIUM',
        tags: formData.get('tags') as string || '',
        fileName: file.name,
        filePath: `/uploads/${file.name}`,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        uploadedBy: user.id,
        isActive: true
      }
    })
    
    console.log('[Auto Upload] Document created:', document.id)
    
    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        fileName: document.fileName
      }
    })
  } catch (error) {
    console.error('[Auto Upload] Error:', error)
    
    // If it's a database error, provide helpful message
    if (error instanceof Error && error.message.includes('no such table')) {
      return NextResponse.json({
        success: false,
        error: 'Database tables not created',
        details: 'The database schema needs to be initialized',
        suggestion: 'Use the /api/init-upload endpoint first'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  const dbReady = await ensureDatabase()
  const user = dbReady ? await ensureUser() : null
  
  return NextResponse.json({
    ready: dbReady && user !== null,
    database: dbReady ? 'connected' : 'not ready',
    user: user ? user.email : 'not created',
    message: dbReady && user ? 'System ready for uploads' : 'System needs initialization'
  })
}