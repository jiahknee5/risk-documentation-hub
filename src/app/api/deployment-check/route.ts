import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'DEPLOYED',
    timestamp: new Date().toISOString(),
    message: 'Deployment working correctly',
    version: 'FORCE-DEPLOY-2025-08-19-01:50',
    commit: '962000a',
    middleware: 'BYPASS-ALL-API-ROUTES'
  })
}

export async function POST(request: NextRequest) {
  return GET(request)
}