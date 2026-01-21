import { defineEventHandler, readBody, createError } from 'h3'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  message: string
  conversation_history?: ChatMessage[]
  user_id?: number
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<ChatRequest>(event)
    const { message, conversation_history = [], user_id } = body

    if (!message) {
      throw createError({
        statusCode: 400,
        message: 'Message is required'
      })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw createError({
        statusCode: 500,
        message: 'Anthropic API key not configured'
      })
    }

    // Build messages array for Anthropic API
    const messages: ChatMessage[] = [
      ...conversation_history,
      { role: 'user', content: message }
    ]

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: messages
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Anthropic API error:', error)
      throw createError({
        statusCode: response.status,
        message: 'Failed to get AI response'
      })
    }

    const data = await response.json()
    const aiResponse = data.content[0]?.text || ''

    // Save to logs database
    try {
      await $fetch('/api/logs', {
        method: 'POST',
        body: {
          user_id,
          query: message,
          response: aiResponse
        }
      })
    } catch (logError) {
      console.error('Failed to save log:', logError)
      // Don't fail the request if logging fails
    }

    return {
      response: aiResponse,
      model: data.model,
      usage: data.usage
    }
  } catch (error: any) {
    console.error('Chat API error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error'
    })
  }
})
