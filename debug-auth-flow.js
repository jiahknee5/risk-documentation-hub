// Comprehensive auth flow debugging script
const https = require('https');
const { exec } = require('child_process');

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const reqOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function debugAuthFlow() {
  console.log('🔍 Debugging Risk Documentation Hub Auth Flow\n');
  
  const baseUrl = 'https://risk-documentation-hub.vercel.app/ragdocumenthub';
  
  // Test 1: Check main page redirect
  console.log('1. Testing main page redirect:');
  try {
    const mainPage = await makeRequest(baseUrl);
    console.log(`   Status: ${mainPage.status}`);
    console.log(`   Location: ${mainPage.headers.location || 'None'}`);
    if (mainPage.status === 307 || mainPage.status === 302) {
      console.log('   ✅ Main page redirects to auth (expected behavior)');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 2: Check auth signin page
  console.log('\n2. Testing auth signin page:');
  try {
    const signInPage = await makeRequest(`${baseUrl}/auth/signin`);
    console.log(`   Status: ${signInPage.status}`);
    console.log(`   Content-Type: ${signInPage.headers['content-type']}`);
    console.log(`   Content Length: ${signInPage.data.length} bytes`);
    if (signInPage.status === 200 && signInPage.data.includes('Sign in')) {
      console.log('   ✅ Sign-in page loads correctly');
    } else if (signInPage.status === 404) {
      console.log('   ❌ Sign-in page returns 404');
      console.log(`   Response: ${signInPage.data.substring(0, 200)}...`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  
  // Test 3: Check NextAuth API endpoints
  console.log('\n3. Testing NextAuth API endpoints:');
  const authEndpoints = [
    '/api/auth/providers',
    '/api/auth/csrf',
    '/api/auth/session'
  ];
  
  for (const endpoint of authEndpoints) {
    try {
      const response = await makeRequest(`${baseUrl}${endpoint}`);
      console.log(`   ${endpoint}: ${response.status} - ${response.headers['content-type'] || 'No content-type'}`);
      if (response.status === 404) {
        console.log(`     ❌ Endpoint not found`);
      } else if (response.status === 200) {
        console.log(`     ✅ Endpoint accessible`);
      }
    } catch (error) {
      console.log(`   ${endpoint}: ❌ Error - ${error.message}`);
    }
  }
  
  // Test 4: Check if it's a Next.js routing issue
  console.log('\n4. Testing alternate paths:');
  const alternatePaths = [
    '/auth/signin',
    '/ragdocumenthub/auth/signin',
    '/_next/static/chunks/pages/auth/signin.js'
  ];
  
  for (const path of alternatePaths) {
    try {
      const response = await makeRequest(`https://risk-documentation-hub.vercel.app${path}`);
      console.log(`   ${path}: ${response.status}`);
    } catch (error) {
      console.log(`   ${path}: Error - ${error.message}`);
    }
  }
  
  // Test 5: Check Vercel deployment
  console.log('\n5. Vercel deployment check:');
  console.log('   Running: vercel ls risk-documentation-hub');
  exec('vercel ls risk-documentation-hub 2>&1', (error, stdout, stderr) => {
    if (!error) {
      const lines = stdout.split('\n').slice(0, 5);
      lines.forEach(line => console.log(`   ${line}`));
    }
    
    // Test 6: Check build output
    console.log('\n6. Build configuration:');
    console.log('   Next.js basePath: /ragdocumenthub');
    console.log('   Auth pages configured:');
    console.log('     - signIn: /auth/signin');
    console.log('     - signOut: /auth/signout');
    console.log('     - error: /auth/error');
    
    console.log('\n7. Troubleshooting steps:');
    console.log('   a) Clear all browser data for the domain');
    console.log('   b) Try accessing in a completely new browser');
    console.log('   c) Check Vercel Functions logs for errors');
    console.log('   d) Verify NEXTAUTH_URL in Vercel env vars');
    console.log('   e) Check if database is properly initialized');
    
    console.log('\n8. Direct test URLs:');
    console.log('   Main: https://risk-documentation-hub.vercel.app/ragdocumenthub');
    console.log('   Sign-in: https://risk-documentation-hub.vercel.app/ragdocumenthub/auth/signin');
    console.log('   API test: https://risk-documentation-hub.vercel.app/ragdocumenthub/api/auth/providers');
  });
}

debugAuthFlow();