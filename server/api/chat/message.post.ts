/**
 * POST /api/chat/message
 * Send a message and get AI response (non-streaming)
 */

import { sendToAI } from '~/server/utils/ai-orchestrator'
import type { Message, ChatSettings } from '~/types/chat'

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

    // Prepare messages for AI
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

    // Send to AI orchestrator
    const startTime = Date.now()

    const response = await sendToAI(
      messages,
      settings?.model || 'gpt-4',
      {
        temperature: settings?.temperature || 0.7,
        maxTokens: settings?.maxTokens || 2000
      }
    )

    const responseTime = Date.now() - startTime

    // Create message object
    const message: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      metadata: {
        model: response.model,
        tokens: response.tokens,
        responseTime
      }
    }

    // Return response
    return {
      success: true,
      message,
      metadata: {
        provider: response.provider,
        model: response.model,
        tokens: response.tokens,
        responseTime
      }
    }
  } catch (error: any) {
    console.error('Error in chat message:', error)

    return {
      success: false,
      error: error.message || 'Internal server error'
    }
  }
})
