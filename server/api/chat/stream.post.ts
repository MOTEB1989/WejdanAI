/**
 * POST /api/chat/stream
 * Stream AI responses in real-time using Server-Sent Events (SSE)
 */

import { streamFromAI } from '~/server/utils/ai-orchestrator'
import type { ChatSettings } from '~/types/chat'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { prompt, settings } = body as {
      prompt: string
      settings: ChatSettings
    }

    if (!prompt || typeof prompt !== 'string') {
      throw createError({
        statusCode: 400,
        message: 'Prompt is required'
      })
    }

    // Set headers for SSE
    setResponseHeaders(event, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    })

    // Prepare messages
    const messages = []

    if (settings?.systemPrompt) {
      messages.push({
        role: 'system' as const,
        content: settings.systemPrompt
      })
    }

    messages.push({
      role: 'user' as const,
      content: prompt
    })

    // Create a stream
    const stream = createEventStream(event)

    // Stream from AI
    try {
      await streamFromAI(
        messages,
        settings?.model || 'gpt-4',
        (chunk: string) => {
          // Send chunk as SSE
          stream.push(`data: ${JSON.stringify({ content: chunk, done: false })}\n\n`)
        },
        {
          temperature: settings?.temperature || 0.7,
          maxTokens: settings?.maxTokens || 2000
        }
      )

      // Send completion signal
      stream.push(`data: [DONE]\n\n`)
    } catch (error: any) {
      // Send error
      stream.push(`data: ${JSON.stringify({ error: error.message, done: true })}\n\n`)
    } finally {
      // Close stream
      await stream.close()
    }
  } catch (error: any) {
    console.error('Error in chat stream:', error)

    throw createError({
      statusCode: 500,
      message: error.message || 'Internal server error'
    })
  }
})
