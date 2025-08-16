import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { authOptions } from '@/lib/auth'
import { generateDocumentSummary } from '@/lib/ai'
import { sanitizeFilename } from '@/lib/utils'

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB
const UPLOAD_DIR = join(process.cwd(), 'uploads')

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true })
  } catch (error) {
    // Directory might already exist
  }
}

async function extractTextFromFile(file: File): Promise<string> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    
    if (file.type === 'application/pdf') {
      const pdfParse = (await import('pdf-parse')).default
      const pdfData = await pdfParse(buffer)
      return pdfData.text
    }
    
    if (file.type.startsWith('text/')) {
      return buffer.toString('utf-8')
    }
    
    // For other file types, return empty string
    // In production, you might want to use additional libraries
    // for extracting text from Word docs, Excel files, etc.
    return ''
  } catch (error) {
    console.error('Error extracting text from file:', error)
    return ''
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await ensureUploadDir()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const riskLevel = formData.get('riskLevel') as string
    const tags = formData.get('tags') as string

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit` },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not supported' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = sanitizeFilename(file.name)
    const fileName = `${timestamp}_${sanitizedName}`
    const filePath = join(UPLOAD_DIR, fileName)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Extract text content
    const content = await extractTextFromFile(file)

    // Generate AI summary if content is available
    let aiAnalysis = null
    if (content && content.trim().length > 100) {
      try {
        aiAnalysis = await generateDocumentSummary(content)
      } catch (error) {
        console.error('Error generating AI summary:', error)
      }
    }

    // Return file information for document creation
    const fileInfo = {
      fileName,
      filePath: fileName, // Store relative path
      fileSize: file.size,
      mimeType: file.type,
      content,
      summary: aiAnalysis?.summary,
      keyPoints: aiAnalysis?.keyPoints,
      aiRiskLevel: aiAnalysis?.riskAssessment?.level,
      complianceInsights: aiAnalysis?.complianceInsights
    }

    return NextResponse.json(fileInfo, { status: 200 })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}