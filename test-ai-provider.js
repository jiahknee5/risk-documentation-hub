// Test script for AI providers
// Run with: node test-ai-provider.js

const aiProviderCode = `
// Simplified version of the AI provider code for testing

class OSSGPTProvider {
  constructor(baseUrl, apiKey) {
    this.name = 'OSS-GPT'
    this.baseUrl = baseUrl || 'http://localhost:8080'
    this.apiKey = apiKey
  }

  async generateResponse(messages, options = {}) {
    try {
      const headers = { 'Content-Type': 'application/json' }
      if (this.apiKey) headers['Authorization'] = \`Bearer \${this.apiKey}\`

      console.log(\`Calling OSS-GPT at \${this.baseUrl}/v1/chat/completions\`)
      
      const response = await fetch(\`\${this.baseUrl}/v1/chat/completions\`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages,
          temperature: options.temperature || 0.3,
          max_tokens: options.maxTokens || 500,
          model: options.model || 'default'
        })
      })

      if (!response.ok) {
        throw new Error(\`OSS-GPT error: \${response.status} \${response.statusText}\`)
      }

      const data = await response.json()
      return data.choices?.[0]?.message?.content || 'No response generated'
    } catch (error) {
      console.error('OSS-GPT provider error:', error)
      throw error
    }
  }
}

class GrokProvider {
  constructor(apiKey, baseUrl) {
    this.name = 'Grok'
    this.baseUrl = baseUrl || 'https://api.x.ai/v1'
    this.apiKey = apiKey
  }

  async generateResponse(messages, options = {}) {
    try {
      console.log(\`Calling Grok at \${this.baseUrl}/chat/completions\`)
      
      const response = await fetch(\`\${this.baseUrl}/chat/completions\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${this.apiKey}\`
        },
        body: JSON.stringify({
          model: options.model || 'grok-beta',
          messages,
          temperature: options.temperature || 0.3,
          max_tokens: options.maxTokens || 500
        })
      })

      if (!response.ok) {
        throw new Error(\`Grok error: \${response.status} \${response.statusText}\`)
      }

      const data = await response.json()
      return data.choices?.[0]?.message?.content || 'No response generated'
    } catch (error) {
      console.error('Grok provider error:', error)
      throw error
    }
  }
}
`;

// Test function
async function testProvider(provider) {
  const testMessages = [
    {
      role: 'system',
      content: 'You are a helpful assistant.'
    },
    {
      role: 'user',
      content: 'What is 2+2?'
    }
  ];

  console.log(`\\nTesting ${provider} provider...`);
  console.log('=' . repeat(50));

  try {
    let aiProvider;
    
    switch(provider) {
      case 'oss-gpt':
        eval(aiProviderCode);
        const ossUrl = process.env.OSS_GPT_BASE_URL || 'http://localhost:8080';
        const ossKey = process.env.OSS_GPT_API_KEY;
        aiProvider = new OSSGPTProvider(ossUrl, ossKey);
        console.log(`Using OSS-GPT at: ${ossUrl}`);
        break;
        
      case 'grok':
        eval(aiProviderCode);
        const grokKey = process.env.GROK_API_KEY;
        const grokUrl = process.env.GROK_BASE_URL;
        if (!grokKey) {
          console.log('❌ GROK_API_KEY not set');
          return;
        }
        aiProvider = new GrokProvider(grokKey, grokUrl);
        console.log(`Using Grok at: ${grokUrl || 'https://api.x.ai/v1'}`);
        break;
        
      default:
        console.log('❌ Unknown provider:', provider);
        return;
    }

    console.log('\\nSending test message...');
    const response = await aiProvider.generateResponse(testMessages);
    console.log('\\n✅ Response received:');
    console.log(response);
    
  } catch (error) {
    console.log('\\n❌ Test failed:');
    console.log(error.message);
  }
}

// Main execution
async function main() {
  console.log('AI Provider Test Script');
  console.log('======================');
  
  // Load environment variables if .env exists
  try {
    require('dotenv').config();
  } catch (e) {
    console.log('Note: dotenv not installed, using system environment variables');
  }
  
  const provider = process.env.AI_PROVIDER || 'oss-gpt';
  console.log(`\\nConfigured provider: ${provider}`);
  
  await testProvider(provider);
  
  console.log('\\n\\nTo test a different provider:');
  console.log('1. Update AI_PROVIDER in .env');
  console.log('2. Set the appropriate API keys');
  console.log('3. Run this script again');
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.log('This script requires Node.js 18+ for native fetch support');
  console.log('Or install node-fetch: npm install node-fetch');
  process.exit(1);
}

main().catch(console.error);