import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('Database connection test result:', result)
    
    // Test user count
    const userCount = await prisma.user.count()
    console.log('User count:', userCount)
    
    // Test if we can find a specific user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    })
    console.log('Admin user found:', !!adminUser)
    
    return NextResponse.json({
      success: true,
      connection: 'working',
      userCount,
      adminExists: !!adminUser,
      testQuery: result
    })
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
}