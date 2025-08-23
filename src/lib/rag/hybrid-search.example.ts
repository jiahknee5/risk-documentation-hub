// Example implementation of Hybrid RAG for Risk Documentation Hub
// This shows how to upgrade from basic keyword search to semantic + keyword hybrid search

import { QdrantClient } from '@qdrant/js-client-rest'
import OpenAI from 'openai'
import { prisma } from '@/lib/db'

// Initialize clients
const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || 'http://localhost:6333',
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Configuration
const COLLECTION_NAME = 'risk_documents'
const EMBEDDING_MODEL = 'text-embedding-3-small'
const CHUNK_SIZE = 512
const CHUNK_OVERLAP = 50

// 1. Document Processing Pipeline
export class DocumentProcessor {
  /**
   * Process a document for hybrid search
   * This runs when a document is uploaded
   */
  async processDocument(documentId: string, filePath: string) {
    try {
      // Extract text from document (PDF, DOCX, etc.)
      const text = await this.extractText(filePath)
      
      // Chunk the document intelligently
      const chunks = await this.chunkText(text)
      
      // Generate embeddings for each chunk
      const embeddings = await this.generateEmbeddings(chunks)
      
      // Store in vector database
      await this.storeInVectorDB(documentId, chunks, embeddings)
      
      // Update document record with processing status
      await prisma.document.update({
        where: { id: documentId },
        data: { 
          content: text.substring(0, 1000), // Store preview
          isProcessed: true 
        }
      })
      
      return { success: true, chunksCreated: chunks.length }
    } catch (error) {
      console.error('Document processing failed:', error)
      throw error
    }
  }
  
  private async extractText(filePath: string): Promise<string> {
    // Use pdf-parse, mammoth, or similar libraries
    // This is a placeholder - implement based on file type
    return 'Extracted document content...'
  }
  
  private async chunkText(text: string): Promise<string[]> {
    const chunks: string[] = []
    const sentences = text.split(/[.!?]+/)
    
    let currentChunk = ''
    let currentLength = 0
    
    for (const sentence of sentences) {
      const sentenceLength = sentence.split(' ').length
      
      if (currentLength + sentenceLength > CHUNK_SIZE) {
        chunks.push(currentChunk.trim())
        // Add overlap by including last few sentences
        const overlap = currentChunk.split(/[.!?]+/).slice(-2).join('. ')
        currentChunk = overlap + ' ' + sentence
        currentLength = overlap.split(' ').length + sentenceLength
      } else {
        currentChunk += ' ' + sentence
        currentLength += sentenceLength
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim())
    }
    
    return chunks
  }
  
  private async generateEmbeddings(chunks: string[]): Promise<number[][]> {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: chunks
    })
    
    return response.data.map(item => item.embedding)
  }
  
  private async storeInVectorDB(
    documentId: string, 
    chunks: string[], 
    embeddings: number[][]
  ) {
    const points = chunks.map((chunk, index) => ({
      id: `${documentId}_chunk_${index}`,
      vector: embeddings[index],
      payload: {
        documentId,
        chunkIndex: index,
        text: chunk,
        createdAt: new Date().toISOString()
      }
    }))
    
    await qdrant.upsert(COLLECTION_NAME, {
      wait: true,
      points
    })
  }
}

// 2. Hybrid Search Implementation
export class HybridSearcher {
  /**
   * Perform hybrid search combining semantic and keyword search
   */
  async search(
    query: string,
    filters?: {
      category?: string
      riskLevel?: string
      dateFrom?: Date
      dateTo?: Date
    }
  ) {
    // Run searches in parallel
    const [semanticResults, keywordResults] = await Promise.all([
      this.semanticSearch(query, filters),
      this.keywordSearch(query, filters)
    ])
    
    // Combine results using Reciprocal Rank Fusion
    const fusedResults = this.fuseResults(semanticResults, keywordResults)
    
    // Fetch full document details
    const documents = await this.fetchDocumentDetails(fusedResults)
    
    // Generate contextual snippets
    const enhancedResults = await this.enhanceWithSnippets(query, documents)
    
    return enhancedResults
  }
  
  private async semanticSearch(query: string, filters?: any) {
    // Generate query embedding
    const queryEmbedding = await this.generateQueryEmbedding(query)
    
    // Build Qdrant filter
    const qdrantFilter = this.buildQdrantFilter(filters)
    
    // Search in vector database
    const searchResult = await qdrant.search(COLLECTION_NAME, {
      vector: queryEmbedding,
      limit: 50,
      filter: qdrantFilter,
      with_payload: true
    })
    
    // Group by document and aggregate scores
    const documentScores = new Map<string, number>()
    const documentChunks = new Map<string, string[]>()
    
    searchResult.forEach(result => {
      const docId = result.payload?.documentId as string
      const currentScore = documentScores.get(docId) || 0
      documentScores.set(docId, Math.max(currentScore, result.score || 0))
      
      const chunks = documentChunks.get(docId) || []
      chunks.push(result.payload?.text as string)
      documentChunks.set(docId, chunks)
    })
    
    return Array.from(documentScores.entries())
      .map(([docId, score]) => ({
        documentId: docId,
        score,
        type: 'semantic',
        chunks: documentChunks.get(docId) || []
      }))
      .sort((a, b) => b.score - a.score)
  }
  
  private async keywordSearch(query: string, filters?: any) {
    const documents = await prisma.document.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { contains: query, mode: 'insensitive' } }
        ],
        ...(filters?.category && { category: filters.category }),
        ...(filters?.riskLevel && { riskLevel: filters.riskLevel })
      },
      take: 50
    })
    
    return documents.map((doc, index) => ({
      documentId: doc.id,
      score: 1 / (index + 1), // Simple ranking by position
      type: 'keyword',
      document: doc
    }))
  }
  
  private fuseResults(
    semanticResults: any[],
    keywordResults: any[]
  ) {
    const k = 60 // RRF constant
    const fusedScores = new Map<string, number>()
    
    // Weight semantic search higher
    const semanticWeight = 0.7
    const keywordWeight = 0.3
    
    // Add semantic results
    semanticResults.forEach((result, rank) => {
      const score = semanticWeight / (k + rank + 1)
      fusedScores.set(result.documentId, score)
    })
    
    // Add keyword results
    keywordResults.forEach((result, rank) => {
      const currentScore = fusedScores.get(result.documentId) || 0
      const score = keywordWeight / (k + rank + 1)
      fusedScores.set(result.documentId, currentScore + score)
    })
    
    // Sort by fused score
    return Array.from(fusedScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([docId, score]) => ({
        documentId: docId,
        fusedScore: score,
        semanticData: semanticResults.find(r => r.documentId === docId),
        keywordData: keywordResults.find(r => r.documentId === docId)
      }))
  }
  
  private async generateQueryEmbedding(query: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: query
    })
    
    return response.data[0].embedding
  }
  
  private buildQdrantFilter(filters?: any) {
    if (!filters) return undefined
    
    const conditions = []
    
    if (filters.category) {
      conditions.push({
        key: 'category',
        match: { value: filters.category }
      })
    }
    
    if (filters.dateFrom || filters.dateTo) {
      conditions.push({
        key: 'createdAt',
        range: {
          gte: filters.dateFrom?.toISOString(),
          lte: filters.dateTo?.toISOString()
        }
      })
    }
    
    return conditions.length > 0 ? { must: conditions } : undefined
  }
  
  private async fetchDocumentDetails(fusedResults: any[]) {
    const documentIds = fusedResults.map(r => r.documentId)
    
    const documents = await prisma.document.findMany({
      where: {
        id: { in: documentIds }
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    })
    
    return fusedResults.map(result => ({
      ...result,
      document: documents.find(d => d.id === result.documentId)
    }))
  }
  
  private async enhanceWithSnippets(query: string, results: any[]) {
    return results.map(result => {
      // Use semantic chunks if available
      if (result.semanticData?.chunks?.length > 0) {
        const relevantChunk = result.semanticData.chunks[0]
        const snippet = this.highlightQuery(relevantChunk, query)
        
        return {
          ...result,
          snippet,
          matchType: 'semantic'
        }
      }
      
      // Fall back to description
      if (result.document?.description) {
        const snippet = this.highlightQuery(result.document.description, query)
        
        return {
          ...result,
          snippet,
          matchType: 'keyword'
        }
      }
      
      return result
    })
  }
  
  private highlightQuery(text: string, query: string): string {
    const words = query.split(/\s+/)
    let highlighted = text
    
    words.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi')
      highlighted = highlighted.replace(regex, '<mark>$1</mark>')
    })
    
    // Extract snippet around first match
    const firstMatch = highlighted.indexOf('<mark>')
    if (firstMatch > -1) {
      const start = Math.max(0, firstMatch - 100)
      const end = Math.min(highlighted.length, firstMatch + 200)
      return '...' + highlighted.substring(start, end) + '...'
    }
    
    return highlighted.substring(0, 200) + '...'
  }
}

// 3. Query-Answering RAG
export class QuestionAnsweringRAG {
  private searcher: HybridSearcher
  
  constructor() {
    this.searcher = new HybridSearcher()
  }
  
  /**
   * Answer a question using retrieved documents
   */
  async answerQuestion(question: string) {
    // Retrieve relevant documents
    const searchResults = await this.searcher.search(question)
    
    // Build context from top results
    const context = this.buildContext(searchResults.slice(0, 5))
    
    // Generate answer
    const answer = await this.generateAnswer(question, context)
    
    return {
      answer,
      sources: searchResults.slice(0, 5).map(r => ({
        id: r.document.id,
        title: r.document.title,
        relevance: r.fusedScore
      }))
    }
  }
  
  private buildContext(results: any[]): string {
    return results
      .map((result, index) => {
        const doc = result.document
        const chunk = result.semanticData?.chunks?.[0] || doc.description
        
        return `[${index + 1}] "${doc.title}"
Category: ${doc.category}
Risk Level: ${doc.riskLevel}
Content: ${chunk}
---`
      })
      .join('\n\n')
  }
  
  private async generateAnswer(question: string, context: string) {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a risk management expert assistant. Answer questions based on the provided documents.
          
Rules:
1. Only use information from the provided documents
2. Cite sources using [1], [2], etc.
3. If the answer isn't in the documents, say so
4. Be concise but thorough
5. Highlight any risk factors or compliance concerns`
        },
        {
          role: 'user',
          content: `Context Documents:
${context}

Question: ${question}

Please provide a comprehensive answer based on the documents above.`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })
    
    return response.choices[0].message.content
  }
}

// 4. Usage Example
export async function demonstrateHybridRAG() {
  // Process a new document
  const processor = new DocumentProcessor()
  await processor.processDocument('doc-123', '/path/to/document.pdf')
  
  // Search with hybrid approach
  const searcher = new HybridSearcher()
  const results = await searcher.search('cybersecurity incident response', {
    category: 'CYBERSECURITY',
    riskLevel: 'HIGH'
  })
  
  console.log('Search Results:', results)
  
  // Answer a question
  const qa = new QuestionAnsweringRAG()
  const answer = await qa.answerQuestion(
    'What are the key steps in our incident response plan?'
  )
  
  console.log('Answer:', answer.answer)
  console.log('Sources:', answer.sources)
}