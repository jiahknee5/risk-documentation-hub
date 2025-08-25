/**
 * AI Provider abstraction layer
 * Supports multiple AI providers: OpenAI, Grok, OSS-GPT, and custom endpoints
 */

interface AIProvider {
  name: string
  generateResponse(messages: AIMessage[], options?: AIOptions): Promise<string>
}

interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface AIOptions {
  temperature?: number
  maxTokens?: number
  model?: string
}

// OSS-GPT Provider (self-hosted)
class OSSGPTProvider implements AIProvider {
  name = 'OSS-GPT'
  private baseUrl: string
  private apiKey?: string

  constructor() {
    this.baseUrl = process.env.OSS_GPT_BASE_URL || 'http://localhost:8080'
    this.apiKey = process.env.OSS_GPT_API_KEY
  }

  async generateResponse(messages: AIMessage[], options?: AIOptions): Promise<string> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`
      }

      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages,
          temperature: options?.temperature || 0.3,
          max_tokens: options?.maxTokens || 500,
          model: options?.model || 'default'
        })
      })

      if (!response.ok) {
        throw new Error(`OSS-GPT error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices?.[0]?.message?.content || 'No response generated'
    } catch (error) {
      console.error('OSS-GPT provider error:', error)
      throw error
    }
  }
}

// Grok Provider
class GrokProvider implements AIProvider {
  name = 'Grok'
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = process.env.GROK_BASE_URL || 'https://api.x.ai/v1'
    this.apiKey = process.env.GROK_API_KEY || ''
  }

  async generateResponse(messages: AIMessage[], options?: AIOptions): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: options?.model || 'grok-2-latest',
          messages,
          temperature: options?.temperature || 0.3,
          max_tokens: options?.maxTokens || 500
        })
      })

      if (!response.ok) {
        throw new Error(`Grok error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices?.[0]?.message?.content || 'No response generated'
    } catch (error) {
      console.error('Grok provider error:', error)
      throw error
    }
  }
}

// OpenAI Provider (for backward compatibility)
class OpenAIProvider implements AIProvider {
  name = 'OpenAI'
  
  async generateResponse(messages: AIMessage[], options?: AIOptions): Promise<string> {
    // Dynamic import to avoid loading OpenAI SDK if not needed
    const OpenAI = (await import('openai')).default
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    const completion = await openai.chat.completions.create({
      model: options?.model || 'gpt-3.5-turbo',
      messages: messages as any,
      temperature: options?.temperature || 0.3,
      max_tokens: options?.maxTokens || 500
    })

    return completion.choices[0].message.content || 'No response generated'
  }
}

// Fallback provider for when AI is disabled
class NoOpProvider implements AIProvider {
  name = 'Disabled'
  
  async generateResponse(): Promise<string> {
    return ''
  }
}

// Factory to get the appropriate AI provider
export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || 'oss-gpt'
  
  switch (provider.toLowerCase()) {
    case 'oss-gpt':
    case 'ossgpt':
      return new OSSGPTProvider()
    
    case 'grok':
      return new GrokProvider()
    
    case 'openai':
      return new OpenAIProvider()
    
    case 'none':
    case 'disabled':
      return new NoOpProvider()
    
    default:
      // Default to OSS-GPT
      return new OSSGPTProvider()
  }
}

// Helper function for risk management context
export function createRiskManagementPrompt(context: string, query: string): AIMessage[] {
  return [
    {
      role: 'system',
      content: `You are a risk management expert assistant. Based on the provided documents, answer the user's question comprehensively. Focus on:
1. Key risks and compliance requirements
2. Specific recommendations based on the documents
3. Any critical alerts or immediate actions needed
Always cite the specific documents you're referencing.`
    },
    {
      role: 'user',
      content: `Context Documents:\n${context}\n\nUser Question: ${query}\n\nProvide a comprehensive answer based on these documents.`
    }
  ]
}

export type { AIProvider, AIMessage, AIOptions }