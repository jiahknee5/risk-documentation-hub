import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

// GET /api/documents/[id] - Get single document
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const document = await prisma.document.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, department: true }
        },
        approver: {
          select: { id: true, name: true, email: true }
        },
        versions: {
          orderBy: { version: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        approvals: {
          orderBy: { requestedAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        complianceChecks: {
          orderBy: { checkedAt: 'desc' }
        }
      }
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Log document view
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        documentId: document.id,
        action: 'DOCUMENT_VIEW',
        details: JSON.stringify({
          title: document.title,
          category: document.category
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error fetching document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/documents/[id] - Update document
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      subCategory,
      riskLevel,
      tags,
      expiryDate,
      complianceStatus
    } = body

    // Check if document exists and user has permission
    const existingDocument = await prisma.document.findUnique({
      where: { id: params.id }
    })

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check permissions (owner or admin)
    if (
      existingDocument.uploadedBy !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update document
    const document = await prisma.document.update({
      where: { id: params.id },
      data: {
        title,
        description,
        category,
        subCategory,
        riskLevel,
        tags: tags ? JSON.stringify(tags) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        complianceStatus,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, department: true }
        }
      }
    })

    // Log document edit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        documentId: document.id,
        action: 'DOCUMENT_EDIT',
        details: JSON.stringify({
          changes: body,
          previousVersion: existingDocument.version
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/documents/[id] - Delete document (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if document exists and user has permission
    const existingDocument = await prisma.document.findUnique({
      where: { id: params.id }
    })

    if (!existingDocument) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // Check permissions (owner or admin)
    if (
      existingDocument.uploadedBy !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Soft delete (mark as inactive)
    await prisma.document.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    // Log document deletion
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        documentId: params.id,
        action: 'DOCUMENT_DELETE',
        details: JSON.stringify({
          title: existingDocument.title,
          category: existingDocument.category
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}