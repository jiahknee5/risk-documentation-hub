import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'API is working',
    deployment: 'VERCEL-DEPLOYMENT-SUCCESS'
  })
}

export async function POST(request: NextRequest) {
  return GET(request)
}