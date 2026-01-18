/**
 * AI Orchestrator for WejdanAI
 * Intelligent routing and fallback between multiple AI providers
 */

interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface AIResponse {
  content: string
  model: string
  tokens: number
  provider: string
}

interface AIProvider {
  name: string
  endpoint: string
  apiKey: string
  models: string[]
  priority: number
}

// AI Providers Configuration
const providers: AIProvider[] = [
  {
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: process.env.OPENAI_API_KEY || '',
    models: ['gpt-4', 'gpt-3.5-turbo'],
    priority: 1
  },
  {
    name: 'DeepSeek',
    endpoint: 'https://api.deepseek.com/v1/chat/completions',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    models: ['deepseek-chat', 'deepseek-coder'],
    priority: 2
  },
  {
    name: 'Google Gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    apiKey: process.env.GEMINI_API_KEY || '',
    models: ['gemini-pro'],
    priority: 3
  }
]

/**
 * Get the best available provider for a model
 */
function getProviderForModel(model: string): AIProvider | null {
  const available = providers
    .filter(p => p.apiKey && p.models.includes(model))
    .sort((a, b) => a.priority - b.priority)

  return available[0] || null
}

/**
 * Send a chat request to AI provider
 */
export async function sendToAI(
  messages: AIMessage[],
  model: string = 'gpt-4',
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<AIResponse> {
  const provider = getProviderForModel(model)

  if (!provider) {
    throw new Error(`No provider available for model: ${model}`)
  }

  const { temperature = 0.7, maxTokens = 2000 } = options

  try {
    let requestBody: any
    let headers: any = {
      'Content-Type': 'application/json'
    }

    // Format request based on provider
    if (provider.name === 'Google Gemini') {
      // Gemini format
      headers['x-goog-api-key'] = provider.apiKey
      requestBody = {
        contents: messages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        })),
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens
        }
      }
    } else {
      // OpenAI/DeepSeek compatible format
      headers['Authorization'] = `Bearer ${provider.apiKey}`
      requestBody = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens
      }
    }

    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API Error: ${response.status} - ${error}`)
    }

    const data = await response.json()

    // Parse response based on provider
    let content: string
    let tokens: number = 0

    if (provider.name === 'Google Gemini') {
      content = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      tokens = data.usageMetadata?.totalTokenCount || 0
    } else {
      content = data.choices?.[0]?.message?.content || ''
      tokens = data.usage?.total_tokens || 0
    }

    return {
      content,
      model,
      tokens,
      provider: provider.name
    }
  } catch (error: any) {
    console.error(`Error with ${provider.name}:`, error.message)
    throw error
  }
}

/**
 * Stream a chat request to AI provider
 */
export async function streamFromAI(
  messages: AIMessage[],
  model: string = 'gpt-4',
  onChunk: (chunk: string) => void,
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<void> {
  const provider = getProviderForModel(model)

  if (!provider) {
    throw new Error(`No provider available for model: ${model}`)
  }

  const { temperature = 0.7, maxTokens = 2000 } = options

  try {
    const headers: any = {
      'Content-Type': 'application/json'
    }

    let requestBody: any

    if (provider.name === 'Google Gemini') {
      // Gemini doesn't support streaming in the same way
      // Fallback to non-streaming
      const response = await sendToAI(messages, model, options)
      onChunk(response.content)
      return
    } else {
      headers['Authorization'] = `Bearer ${provider.apiKey}`
      requestBody = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true
      }
    }

    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('No reader available')
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)

          if (data === '[DONE]') {
            return
          }

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices?.[0]?.delta?.content

            if (content) {
              onChunk(content)
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error: any) {
    console.error(`Error streaming from ${provider.name}:`, error.message)
    throw error
  }
}

/**
 * Simple chat completion (convenience function)
 */
export async function chatCompletion(
  prompt: string,
  model: string = 'gpt-4',
  systemPrompt?: string
): Promise<string> {
  const messages: AIMessage[] = []

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }

  messages.push({ role: 'user', content: prompt })

  const response = await sendToAI(messages, model)
  return response.content
}
