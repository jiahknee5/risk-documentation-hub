// Test authentication callback
const https = require('https');
const querystring = require('querystring');

async function testAuthCallback() {
  console.log('🔐 Testing Authentication Callback\n');
  
  // First, get CSRF token
  console.log('1. Getting CSRF token...');
  
  const getCsrfToken = () => {
    return new Promise((resolve, reject) => {
      https.get('https://risk-documentation-hub.vercel.app/ragdocumenthub/api/auth/csrf', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            console.log('   CSRF Token received:', parsed.csrfToken ? '✅' : '❌');
            resolve(parsed.csrfToken);
          } catch (e) {
            reject(e);
          }
        });
      });
    });
  };
  
  try {
    const csrfToken = await getCsrfToken();
    
    // Test sign-in with credentials
    console.log('\n2. Testing credential sign-in...');
    
    const postData = querystring.stringify({
      csrfToken: csrfToken,
      email: 'admin@example.com',
      password: 'Admin123!',
      json: 'true'
    });
    
    const options = {
      hostname: 'risk-documentation-hub.vercel.app',
      path: '/ragdocumenthub/api/auth/callback/credentials',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`   Response: ${data}`);
        
        if (res.statusCode === 200 || res.statusCode === 302) {
          console.log('   ✅ Authentication endpoint is working');
        } else {
          console.log('   ❌ Authentication failed');
        }
        
        console.log('\n3. Possible issues:');
        console.log('   - Database not initialized with user data');
        console.log('   - Password hashing mismatch');
        console.log('   - Session configuration issue');
        console.log('   - Middleware blocking the request');
        
        console.log('\n4. Next steps:');
        console.log('   a) Check Vercel Function logs for the /api/auth/[...nextauth] endpoint');
        console.log('   b) Verify database has users with bcrypt hashed passwords');
        console.log('   c) Test with the debug page: https://risk-documentation-hub.vercel.app/ragdocumenthub/debug');
      });
    });
    
    req.on('error', (e) => {
      console.error(`   Error: ${e.message}`);
    });
    
    req.write(postData);
    req.end();
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAuthCallback();