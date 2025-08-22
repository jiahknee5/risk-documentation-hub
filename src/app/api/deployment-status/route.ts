import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import fs from 'fs'

export async function GET() {
  const status = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    platform: process.env.VERCEL ? 'Vercel' : 'Local',
    
    // Environment variables
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Not set',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
      VERCEL: process.env.VERCEL || 'Not set',
      VERCEL_ENV: process.env.VERCEL_ENV || 'Not set',
      VERCEL_URL: process.env.VERCEL_URL || 'Not set'
    },
    
    // File system check
    filesystem: {
      tmp: 'checking...',
      tmpWriteable: false
    },
    
    // Database check
    database: {
      connected: false,
      error: null as any
    }
  }

  // Check /tmp directory
  try {
    const tmpFiles = fs.readdirSync('/tmp')
    status.filesystem.tmp = `${tmpFiles.length} files`
    
    // Try to write a test file
    const testFile = '/tmp/vercel-test.txt'
    fs.writeFileSync(testFile, 'test')
    fs.unlinkSync(testFile)
    status.filesystem.tmpWriteable = true
  } catch (error) {
    status.filesystem.tmp = error instanceof Error ? error.message : 'Error'
  }

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1 as test`
    status.database.connected = true
    
    // Try to count tables
    const userCount = await prisma.user.count()
    const docCount = await prisma.document.count()
    status.database.counts = {
      users: userCount,
      documents: docCount
    }
  } catch (error) {
    status.database.error = error instanceof Error ? error.message : 'Unknown error'
  }

  return NextResponse.json(status, {
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  })
}