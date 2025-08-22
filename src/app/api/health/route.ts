import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      url: process.env.DATABASE_URL ? 'configured' : 'missing',
      type: process.env.DATABASE_URL?.startsWith('file:') ? 'sqlite' : 'other'
    },
    auth: {
      url: process.env.NEXTAUTH_URL || 'not set',
      secret: process.env.NEXTAUTH_SECRET ? 'configured' : 'missing'
    },
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
      external: Math.round(process.memoryUsage().external / 1024 / 1024) + ' MB',
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB'
    }
  }

  // Test database connection
  try {
    await prisma.$queryRaw`SELECT 1`
    diagnostics.database.status = 'connected'
  } catch (error) {
    diagnostics.database.status = 'error'
    diagnostics.database.error = error instanceof Error ? error.message : 'Unknown error'
  }

  return NextResponse.json(diagnostics, { status: 200 })
}