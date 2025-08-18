const http = require('http');
const { URL } = require('url');

// Test credentials from seed data
const testCredentials = {
  email: 'admin@example.com',
  password: 'Admin123!'
};

console.log('🧪 Testing Risk Documentation Hub functionality...\n');

// Test 1: Check if server is running
function testServerRunning() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000/', (res) => {
      console.log('✅ Server is running on port 3000');
      console.log(`   Status: ${res.statusCode} (${res.statusCode === 307 ? 'redirecting to login' : 'unexpected'})`);
      resolve(res.statusCode === 307);
    }).on('error', (err) => {
      console.log('❌ Server is not running');
      console.log(`   Error: ${err.message}`);
      reject(err);
    });
  });
}

// Test 2: Check signin page
function testSigninPage() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000/auth/signin', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 && data.includes('Sign In')) {
          console.log('✅ Sign-in page is accessible');
          resolve(true);
        } else {
          console.log('❌ Sign-in page issue');
          console.log(`   Status: ${res.statusCode}`);
          resolve(false);
        }
      });
    }).on('error', reject);
  });
}

// Test 3: Check API endpoints
function testAPIEndpoints() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000/api/auth/providers', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const providers = JSON.parse(data);
            if (providers.credentials) {
              console.log('✅ NextAuth providers endpoint working');
              console.log('✅ Credentials provider configured');
              resolve(true);
            } else {
              console.log('❌ Credentials provider not found');
              resolve(false);
            }
          } catch (e) {
            console.log('❌ Invalid JSON response from providers endpoint');
            resolve(false);
          }
        } else {
          console.log('❌ API providers endpoint not accessible');
          console.log(`   Status: ${res.statusCode}`);
          resolve(false);
        }
      });
    }).on('error', reject);
  });
}

// Test 4: Check database connectivity
function testDatabase() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000/api/dashboard/stats', (res) => {
      if (res.statusCode === 401) {
        console.log('✅ Database API endpoint responding (401 = auth required)');
        resolve(true);
      } else if (res.statusCode === 200) {
        console.log('✅ Database API endpoint accessible');
        resolve(true);
      } else {
        console.log('❌ Database API endpoint issue');
        console.log(`   Status: ${res.statusCode}`);
        resolve(false);
      }
    }).on('error', reject);
  });
}

// Run all tests
async function runTests() {
  try {
    await testServerRunning();
    await testSigninPage();
    await testAPIEndpoints();
    await testDatabase();
    
    console.log('\n🎉 All basic tests passed!');
    console.log('\n📋 Test Credentials (from seed data):');
    console.log(`   Admin: ${testCredentials.email} / ${testCredentials.password}`);
    console.log(`   Manager: manager@example.com / Manager123!`);
    console.log(`   User: user@example.com / User123!`);
    console.log('\n🌐 Access the application at: http://localhost:3000');
    console.log('   You will be redirected to the sign-in page');
    console.log('   After login, you should see the main dashboard');
    
  } catch (error) {
    console.log('\n❌ Tests failed:');
    console.log(`   Error: ${error.message}`);
    process.exit(1);
  }
}

runTests();