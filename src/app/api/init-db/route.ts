import { NextRequest, NextResponse } from 'next/server'
import { ensureDatabase } from '@/lib/db-init'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting database initialization...')
    
    const success = await ensureDatabase()
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Database initialized successfully' 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Database initialization failed' 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json({ 
      error: 'Database initialization failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return POST(request)
}