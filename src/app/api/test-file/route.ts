import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('[Test File] Endpoint called')
  
  try {
    // Step 1: Parse form data
    const formData = await request.formData()
    console.log('[Test File] FormData parsed')
    
    // Step 2: Get the file
    const file = formData.get('file')
    console.log('[Test File] File retrieved:', file ? 'Yes' : 'No')
    
    if (!file || !(file instanceof File)) {
      return NextResponse.json({
        success: false,
        error: 'No file found in request',
        formDataKeys: Array.from(formData.keys())
      }, { status: 400 })
    }

    // Step 3: Read file details
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString()
    }
    console.log('[Test File] File info:', fileInfo)

    // Step 4: Try to read file content
    let contentTest = { success: false, preview: '' }
    try {
      const buffer = await file.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      contentTest = {
        success: true,
        preview: bytes.slice(0, 20).toString() // First 20 bytes
      }
    } catch (e) {
      console.error('[Test File] Failed to read content:', e)
    }

    return NextResponse.json({
      success: true,
      message: 'File received successfully',
      file: fileInfo,
      contentTest,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[Test File] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}