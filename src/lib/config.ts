// Configuration constants
export const config = {
  basePath: '/ragdocumenthub',
  apiBasePath: '/ragdocumenthub/api'
}

// Helper function to get API URL
export function getApiUrl(path: string): string {
  // In development, we don't use basePath
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return `/api${path}`
  }
  
  // In production, use basePath
  return `${config.apiBasePath}${path}`
}