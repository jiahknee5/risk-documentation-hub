import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const debug = {
    timestamp: new Date().toISOString(),
    database: {
      connected: false,
      error: null as any
    },
    documents: {
      count: 0,
      records: [] as any[]
    },
    users: {
      count: 0,
      records: [] as any[]
    },
    tables: {
      exist: false,
      error: null as any
    }
  }

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`
    debug.database.connected = true
  } catch (error) {
    debug.database.error = error instanceof Error ? error.message : 'Connection failed'
  }

  // Check if tables exist
  try {
    // Try to query each table
    await prisma.$queryRaw`SELECT COUNT(*) FROM Document`
    await prisma.$queryRaw`SELECT COUNT(*) FROM User`
    debug.tables.exist = true
  } catch (error) {
    debug.tables.error = error instanceof Error ? error.message : 'Tables missing'
  }

  // Get all documents
  try {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' }
    })
    debug.documents.count = documents.length
    debug.documents.records = documents
  } catch (error) {
    debug.documents.error = error instanceof Error ? error.message : 'Query failed'
  }

  // Get all users
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })
    debug.users.count = users.length
    debug.users.records = users
  } catch (error) {
    debug.users.error = error instanceof Error ? error.message : 'Query failed'
  }

  // Get in-memory documents if available
  try {
    const noDbResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/no-db-upload`)
    if (noDbResponse.ok) {
      const noDbData = await noDbResponse.json()
      debug.inMemoryDocuments = noDbData.documents || []
    }
  } catch (error) {
    debug.inMemoryDocuments = []
  }

  return NextResponse.json(debug, {
    headers: {
      'Cache-Control': 'no-store'
    }
  })
}