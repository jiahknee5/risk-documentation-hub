const { PrismaClient } = require('./src/generated/prisma');

async function testConnection() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Successfully connected to database!');
    
    // Test query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Test query successful:', result);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();