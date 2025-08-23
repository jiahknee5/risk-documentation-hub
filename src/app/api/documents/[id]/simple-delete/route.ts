import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[Simple Delete] Deleting document:', params.id)
  
  try {
    // Check if document exists
    const document = await prisma.document.findUnique({
      where: { id: params.id }
    })
    
    if (!document) {
      console.log('[Simple Delete] Document not found:', params.id)
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }
    
    // Do a hard delete for testing
    await prisma.document.delete({
      where: { id: params.id }
    })
    
    console.log('[Simple Delete] Successfully deleted document:', params.id)
    
    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
      documentId: params.id
    })
    
  } catch (error) {
    console.error('[Simple Delete] Error:', error)
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete document' },
      { status: 500 }
    )
  }
}