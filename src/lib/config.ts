// Configuration constants
export const config = {
  basePath: '',
  apiBasePath: '/api'
}

// Helper function to get API URL
export function getApiUrl(path: string): string {
  // For subdomain deployment, always use root-relative paths
  return `/api${path}`
}