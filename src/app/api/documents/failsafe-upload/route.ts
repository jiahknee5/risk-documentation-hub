import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  console.log('[Failsafe Upload] Starting upload process')
  
  try {
    // 1. Parse form data
    let formData
    try {
      formData = await request.formData()
    } catch (error) {
      console.error('[Failsafe Upload] Failed to parse form data:', error)
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }

    const file = formData.get('file') as File
    if (!file) {
      console.error('[Failsafe Upload] No file in form data')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const title = formData.get('title') as string || file.name
    const description = formData.get('description') as string || ''
    const category = formData.get('category') as string || 'OTHER'
    const riskLevel = formData.get('riskLevel') as string || 'MEDIUM'
    const tags = formData.get('tags') as string || ''

    console.log('[Failsafe Upload] File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      title
    })

    // 2. Ensure we have a user (create anonymous if needed)
    let userId = 'anonymous'
    try {
      // Check if anonymous user exists
      let user = await prisma.user.findUnique({
        where: { id: 'anonymous' }
      })

      if (!user) {
        console.log('[Failsafe Upload] Creating anonymous user')
        user = await prisma.user.create({
          data: {
            id: 'anonymous',
            email: 'anonymous@system.local',
            name: 'Anonymous User',
            password: 'not-used',
            role: 'USER',
            isActive: true
          }
        })
      }
      userId = user.id
    } catch (error) {
      console.error('[Failsafe Upload] User creation failed:', error)
      // Continue with anonymous ID
    }

    // 3. Create document with minimal required fields
    const documentId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    try {
      const document = await prisma.document.create({
        data: {
          id: documentId,
          title: title.substring(0, 255), // Ensure title fits in database
          description: description.substring(0, 1000), // Limit description
          category: category as any,
          riskLevel: riskLevel as any,
          tags: tags.substring(0, 500), // Limit tags
          fileName: file.name.substring(0, 255),
          filePath: `/uploads/${documentId}/${file.name}`,
          fileSize: file.size,
          mimeType: file.type || 'application/octet-stream',
          uploadedBy: userId,
          isActive: true
        }
      })

      console.log('[Failsafe Upload] Document created successfully:', document.id)

      // Try to create audit log but don't fail if it doesn't work
      try {
        await prisma.auditLog.create({
          data: {
            id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            action: 'DOCUMENT_UPLOAD',
            documentId: document.id,
            userId: userId,
            details: JSON.stringify({
              fileName: file.name,
              fileSize: file.size,
              title: title
            })
          }
        })
      } catch (auditError) {
        console.error('[Failsafe Upload] Audit log failed (non-critical):', auditError)
      }

      return NextResponse.json({
        success: true,
        document: {
          id: document.id,
          title: document.title,
          fileName: document.fileName,
          uploadedAt: document.createdAt
        }
      })
    } catch (dbError) {
      console.error('[Failsafe Upload] Database error:', dbError)
      
      // Return detailed error in development
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          error: 'Database error',
          details: dbError instanceof Error ? {
            message: dbError.message,
            name: dbError.name,
            stack: dbError.stack
          } : 'Unknown error'
        }, { status: 500 })
      }
      
      return NextResponse.json({
        error: 'Failed to save document'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('[Failsafe Upload] Unexpected error:', error)
    return NextResponse.json({
      error: 'Upload failed',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 })
  }
}