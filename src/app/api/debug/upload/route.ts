import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    checks: {}
  }

  // 1. Check session
  try {
    const session = await getServerSession(authOptions)
    diagnostics.checks.session = {
      success: true,
      hasSession: !!session,
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role
      } : null
    }
  } catch (error) {
    diagnostics.checks.session = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  // 2. Check database connection
  try {
    await prisma.$queryRaw`SELECT 1 as test`
    diagnostics.checks.database = {
      success: true,
      connected: true
    }
  } catch (error) {
    diagnostics.checks.database = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  // 3. Check database file (for SQLite)
  if (process.env.DATABASE_URL?.startsWith('file:')) {
    const dbPath = process.env.DATABASE_URL.replace('file:', '')
    try {
      const stats = fs.statSync(dbPath)
      diagnostics.checks.databaseFile = {
        success: true,
        exists: true,
        size: stats.size,
        permissions: stats.mode.toString(8),
        writeable: fs.accessSync(dbPath, fs.constants.W_OK) === undefined
      }
    } catch (error) {
      diagnostics.checks.databaseFile = {
        success: false,
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // 4. Check if users exist
  try {
    const userCount = await prisma.user.count()
    diagnostics.checks.users = {
      success: true,
      count: userCount
    }
  } catch (error) {
    diagnostics.checks.users = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  // 5. Check if documents table is accessible
  try {
    const docCount = await prisma.document.count()
    diagnostics.checks.documents = {
      success: true,
      count: docCount
    }
  } catch (error) {
    diagnostics.checks.documents = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }

  // 6. Test document creation (without saving)
  if (diagnostics.checks.session?.user?.email) {
    try {
      // First ensure user exists
      let user = await prisma.user.findUnique({
        where: { email: diagnostics.checks.session.user.email }
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            id: `user-${Date.now()}`,
            email: diagnostics.checks.session.user.email,
            name: diagnostics.checks.session.user.name || 'Test User',
            password: 'not-used',
            role: 'USER'
          }
        })
      }

      // Test creating a document
      const testDoc = {
        id: `test-${Date.now()}`,
        title: 'Test Document',
        category: 'OTHER',
        riskLevel: 'LOW',
        fileName: 'test.txt',
        filePath: '/test.txt',
        fileSize: 100,
        mimeType: 'text/plain',
        uploadedBy: user.id,
        isActive: true
      }

      // Validate the data without creating
      diagnostics.checks.documentCreation = {
        success: true,
        testData: testDoc,
        userId: user.id
      }
    } catch (error) {
      diagnostics.checks.documentCreation = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    }
  }

  // 7. Environment variables
  diagnostics.checks.environment = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set'
  }

  return NextResponse.json(diagnostics)
}

export async function POST(request: NextRequest) {
  // Test actual file upload
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    
    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        bufferSize: buffer.byteLength
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}