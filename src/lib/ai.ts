import OpenAI from 'openai'

// Only initialize OpenAI if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

export interface DocumentSummary {
  summary: string
  keyPoints: string[]
  riskAssessment: {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    factors: string[]
  }
  complianceInsights: string[]
}

export async function generateDocumentSummary(content: string): Promise<DocumentSummary> {
  // If OpenAI is not configured, return fallback immediately
  if (!openai) {
    return {
      summary: 'AI analysis not available - OpenAI API key not configured.',
      keyPoints: ['Document uploaded successfully', 'Manual review required'],
      riskAssessment: {
        level: 'MEDIUM',
        factors: ['Automated assessment unavailable']
      },
      complianceInsights: ['Manual compliance review recommended']
    }
  }

  try {
    const prompt = `
    Analyze the following document content and provide:
    1. A concise summary (2-3 sentences)
    2. Key points (3-5 bullet points)
    3. Risk assessment level and factors
    4. Compliance insights

    Document content:
    ${content.substring(0, 4000)} // Limit content to avoid token limits

    Respond in JSON format with the following structure:
    {
      "summary": "string",
      "keyPoints": ["string"],
      "riskAssessment": {
        "level": "LOW|MEDIUM|HIGH|CRITICAL",
        "factors": ["string"]
      },
      "complianceInsights": ["string"]
    }
    `

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a risk management and compliance expert. Analyze documents for risk factors, compliance requirements, and key insights.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })

    const result = response.choices[0]?.message?.content
    if (!result) {
      throw new Error('No response from OpenAI')
    }

    return JSON.parse(result)
  } catch (error) {
    console.error('Error generating document summary:', error)
    
    // Fallback summary
    return {
      summary: 'Document analysis could not be completed automatically.',
      keyPoints: ['Manual review required'],
      riskAssessment: {
        level: 'MEDIUM',
        factors: ['Unable to assess automatically']
      },
      complianceInsights: ['Manual compliance review recommended']
    }
  }
}

export async function detectDocumentChanges(oldContent: string, newContent: string): Promise<string[]> {
  // If OpenAI is not configured, return fallback immediately
  if (!openai) {
    return ['AI comparison not available - manual review required']
  }

  try {
    const prompt = `
    Compare these two versions of a document and identify the key changes:

    Old Version:
    ${oldContent.substring(0, 2000)}

    New Version:
    ${newContent.substring(0, 2000)}

    Provide a list of significant changes in JSON array format:
    ["change description 1", "change description 2", ...]
    `

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a document comparison expert. Identify and summarize key differences between document versions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 500
    })

    const result = response.choices[0]?.message?.content
    if (!result) {
      return ['Changes detected but could not be analyzed']
    }

    return JSON.parse(result)
  } catch (error) {
    console.error('Error detecting document changes:', error)
    return ['Document comparison failed - manual review required']
  }
}

export async function generateComplianceReport(documents: any[]): Promise<{
  summary: string
  gaps: string[]
  recommendations: string[]
}> {
  // If OpenAI is not configured, return fallback immediately
  if (!openai) {
    return {
      summary: 'AI compliance analysis not available - OpenAI API key not configured.',
      gaps: ['Automated gap analysis unavailable'],
      recommendations: ['Configure OpenAI API for automated compliance analysis']
    }
  }

  try {
    const documentSummaries = documents.map(doc => ({
      title: doc.title,
      category: doc.category,
      riskLevel: doc.riskLevel,
      complianceStatus: doc.complianceStatus
    }))

    const prompt = `
    Analyze this document portfolio for compliance gaps and provide recommendations:
    
    Documents: ${JSON.stringify(documentSummaries)}

    Provide a compliance analysis in JSON format:
    {
      "summary": "Overall compliance status summary",
      "gaps": ["identified gap 1", "gap 2", ...],
      "recommendations": ["recommendation 1", "recommendation 2", ...]
    }
    `

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a compliance expert specializing in risk management documentation and regulatory requirements.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 800
    })

    const result = response.choices[0]?.message?.content
    if (!result) {
      throw new Error('No response from OpenAI')
    }

    return JSON.parse(result)
  } catch (error) {
    console.error('Error generating compliance report:', error)
    return {
      summary: 'Compliance analysis could not be completed automatically.',
      gaps: ['Manual compliance review required'],
      recommendations: ['Conduct comprehensive manual audit']
    }
  }
}