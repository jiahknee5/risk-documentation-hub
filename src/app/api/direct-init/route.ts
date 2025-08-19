import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Direct SQLite database initialization using Node.js sqlite3
    const sqlite3 = require('sqlite3').verbose()
    const db = new sqlite3.Database('/tmp/data.db')
    
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        // Create tables
        db.run(`CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'USER',
          department TEXT,
          isActive INTEGER DEFAULT 1,
          lastLogin TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )`, (err: any) => {
          if (err) console.log('Users table error:', err)
        })
        
        db.run(`CREATE TABLE IF NOT EXISTS documents (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          filename TEXT NOT NULL,
          filepath TEXT NOT NULL,
          filesize INTEGER NOT NULL,
          mimetype TEXT NOT NULL,
          category TEXT NOT NULL,
          tags TEXT,
          uploadedById TEXT NOT NULL,
          isActive INTEGER DEFAULT 1,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )`, (err: any) => {
          if (err) console.log('Documents table error:', err)
        })
        
        db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY,
          action TEXT NOT NULL,
          resource TEXT,
          details TEXT,
          category TEXT NOT NULL,
          userId TEXT NOT NULL,
          userEmail TEXT NOT NULL,
          userName TEXT,
          ipAddress TEXT,
          userAgent TEXT,
          timestamp TEXT DEFAULT CURRENT_TIMESTAMP
        )`, (err: any) => {
          if (err) console.log('Audit logs table error:', err)
        })
        
        // Hash password using bcryptjs
        const bcryptjs = require('bcryptjs')
        const hashedPassword = bcryptjs.hashSync('password123', 10)
        
        // Insert users
        const stmt = db.prepare(`INSERT OR IGNORE INTO users (id, email, name, password, role, department) VALUES (?, ?, ?, ?, ?, ?)`)
        
        stmt.run('admin-direct', 'admin@example.com', 'System Admin', hashedPassword, 'ADMIN', 'IT')
        stmt.run('manager-direct', 'manager@example.com', 'Risk Manager', hashedPassword, 'MANAGER', 'Risk Management')
        stmt.run('user-direct', 'user@example.com', 'John User', hashedPassword, 'USER', 'Operations')
        stmt.run('viewer-direct', 'viewer@example.com', 'Jane Viewer', hashedPassword, 'VIEWER', 'Compliance')
        
        stmt.finalize()
        
        // Count users
        db.get(`SELECT COUNT(*) as count FROM users`, (err: any, row: any) => {
          db.close()
          
          if (err) {
            reject(NextResponse.json({
              success: false,
              error: 'Failed to count users',
              details: err.message
            }, { status: 500 }))
          } else {
            resolve(NextResponse.json({
              success: true,
              message: '✅ Direct database initialization complete!',
              userCount: row.count,
              method: 'sqlite3-direct',
              credentials: {
                admin: 'admin@example.com / password123',
                manager: 'manager@example.com / password123',
                user: 'user@example.com / password123',
                viewer: 'viewer@example.com / password123'
              }
            }))
          }
        })
      })
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Direct initialization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}