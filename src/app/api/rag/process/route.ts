import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { LightweightBankingRAG, BankingDocument } from '@/lib/rag/lightweight-search'

// Initialize the RAG system
const ragSystem = new LightweightBankingRAG()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { documentIds } = body

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json({ error: 'No document IDs provided' }, { status: 400 })
    }

    let processedCount = 0
    const errors: string[] = []

    // Process each document
    for (const documentId of documentIds) {
      try {
        // Fetch document from database
        const document = await prisma.document.findUnique({
          where: { id: documentId }
        })

        if (!document) {
          errors.push(`Document ${documentId} not found`)
          continue
        }

        // Extract text content from file
        const content = await extractDocumentContent(document)

        // Prepare document for RAG processing
        const bankingDoc: BankingDocument = {
          id: document.id,
          title: document.title,
          content: content,
          description: document.description || undefined,
          tags: document.tags || undefined,
          category: document.category || undefined,
          createdAt: document.createdAt,
          fileName: document.fileName || undefined,
          fileSize: document.fileSize || undefined,
          riskLevel: document.riskLevel || undefined
        }

        // Process document in RAG system
        ragSystem.processDocument(bankingDoc)

        // Update document as processed
        await prisma.document.update({
          where: { id: documentId },
          data: { 
            isProcessed: true,
            processedAt: new Date()
          }
        })

        processedCount++
      } catch (error) {
        console.error(`Error processing document ${documentId}:`, error)
        errors.push(`Failed to process document ${documentId}: ${error.message}`)
      }
    }

    // Log the processing activity
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DOCUMENTS_PROCESSED_FOR_RAG',
        details: JSON.stringify({
          documentIds,
          processedCount,
          errors
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      processedCount,
      totalDocuments: documentIds.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully processed ${processedCount} out of ${documentIds.length} documents`
    })
  } catch (error) {
    console.error('Error in RAG processing:', error)
    return NextResponse.json(
      { error: 'Internal server error during processing' },
      { status: 500 }
    )
  }
}

// Helper function to extract content from document
async function extractDocumentContent(document: any): Promise<string> {
  // In a real implementation, this would:
  // 1. Read the file from storage (S3, local filesystem, etc.)
  // 2. Use appropriate parser based on file type (PDF, DOCX, TXT, MD)
  // 3. Extract and clean the text content
  
  // For now, we'll use a placeholder that combines available text fields
  let content = ''
  
  if (document.title) content += `Title: ${document.title}\n\n`
  if (document.description) content += `Description: ${document.description}\n\n`
  if (document.tags) content += `Tags: ${document.tags}\n\n`
  
  // Simulate content extraction based on file type
  const fileExtension = document.fileName?.split('.').pop()?.toLowerCase()
  
  switch (fileExtension) {
    case 'pdf':
      content += `[PDF content would be extracted here using pdf-parse or similar library]`
      break
    case 'doc':
    case 'docx':
      content += `[Word document content would be extracted here using mammoth or similar library]`
      break
    case 'txt':
    case 'md':
      content += `[Text/Markdown content would be read directly from file]`
      break
    default:
      content += `[Unsupported file type: ${fileExtension}]`
  }
  
  // Add metadata for better RAG processing
  content += `\n\nMetadata:\n`
  content += `- Category: ${document.category}\n`
  content += `- Risk Level: ${document.riskLevel}\n`
  content += `- Compliance Status: ${document.complianceStatus}\n`
  content += `- Created: ${document.createdAt}\n`
  
  return content
}

// GET endpoint to check RAG system status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const documentCount = ragSystem.getDocumentCount()
    
    return NextResponse.json({
      status: 'active',
      documentsIndexed: documentCount,
      ragType: 'Lightweight Banking RAG with Fuse.js',
      features: [
        'Semantic search with banking-specific term extraction',
        'Risk level assessment',
        'Compliance framework detection',
        'Hybrid search with keyword and semantic matching',
        'Real-time document processing'
      ]
    })
  } catch (error) {
    console.error('Error checking RAG status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}