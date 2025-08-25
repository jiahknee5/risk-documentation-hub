// Simple Grok API test
const API_KEY = process.env.GROK_API_KEY;
if (!API_KEY) {
  console.log('❌ GROK_API_KEY not found in environment');
  console.log('Set it with: export GROK_API_KEY="your-key"');
  process.exit(1);
}

async function testGrok() {
  console.log('Testing Grok API...\n');
  
  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'grok-2-latest',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.'
          },
          {
            role: 'user', 
            content: 'What is 2+2? Answer in one word.'
          }
        ],
        temperature: 0.3,
        max_tokens: 10
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log('Response:', data.choices[0].message.content);
    } else {
      console.log('❌ Error:', response.status);
      console.log('Details:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
  }
}

testGrok();