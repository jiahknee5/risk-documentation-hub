// Test login flow
const https = require('https');

async function testLogin() {
  console.log('🧪 Testing Risk Documentation Hub Login Flow\n');
  
  console.log('1. Testing sign-in page accessibility:');
  const signInUrl = 'https://risk-documentation-hub.vercel.app/ragdocumenthub/auth/signin';
  
  https.get(signInUrl, (res) => {
    console.log(`   Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log('   ✅ Sign-in page is accessible\n');
    } else {
      console.log('   ❌ Sign-in page returned unexpected status\n');
    }
  });
  
  console.log('2. Login Instructions:');
  console.log('   a) Open your browser');
  console.log('   b) Go to: https://risk-documentation-hub.vercel.app/ragdocumenthub');
  console.log('   c) You should be redirected to the sign-in page');
  console.log('   d) Enter credentials:');
  console.log('      Email: admin@example.com');
  console.log('      Password: Admin123!');
  console.log('   e) Click "Sign in"');
  console.log('\n3. Expected Result:');
  console.log('   You should be redirected to the dashboard at:');
  console.log('   https://risk-documentation-hub.vercel.app/ragdocumenthub\n');
  
  console.log('4. If you see a 404 after login:');
  console.log('   - Clear your browser cache and cookies');
  console.log('   - Try in an incognito/private window');
  console.log('   - Check the browser console for errors');
  console.log('   - Make sure you initialized the database with the seed data\n');
  
  console.log('5. Alternative URLs to try:');
  console.log('   - https://risk-documentation-hub.vercel.app/ragdocumenthub/auth/signin');
  console.log('   - https://risk-documentation-ld5wbn0sj-johnnys-projects-0e834ac4.vercel.app/ragdocumenthub');
}

testLogin();