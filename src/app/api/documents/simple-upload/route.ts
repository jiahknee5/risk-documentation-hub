import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateId } from '@/lib/utils'
import { reinitializeRAG } from '@/app/api/rag/vercel-search/route'

export async function POST(request: NextRequest) {
  console.log('Simple upload endpoint called')
  
  try {
    // Check session
    const session = await getServerSession(authOptions)
    console.log('Session check:', {
      exists: !!session,
      user: session?.user
    })
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized - no user email' }, { status: 401 })
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      console.log('User not found, creating new user')
      user = await prisma.user.create({
        data: {
          id: generateId(),
          email: session.user.email,
          name: session.user.name || session.user.email,
          password: 'placeholder', // This won't be used for NextAuth
          role: 'USER'
        }
      })
    }

    console.log('User found/created:', user.id)

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string || file?.name || 'Untitled'
    const description = formData.get('description') as string || ''
    const category = formData.get('category') as string || 'OTHER'
    const riskLevel = formData.get('riskLevel') as string || 'MEDIUM'
    const tags = formData.get('tags') as string || ''

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Create document
    const document = await prisma.document.create({
      data: {
        id: generateId(),
        title: title,
        description: description,
        category: category as any,
        riskLevel: riskLevel as any,
        tags: tags,
        fileName: file.name,
        filePath: `/uploads/${file.name}`, // Placeholder path
        fileSize: file.size,
        mimeType: file.type,
        uploadedBy: user.id,
        isActive: true
      }
    })

    console.log('Document created:', document.id)

    // Re-initialize RAG with new document
    try {
      await reinitializeRAG()
    } catch (ragError) {
      console.error('Failed to reinitialize RAG:', ragError)
    }

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        title: document.title,
        fileName: document.fileName
      }
    })
  } catch (error) {
    console.error('Simple upload error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Upload failed',
        type: error instanceof Error ? error.constructor.name : 'Unknown'
      },
      { status: 500 }
    )
  }
}