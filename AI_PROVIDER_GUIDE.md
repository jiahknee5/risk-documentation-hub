# AI Provider Configuration Guide

## Overview

The Risk Documentation Hub now supports multiple AI providers for enhanced search capabilities:

- **OSS-GPT** (Self-hosted) - Default option
- **Grok** (X.AI) - Elon Musk's AI
- **OpenAI** - GPT-3.5/GPT-4
- **Disabled** - Run without AI enhancement

## Quick Setup

### Option 1: OSS-GPT (Recommended for Self-Hosting)

```bash
# Run the setup script
./setup-oss-gpt.sh

# Or manually configure:
AI_PROVIDER="oss-gpt"
OSS_GPT_BASE_URL="http://localhost:8080"  # Your OSS-GPT server
OSS_GPT_API_KEY=""  # Optional if your server requires auth
```

**OSS-GPT Server Setup:**
```bash
# Example using LocalAI (OSS-GPT compatible)
docker run -p 8080:8080 -v $PWD/models:/models localai/localai:latest

# Or using Ollama with OpenAI compatibility layer
ollama serve
# Then use OSS_GPT_BASE_URL="http://localhost:11434/v1"
```

### Option 2: Grok

```bash
# Run the setup script
./setup-grok.sh

# Or manually configure:
AI_PROVIDER="grok"
GROK_API_KEY="xai-your-api-key"  # Get from https://x.ai/api
GROK_BASE_URL="https://api.x.ai/v1"
```

### Option 3: OpenAI

```bash
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-your-api-key"  # Get from https://platform.openai.com
```

### Option 4: Disable AI

```bash
AI_PROVIDER="disabled"
# No API keys needed - search will work without AI enhancement
```

## Vercel Deployment

After local configuration, add the same variables to Vercel:

```bash
# For OSS-GPT
vercel env add AI_PROVIDER production
> oss-gpt

vercel env add OSS_GPT_BASE_URL production  
> https://your-oss-gpt-server.com

vercel env add OSS_GPT_API_KEY production
> your-api-key (if needed)

# Deploy
vercel --prod
```

## Provider Comparison

| Provider | Cost | Privacy | Speed | Quality | Setup |
|----------|------|---------|-------|---------|--------|
| OSS-GPT | Free* | High | Fast | Good | Medium |
| Grok | Paid | Medium | Fast | Excellent | Easy |
| OpenAI | Paid | Low | Medium | Excellent | Easy |
| Disabled | Free | High | Instant | N/A | None |

*Free if self-hosted, may have infrastructure costs

## Implementation Details

### How It Works

The AI provider abstraction layer (`/lib/ai-providers.ts`) provides a unified interface:

```typescript
interface AIProvider {
  name: string
  generateResponse(messages: AIMessage[], options?: AIOptions): Promise<string>
}
```

Each provider implements this interface, allowing seamless switching between providers without code changes.

### OSS-GPT Integration

OSS-GPT uses the OpenAI-compatible API format, making it work with:
- LocalAI
- Ollama (with API compatibility)
- FastChat
- Text Generation WebUI
- Any OpenAI-compatible endpoint

### Request Flow

1. User performs search with AI enabled
2. System retrieves relevant documents using Fuse.js
3. Top 5 results are sent to the AI provider
4. AI generates contextual analysis
5. Response is displayed alongside search results

### Custom Endpoints

You can use any OpenAI-compatible endpoint:

```bash
# Example: Using a custom endpoint
AI_PROVIDER="oss-gpt"
OSS_GPT_BASE_URL="https://my-custom-llm.com/v1"
OSS_GPT_API_KEY="my-api-key"
```

## Troubleshooting

### OSS-GPT Connection Issues

```bash
# Test your OSS-GPT endpoint
curl http://localhost:8080/v1/models

# Check if the chat completions endpoint works
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "model": "default"
  }'
```

### Grok Authentication Errors

- Ensure your API key starts with `xai-`
- Check API key permissions at https://x.ai/api
- Verify you have credits available

### Fallback Behavior

If AI generation fails:
- Search still returns results
- No AI analysis section is shown
- Error is logged but doesn't break search

## Security Considerations

1. **API Keys**: Never commit API keys to git
2. **Self-Hosted**: Use HTTPS for production OSS-GPT endpoints
3. **Rate Limiting**: Implement rate limiting for public deployments
4. **Costs**: Monitor API usage to avoid unexpected charges

## Advanced Configuration

### Using Multiple Models

```typescript
// In ai-providers.ts, you can specify different models:
aiProvider.generateResponse(messages, {
  model: 'grok-2',  // For Grok
  model: 'llama2',  // For OSS-GPT
  model: 'gpt-4',   // For OpenAI
})
```

### Proxy Configuration

For corporate environments:

```bash
# OSS-GPT through proxy
https_proxy=http://proxy.company.com:8080
OSS_GPT_BASE_URL="http://internal-llm:8080"
```

### Performance Tuning

```bash
# Adjust token limits for faster responses
# In ai-providers.ts, modify:
maxTokens: 300  # Reduce for faster responses
temperature: 0.1  # Lower for more deterministic output
```

## Migration Guide

### From OpenAI to OSS-GPT

1. Set up your OSS-GPT server
2. Run `./setup-oss-gpt.sh`
3. Update Vercel environment variables
4. Redeploy

### From OpenAI to Grok

1. Get Grok API key from https://x.ai/api
2. Run `./setup-grok.sh`
3. Update Vercel environment variables
4. Redeploy

No code changes required - the system automatically uses the configured provider!

## Support

- **OSS-GPT Issues**: Check your server logs
- **Grok Issues**: Contact support@x.ai
- **General Issues**: Check browser console and Vercel logs

The AI provider system is designed to be flexible and extensible. You can easily add new providers by implementing the AIProvider interface.