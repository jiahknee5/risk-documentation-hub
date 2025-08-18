import { NextRequest, NextResponse } from 'next/server'
import { seedDatabase } from '@/lib/seed'

export async function POST(request: NextRequest) {
  try {
    // Simple security check
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    
    if (secret !== 'setup-risk-docs-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('🌱 Seeding production database...')
    await seedDatabase()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully',
      credentials: {
        admin: 'admin@example.com / password123',
        manager: 'manager@example.com / password123',
        user: 'user@example.com / password123',
        viewer: 'viewer@example.com / password123'
      }
    })
  } catch (error) {
    console.error('❌ Seed error:', error)
    return NextResponse.json({ 
      error: 'Seeding failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}