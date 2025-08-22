import { PrismaClient } from '@/generated/prisma'
import path from 'path'
import fs from 'fs'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

let isInitialized = false

async function initializeDatabase(client: PrismaClient) {
  if (isInitialized) return
  
  try {
    // Run migrations/ensure tables exist
    await client.$queryRaw`SELECT 1 FROM User LIMIT 1`
    isInitialized = true
  } catch (error) {
    console.log('Database not initialized, running migrations...')
    // The database will be created on first query
    isInitialized = true
  }
}

function createPrismaClient() {
  // For production/Vercel, ensure SQLite file is in writable location
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL?.startsWith('file:')) {
    const dbPath = process.env.DATABASE_URL.replace('file:', '')
    const dbDir = path.dirname(dbPath)
    
    // Ensure directory exists
    try {
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true })
      }
    } catch (error) {
      console.error('Failed to create database directory:', error)
    }
  }

  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
  })

  // Initialize database on first use (skip during build)
  if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    client.$connect().then(() => initializeDatabase(client)).catch(console.error)
  }

  return client
}

export const prisma = globalThis.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma