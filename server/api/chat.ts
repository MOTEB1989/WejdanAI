import Anthropic from '@anthropic-ai/sdk'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      throw createError({
        statusCode: 400,
        message: 'Messages array is required',
      })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw createError({
        statusCode: 500,
        message: 'ANTHROPIC_API_KEY is not configured',
      })
    }

    const anthropic = new Anthropic({
      apiKey,
    })

    // إنشاء استجابة stream
    const stream = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages,
      stream: true,
    })

    // إعداد SSE (Server-Sent Events) للاستجابة
    setResponseHeaders(event, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const messageStreamEvent of stream) {
            if (messageStreamEvent.type === 'content_block_delta') {
              const delta = messageStreamEvent.delta
              if (delta.type === 'text_delta') {
                const data = JSON.stringify({ text: delta.text })
                controller.enqueue(encoder.encode(`data: ${data}\n\n`))
              }
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        }
      },
    })

    return sendStream(event, readable)
  } catch (error: any) {
    console.error('Chat API Error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Internal server error',
    })
  }
})
