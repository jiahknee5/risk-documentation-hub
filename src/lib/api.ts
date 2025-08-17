// API utility functions that handle basePath correctly

const basePath = process.env.NODE_ENV === 'production' ? '/ragdocumenthub' : ''

export function getApiUrl(path: string): string {
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${basePath}${cleanPath}`
}

export async function apiFetch(path: string, options?: RequestInit) {
  const url = getApiUrl(path)
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  
  if (!response.ok && response.status !== 404) {
    throw new Error(`API error: ${response.status}`)
  }
  
  return response
}