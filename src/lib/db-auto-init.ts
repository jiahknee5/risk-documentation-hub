import { prisma } from './db'
import fs from 'fs'
import path from 'path'

let initialized = false

export async function ensureDatabaseInitialized() {
  if (initialized) return true
  
  console.log('[DB Init] Checking database...')
  
  try {
    // Check if database exists
    await prisma.$queryRaw`SELECT 1 FROM User LIMIT 1`
    initialized = true
    console.log('[DB Init] Database already initialized')
    return true
  } catch (error) {
    console.log('[DB Init] Database not initialized, creating tables...')
    
    try {
      // For SQLite, we need to ensure the database file exists
      if (process.env.DATABASE_URL?.startsWith('file:')) {
        const dbPath = process.env.DATABASE_URL.replace('file:', '')
        const dbDir = path.dirname(dbPath)
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(dbDir)) {
          fs.mkdirSync(dbDir, { recursive: true })
        }
        
        // Create empty file if it doesn't exist
        if (!fs.existsSync(dbPath)) {
          fs.writeFileSync(dbPath, '')
        }
      }
      
      // Run Prisma push to create tables
      const { execSync } = require('child_process')
      console.log('[DB Init] Running prisma db push...')
      execSync('npx prisma db push --skip-generate', {
        stdio: 'inherit',
        env: process.env
      })
      
      // Create default user
      console.log('[DB Init] Creating default user...')
      await prisma.user.create({
        data: {
          id: 'system-user',
          email: 'system@local',
          name: 'System User',
          password: 'not-used',
          role: 'USER',
          isActive: true
        }
      }).catch(() => {
        console.log('[DB Init] Default user already exists')
      })
      
      initialized = true
      console.log('[DB Init] Database initialized successfully')
      return true
    } catch (initError) {
      console.error('[DB Init] Failed to initialize database:', initError)
      return false
    }
  }
}