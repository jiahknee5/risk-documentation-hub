import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Risk Documentation Hub API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown'
  })
}