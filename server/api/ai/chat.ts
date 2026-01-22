import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export default defineEventHandler(async (event) => {
  const { messages } = await readBody(event)

  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    throw createError({
      statusCode: 500,
      statusMessage: 'OPENAI_API_KEY is not configured',
    })
  }

  const result = await streamText({
    model: openai('gpt-4o'),
    messages,
  })

  return result.toAIStreamResponse()
})
