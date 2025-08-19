// Direct database initialization via browser
// Open browser console and paste this code

async function initDatabase() {
  console.log('🚀 Starting direct database initialization...');
  
  // Try to trigger through auth flow which should auto-initialize
  const authEndpoints = [
    '/api/auth/providers',
    '/api/auth/session'
  ];
  
  for (const endpoint of authEndpoints) {
    try {
      const response = await fetch(endpoint);
      console.log(`${endpoint}: ${response.status}`);
    } catch (error) {
      console.log(`${endpoint}: ${error.message}`);
    }
  }
  
  // Manual database creation using seed endpoint
  try {
    console.log('Attempting seed-db...');
    const response = await fetch('/api/seed-db?secret=setup-risk-docs-2024', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.text();
    console.log('Seed response:', result);
    
    if (result.includes('does not exist')) {
      console.log('❌ Database tables do not exist');
      console.log('💡 The login auto-initialization should create them');
    }
    
    return result;
  } catch (error) {
    console.error('Database init error:', error);
  }
}

// Run it
initDatabase();