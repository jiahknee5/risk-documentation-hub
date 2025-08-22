import { PrismaClient } from '@/generated/prisma'
import path from 'path'
import fs from 'fs'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
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

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
  })
}

export const prisma = globalThis.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma