import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMM dd, yyyy')
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMM dd, yyyy HH:mm')
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function isDocumentExpired(expiryDate: Date | string | null): boolean {
  if (!expiryDate) return false
  const d = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate
  return isBefore(d, new Date())
}

export function isDocumentExpiringSoon(expiryDate: Date | string | null, daysAhead: number = 30): boolean {
  if (!expiryDate) return false
  const d = typeof expiryDate === 'string' ? new Date(expiryDate) : expiryDate
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + daysAhead)
  return isBefore(d, futureDate) && isAfter(d, new Date())
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

export function isValidFileType(filename: string, allowedTypes: string[]): boolean {
  const extension = getFileExtension(filename)
  return allowedTypes.includes(extension)
}

export function generateDocumentId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9.-]/gi, '_').toLowerCase()
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function getRiskLevelColor(level: string): string {
  switch (level.toUpperCase()) {
    case 'LOW':
      return 'text-green-600 bg-green-100'
    case 'MEDIUM':
      return 'text-yellow-600 bg-yellow-100'
    case 'HIGH':
      return 'text-orange-600 bg-orange-100'
    case 'CRITICAL':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export function getComplianceStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'APPROVED':
      return 'text-green-600 bg-green-100'
    case 'PENDING':
      return 'text-yellow-600 bg-yellow-100'
    case 'UNDER_REVIEW':
      return 'text-blue-600 bg-blue-100'
    case 'REJECTED':
      return 'text-red-600 bg-red-100'
    case 'EXPIRED':
      return 'text-gray-600 bg-gray-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export function truncateText(text: string, length: number = 100): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

export function searchInText(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase())
}

export function highlightSearchTerm(text: string, query: string): string {
  if (!query) return text
  
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
}

export interface SearchFilters {
  category?: string
  riskLevel?: string
  complianceStatus?: string
  department?: string
  dateFrom?: Date
  dateTo?: Date
  tags?: string[]
}

export function buildSearchQuery(filters: SearchFilters): any {
  const where: any = {}
  
  if (filters.category) {
    where.category = filters.category
  }
  
  if (filters.riskLevel) {
    where.riskLevel = filters.riskLevel
  }
  
  if (filters.complianceStatus) {
    where.complianceStatus = filters.complianceStatus
  }
  
  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {}
    if (filters.dateFrom) {
      where.createdAt.gte = filters.dateFrom
    }
    if (filters.dateTo) {
      where.createdAt.lte = filters.dateTo
    }
  }
  
  if (filters.tags && filters.tags.length > 0) {
    where.tags = {
      contains: filters.tags.join(',')
    }
  }
  
  return where
}