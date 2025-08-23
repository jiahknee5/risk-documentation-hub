#!/usr/bin/env node

/**
 * Production Database Initialization Script
 * Run this to properly initialize the SQLite database with correct schema
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function initializeDatabase() {
  console.log('🚀 Initializing production database...');
  
  try {
    // First, let's run Prisma's schema push to create all tables with correct structure
    console.log('📊 Creating database schema using Prisma...');
    
    // For SQLite, we need to ensure the database file exists and has proper schema
    // Run raw SQL to create tables if they don't exist
    
    console.log('Creating users table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'USER',
        "department" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT 1,
        "lastLogin" DATETIME,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email")`;
    
    console.log('Creating documents table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "documents" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "category" TEXT NOT NULL,
        "subCategory" TEXT,
        "filePath" TEXT NOT NULL,
        "fileName" TEXT NOT NULL,
        "fileSize" INTEGER NOT NULL,
        "mimeType" TEXT NOT NULL,
        "version" INTEGER NOT NULL DEFAULT 1,
        "riskLevel" TEXT NOT NULL,
        "complianceStatus" TEXT NOT NULL DEFAULT 'PENDING',
        "tags" TEXT,
        "content" TEXT,
        "summary" TEXT,
        "keyPoints" TEXT,
        "uploadedBy" TEXT NOT NULL,
        "approvedBy" TEXT,
        "approvedAt" DATETIME,
        "expiryDate" DATETIME,
        "isActive" BOOLEAN NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("uploadedBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        FOREIGN KEY ("approvedBy") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `;
    
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "documents_uploadedBy_idx" ON "documents"("uploadedBy")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "documents_category_idx" ON "documents"("category")`;
    
    console.log('Creating audit_logs table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "documentId" TEXT,
        "entityType" TEXT,
        "entityId" TEXT,
        "details" TEXT,
        "ipAddress" TEXT,
        "userAgent" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        FOREIGN KEY ("documentId") REFERENCES "documents" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      )
    `;
    
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "audit_logs_userId_idx" ON "audit_logs"("userId")`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "audit_logs_documentId_idx" ON "audit_logs"("documentId")`;
    
    console.log('✅ Database schema created successfully');
    
    // Check if we have any users
    const userCount = await prisma.user.count();
    console.log(`Found ${userCount} existing users`);
    
    if (userCount === 0) {
      console.log('📝 Creating demo users...');
      
      // Create demo users
      const users = [
        {
          email: 'demo@riskdocs.com',
          name: 'Demo User',
          password: await bcrypt.hash('demo123', 10),
          role: 'USER',
          department: 'Risk Management'
        },
        {
          email: 'admin@riskdocs.com',
          name: 'Admin User',
          password: await bcrypt.hash('admin123', 10),
          role: 'ADMIN',
          department: 'IT Administration'
        },
        {
          email: 'manager@riskdocs.com',
          name: 'Risk Manager',
          password: await bcrypt.hash('manager123', 10),
          role: 'MANAGER',
          department: 'Risk Management'
        }
      ];
      
      for (const userData of users) {
        try {
          const user = await prisma.user.create({
            data: userData
          });
          console.log(`✅ Created user: ${user.email}`);
        } catch (error) {
          console.error(`Failed to create user ${userData.email}:`, error.message);
        }
      }
    }
    
    // Verify everything is working
    console.log('\n📊 Database Status:');
    console.log(`- Users: ${await prisma.user.count()}`);
    console.log(`- Documents: ${await prisma.document.count()}`);
    console.log(`- Audit Logs: ${await prisma.auditLog.count()}`);
    
    console.log('\n✅ Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log('🎉 Success!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });