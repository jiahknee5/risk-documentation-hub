import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  console.log('Test upload endpoint called')
  
  try {
    // Test 1: Session check
    const session = await getServerSession(authOptions)
    const sessionTest = {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email
    }
    console.log('Session test:', sessionTest)

    // Test 2: Database connection
    let dbTest = { connected: false, error: null as any }
    try {
      await prisma.$queryRaw`SELECT 1`
      dbTest.connected = true
    } catch (error) {
      dbTest.error = error instanceof Error ? error.message : 'Unknown error'
    }
    console.log('Database test:', dbTest)

    // Test 3: Form data parsing
    let formDataTest = { success: false, fileInfo: null as any, error: null as any }
    try {
      const formData = await request.formData()
      const file = formData.get('file') as File
      if (file) {
        formDataTest.success = true
        formDataTest.fileInfo = {
          name: file.name,
          size: file.size,
          type: file.type
        }
      }
    } catch (error) {
      formDataTest.error = error instanceof Error ? error.message : 'Unknown error'
    }
    console.log('Form data test:', formDataTest)

    // Test 4: Try minimal document creation
    let createTest = { success: false, documentId: null as any, error: null as any }
    if (dbTest.connected && session?.user?.id) {
      try {
        const doc = await prisma.document.create({
          data: {
            id: `test-${Date.now()}`,
            title: 'Test Upload',
            category: 'OTHER',
            riskLevel: 'LOW',
            fileName: 'test.txt',
            filePath: '/test.txt',
            fileSize: 100,
            mimeType: 'text/plain',
            uploadedBy: session.user.id,
            isActive: true
          }
        })
        createTest.success = true
        createTest.documentId = doc.id
        
        // Clean up test document
        await prisma.document.delete({ where: { id: doc.id } })
      } catch (error) {
        createTest.error = error instanceof Error ? error.message : 'Unknown error'
      }
    }
    console.log('Create test:', createTest)

    return NextResponse.json({
      success: true,
      tests: {
        session: sessionTest,
        database: dbTest,
        formData: formDataTest,
        create: createTest
      }
    })
  } catch (error) {
    console.error('Test upload error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}