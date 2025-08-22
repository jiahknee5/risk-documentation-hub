import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    // Initialize database with minimal data needed for uploads
    console.log('Initializing upload system...')

    // 1. Check if we have any users
    const userCount = await prisma.user.count()
    
    if (userCount === 0) {
      console.log('No users found, creating default user...')
      
      // Create a default user for uploads
      const hashedPassword = await bcrypt.hash('temp-password', 10)
      await prisma.user.create({
        data: {
          id: 'default-user',
          email: 'uploader@example.com',
          name: 'Document Uploader',
          password: hashedPassword,
          role: 'USER',
          isActive: true
        }
      })
      
      console.log('Default user created')
    }

    // 2. Test document creation
    const testDoc = await prisma.document.create({
      data: {
        id: `init-test-${Date.now()}`,
        title: 'System Test Document',
        category: 'OTHER',
        riskLevel: 'LOW',
        fileName: 'test.txt',
        filePath: '/test.txt',
        fileSize: 100,
        mimeType: 'text/plain',
        uploadedBy: userCount > 0 ? (await prisma.user.findFirst())!.id : 'default-user',
        isActive: true
      }
    })

    // 3. Delete test document
    await prisma.document.delete({
      where: { id: testDoc.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Upload system initialized',
      stats: {
        users: await prisma.user.count(),
        documents: await prisma.document.count()
      }
    })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : 'Unknown'
    }, { status: 500 })
  }
}