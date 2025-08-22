import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory storage (resets on each deployment)
const documents: any[] = []

export async function GET() {
  return NextResponse.json({
    success: true,
    documents: documents,
    count: documents.length
  })
}

export async function POST(request: NextRequest) {
  console.log('[No-DB Upload] Starting upload')
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 })
    }

    // Create a document record without database
    const document = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: formData.get('title') as string || file.name,
      description: formData.get('description') as string || '',
      category: formData.get('category') as string || 'OTHER',
      riskLevel: formData.get('riskLevel') as string || 'MEDIUM',
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString()
    }

    // Store in memory
    documents.push(document)
    
    console.log('[No-DB Upload] Document stored:', document.id)

    return NextResponse.json({
      success: true,
      message: 'Upload successful (no database)',
      document: document,
      totalDocuments: documents.length
    })
  } catch (error) {
    console.error('[No-DB Upload] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
      errorType: error instanceof Error ? error.constructor.name : 'Unknown'
    }, { status: 500 })
  }
}