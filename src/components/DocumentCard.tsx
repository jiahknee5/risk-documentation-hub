'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import {
  FileText,
  Download,
  Eye,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Shield
} from 'lucide-react'
import { getRiskLevelColor, getComplianceStatusColor } from '@/lib/utils'

interface DocumentCardProps {
  document: {
    id: string
    title: string
    description?: string
    category: string
    riskLevel: string
    complianceStatus: string
    fileName: string
    fileSize: number
    createdAt: string
    user: {
      name: string
      department?: string
    }
    _count?: {
      versions: number
      comments: number
    }
  }
  showActions?: boolean
}

export default function DocumentCard({ document, showActions = true }: DocumentCardProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getRiskIcon = (level: string) => {
    switch (level.toUpperCase()) {
      case 'CRITICAL':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'HIGH':
        return <Shield className="h-4 w-4 text-orange-600" />
      case 'MEDIUM':
        return <Shield className="h-4 w-4 text-yellow-600" />
      default:
        return <Shield className="h-4 w-4 text-green-600" />
    }
  }

  const getComplianceIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'UNDER_REVIEW':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/documents/${document.id}`}
                className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {document.title}
              </Link>
              {document.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {document.description}
                </p>
              )}
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-2">
              <Link
                href={`/documents/${document.id}`}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="View document"
              >
                <Eye className="h-4 w-4" />
              </Link>
              <button
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Download document"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Tags and Metadata */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {document.category.replace('_', ' ')}
          </span>
          
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(document.riskLevel)}`}>
            {getRiskIcon(document.riskLevel)}
            <span className="ml-1">{document.riskLevel}</span>
          </div>
          
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getComplianceStatusColor(document.complianceStatus)}`}>
            {getComplianceIcon(document.complianceStatus)}
            <span className="ml-1">{document.complianceStatus.replace('_', ' ')}</span>
          </div>
        </div>

        {/* File Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <span>{document.fileName}</span>
            <span>{formatFileSize(document.fileSize)}</span>
          </div>
          
          {document._count && (
            <div className="flex items-center space-x-4">
              {document._count.versions > 1 && (
                <span>{document._count.versions} versions</span>
              )}
              {document._count.comments > 0 && (
                <span>{document._count.comments} comments</span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
          <div>
            <span>Uploaded by {document.user.name}</span>
            {document.user.department && (
              <span className="ml-1">({document.user.department})</span>
            )}
          </div>
          <span>{format(new Date(document.createdAt), 'MMM dd, yyyy')}</span>
        </div>
      </div>
    </div>
  )
}