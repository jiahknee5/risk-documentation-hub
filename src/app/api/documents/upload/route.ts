import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateId } from '@/lib/utils'

export async function POST(request: NextRequest) {
  console.log('Upload endpoint called')
  
  try {
    // Check session
    const session = await getServerSession(authOptions)
    console.log('Session:', session ? 'exists' : 'missing')
    
    if (!session?.user) {
      console.log('No authenticated user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    let formData
    try {
      formData = await request.formData()
    } catch (parseError) {
      console.error('Failed to parse form data:', parseError)
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    const file = formData.get('file') as File
    const title = formData.get('title') as string || file?.name || 'Untitled'
    const description = formData.get('description') as string || ''
    const category = formData.get('category') as string || 'OTHER'
    const riskLevel = formData.get('riskLevel') as string || 'MEDIUM'
    const tags = formData.get('tags') as string || ''

    console.log('Upload details:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      title,
      category,
      riskLevel
    })

    if (!file) {
      console.log('No file in form data')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Create document record in database
    const document = await prisma.document.create({
      data: {
        id: generateId(),
        title: title,
        description: description,
        category: category as any, // Cast to DocumentCategory enum
        riskLevel: riskLevel as any, // Cast to RiskLevel enum
        tags: tags,
        fileName: file.name,
        filePath: file.name, // In production, you'd save to cloud storage
        fileSize: file.size,
        mimeType: file.type,
        uploadedBy: session.user.id || 'system',
        isActive: true
      }
    })

    // Log the upload activity
    await prisma.auditLog.create({
      data: {
        id: generateId(),
        action: 'DOCUMENT_UPLOAD',
        documentId: document.id,
        details: JSON.stringify({
          filename: file.name,
          filesize: file.size,
          category: category
        }),
        userId: session.user.id || 'system',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      document: document
    })
  } catch (error) {
    console.error('Error creating document:', error)
    
    // Provide more detailed error message
    let errorMessage = 'Failed to create document'
    if (error instanceof Error) {
      errorMessage = error.message
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}