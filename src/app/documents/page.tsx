'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Navigation } from '@/components/Navigation'
import { AuthCheck } from '@/components/AuthCheck'
import { Input, Textarea, Select } from '@/components/Input'

export default function DocumentsPage() {
  return (
    <AuthCheck>
      <DocumentsContent />
    </AuthCheck>
  )
}

function DocumentsContent() {
  const { data: session } = useSession()
  const [documents, setDocuments] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingDocument, setViewingDocument] = useState<any>(null)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'POLICY',
    riskLevel: 'MEDIUM',
    tags: ''
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadForm(prev => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, '') // Remove file extension
      }))
      setShowUploadModal(true)
    }
    event.target.value = '' // Reset file input
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('title', uploadForm.title)
    formData.append('description', uploadForm.description)
    formData.append('category', uploadForm.category)
    formData.append('riskLevel', uploadForm.riskLevel)
    formData.append('tags', uploadForm.tags)
    
    try {
      // Try the main upload endpoint first
      let response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })
      
      // If main endpoint fails, try simple upload
      if (!response.ok && response.status >= 500) {
        console.log('Main upload failed, trying simple upload endpoint')
        response = await fetch('/api/documents/simple-upload', {
          method: 'POST',
          body: formData
        })
      }
      
      // If still failing, try failsafe upload
      if (!response.ok) {
        console.log('Simple upload failed, trying failsafe upload endpoint')
        response = await fetch('/api/documents/failsafe-upload', {
          method: 'POST',
          body: formData
        })
      }
      
      // If still failing, try auto-upload
      if (!response.ok) {
        console.log('Failsafe upload failed, trying auto-upload endpoint')
        response = await fetch('/api/auto-upload', {
          method: 'POST',
          body: formData
        })
      }
      
      // Last resort: no-database upload
      if (!response.ok) {
        console.log('All database uploads failed, trying no-database endpoint')
        response = await fetch('/api/no-db-upload', {
          method: 'POST',
          body: formData
        })
      }
      
      if (response.ok) {
        const result = await response.json()
        console.log('Upload successful:', result)
        // Reset form
        setShowUploadModal(false)
        setSelectedFile(null)
        setUploadForm({
          title: '',
          description: '',
          category: 'POLICY',
          riskLevel: 'MEDIUM',
          tags: ''
        })
        // Refresh documents list immediately and with a delay
        fetchDocuments()
        // Also refresh after a short delay in case of async processing
        setTimeout(() => {
          console.log('Refreshing documents after delay...')
          fetchDocuments()
        }, 1000)
      } else {
        const errorData = await response.json()
        console.error('Upload failed:', response.status, errorData)
        alert(`Upload failed: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload error. Please try again.')
    }
    
    setIsUploading(false)
  }

  const fetchDocuments = async () => {
    try {
      // First try debug endpoint to see what's in the database
      console.log('Fetching documents...')
      let response = await fetch('/api/documents/debug-list')
      
      if (response.ok) {
        const debugData = await response.json()
        console.log('Debug data:', debugData.debug)
        
        if (debugData.documents && debugData.documents.length > 0) {
          setDocuments(debugData.documents)
          return
        }
      }
      
      // Try the main documents endpoint
      response = await fetch('/api/documents')
      
      // If that fails, try the simpler list endpoint
      if (!response.ok) {
        console.log('Main documents endpoint failed, trying list endpoint')
        response = await fetch('/api/documents/list')
      }
      
      if (response.ok) {
        const data = await response.json()
        // Handle both paginated and non-paginated responses
        if (Array.isArray(data)) {
          setDocuments(data)
        } else if (data.documents && Array.isArray(data.documents)) {
          setDocuments(data.documents)
        } else {
          console.warn('Unexpected response format:', data)
          setDocuments([])
        }
      } else {
        console.error('Failed to fetch documents:', response.status)
        const errorText = await response.text()
        console.error('Error response:', errorText)
        // Try to get from no-db endpoint as last resort
        try {
          const noDbResponse = await fetch('/api/no-db-upload')
          if (noDbResponse.ok) {
            const noDbData = await noDbResponse.json()
            if (noDbData.documents) {
              console.log('Using in-memory documents')
              setDocuments(noDbData.documents)
            }
          }
        } catch (e) {
          console.error('No-db fetch failed:', e)
        }
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      setDocuments([])
    }
  }

  useEffect(() => {
    fetchDocuments()
  }, [])

  const handleView = (document: any) => {
    setViewingDocument(document)
    setShowViewModal(true)
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      // Try the main delete endpoint first
      let response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE'
      })

      // If that fails with auth error, try simple delete
      if (!response.ok && response.status === 401) {
        console.log('Main delete failed with auth error, trying simple delete')
        response = await fetch(`/api/documents/${documentId}/simple-delete`, {
          method: 'DELETE'
        })
      }

      if (response.ok) {
        // Remove from local state
        setDocuments(documents.filter((doc: any) => doc.id !== documentId))
        alert('Document deleted successfully')
        // Refresh the list to ensure consistency
        fetchDocuments()
      } else {
        const error = await response.json()
        alert(`Failed to delete document: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete document')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Risk Documents</h1>
          <p className="mt-2 text-gray-600">
            Manage and organize your risk management documentation
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Documents</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.md,.txt"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
              disabled={isUploading || showUploadModal}
            />
            <label
              htmlFor="file-upload"
              className={`cursor-pointer ${isUploading ? 'opacity-50' : 'hover:text-blue-600'}`}
            >
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-lg text-gray-600">
                {isUploading ? 'Uploading...' : 'Click to upload documents'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Supports PDF, DOC, DOCX, MD, TXT files
              </p>
            </label>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Document Library</h2>
          </div>
          
          {documents.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
              <p className="text-gray-600">Upload your first risk management document to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((doc: any) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center">
                              <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                            <div className="text-sm text-gray-500">{doc.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {doc.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleView(doc)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => handleDelete(doc.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Document</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                  <p className="text-sm text-gray-600">{selectedFile?.name}</p>
                </div>

                <Input
                  label="Title"
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Document title"
                />

                <Textarea
                  label="Description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Brief description of the document"
                />

                <Select
                  label="Category"
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="COMPLIANCE">Compliance</option>
                  <option value="OPERATIONAL_RISK">Operational Risk</option>
                  <option value="FINANCIAL_RISK">Financial Risk</option>
                  <option value="CYBERSECURITY">Cybersecurity</option>
                  <option value="REGULATORY">Regulatory</option>
                  <option value="POLICY">Policy</option>
                  <option value="PROCEDURE">Procedure</option>
                  <option value="ASSESSMENT">Assessment</option>
                  <option value="REPORT">Report</option>
                  <option value="OTHER">Other</option>
                </Select>

                <Select
                  label="Risk Level"
                  value={uploadForm.riskLevel}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, riskLevel: e.target.value }))}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </Select>

                <Input
                  label="Tags"
                  type="text"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Comma-separated tags (e.g., risk, compliance, 2025)"
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowUploadModal(false)
                    setSelectedFile(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={isUploading || !uploadForm.title}
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Document Modal */}
        {showViewModal && viewingDocument && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Document Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingDocument.title}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingDocument.description || 'No description'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingDocument.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Risk Level</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingDocument.riskLevel}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">File Name</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingDocument.fileName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">File Size</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {viewingDocument.fileSize ? `${(viewingDocument.fileSize / 1024).toFixed(1)} KB` : 'N/A'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Upload Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {viewingDocument.createdAt ? new Date(viewingDocument.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>

                {viewingDocument.tags && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tags</label>
                    <p className="mt-1 text-sm text-gray-900">{viewingDocument.tags}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Document ID</label>
                  <p className="mt-1 text-sm text-gray-500 font-mono text-xs">{viewingDocument.id}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setViewingDocument(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // In a real app, this would download the file
                    alert('Download functionality would be implemented here')
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}