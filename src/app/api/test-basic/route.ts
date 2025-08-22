import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    message: 'Basic API endpoint is working'
  })
}

export async function POST(request: NextRequest) {
  try {
    // Test 1: Can we read the request body?
    let bodyTest = { success: false, type: 'unknown' }
    const contentType = request.headers.get('content-type') || ''
    
    if (contentType.includes('application/json')) {
      try {
        const json = await request.json()
        bodyTest = { success: true, type: 'json', data: json }
      } catch (e) {
        bodyTest = { success: false, type: 'json', error: 'Failed to parse JSON' }
      }
    } else if (contentType.includes('multipart/form-data')) {
      try {
        const formData = await request.formData()
        const entries = Array.from(formData.entries()).map(([key, value]) => ({
          key,
          value: value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value
        }))
        bodyTest = { success: true, type: 'formData', entries }
      } catch (e) {
        bodyTest = { success: false, type: 'formData', error: 'Failed to parse form data' }
      }
    }

    // Test 2: Can we access process.env?
    const envTest = {
      NODE_ENV: process.env.NODE_ENV || 'not set',
      hasDatabase: !!process.env.DATABASE_URL,
      hasNextAuth: !!process.env.NEXTAUTH_SECRET
    }

    // Test 3: Can we use basic JavaScript operations?
    const jsTest = {
      math: 2 + 2,
      date: new Date().toISOString(),
      random: Math.random()
    }

    return NextResponse.json({
      success: true,
      tests: {
        request: {
          method: request.method,
          url: request.url,
          contentType,
          headers: Object.fromEntries(request.headers.entries())
        },
        body: bodyTest,
        environment: envTest,
        javascript: jsTest
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : 'Unknown'
    }, { status: 500 })
  }
}