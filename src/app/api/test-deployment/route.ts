import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'deployed',
    timestamp: new Date().toISOString(),
    message: 'Deployment verification successful',
    version: 'ffd3bdc-enhanced-db-init'
  })
}

export async function POST(request: NextRequest) {
  return GET(request)
}