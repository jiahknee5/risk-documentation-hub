// Simple database initialization script
// Run this with: node simple-init.js

const https = require('https');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });
    
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function initializeDatabase() {
  console.log('🚀 Starting database initialization...');
  
  const endpoints = [
    '/api/bootstrap',
    '/api/setup', 
    '/api/init-db',
    '/api/seed-db?secret=setup-risk-docs-2024'
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n🔄 Trying ${endpoint}...`);
    
    try {
      const options = {
        hostname: 'risk.johnnycchung.com',
        port: 443,
        path: endpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'DatabaseInit/1.0'
        }
      };
      
      const response = await makeRequest(options, '{}');
      
      console.log(`Status: ${response.statusCode}`);
      console.log(`Response: ${response.body.substring(0, 200)}...`);
      
      if (response.statusCode === 200 && response.body.includes('success')) {
        console.log('✅ SUCCESS! Database initialized');
        return true;
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n❌ All endpoints failed. Database initialization unsuccessful.');
  return false;
}

// Run the initialization
initializeDatabase().then(success => {
  if (success) {
    console.log('\n🎉 Database is ready!');
    console.log('You can now log in with:');
    console.log('  admin@example.com / password123');
    console.log('  manager@example.com / password123');
    console.log('  user@example.com / password123');
    console.log('  viewer@example.com / password123');
  } else {
    console.log('\n💡 Try manual initialization:');
    console.log('1. Go to https://risk.johnnycchung.com/auth/signin');
    console.log('2. Try logging in with admin@example.com / password123');
    console.log('3. The login attempt should trigger auto-initialization');
  }
}).catch(console.error);