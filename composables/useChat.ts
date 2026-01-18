/**
 * useChat - Main chat composable for WejdanAI
 * Handles message sending, streaming, and AI integration
 */

import type { Message, ChatSettings, StreamChunk } from '~/types/chat'

export const useChat = () => {
  const settings = ref<ChatSettings>({
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000,
    streaming: true
  })

  let abortController: AbortController | null = null

  /**
   * Send a chat message and get response
   */
  const sendChatMessage = async (
    prompt: string,
    options?: Partial<ChatSettings>
  ): Promise<Message> => {
    const mergedSettings = { ...settings.value, ...options }

    try {
      const response = await $fetch<{ success: boolean; message: Message; error?: string }>('/api/chat/message', {
        method: 'POST',
        body: {
          prompt,
          settings: mergedSettings
        }
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to get response')
      }

      return response.message
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  /**
   * Stream a chat message with real-time updates
   */
  const streamMessage = async (
    prompt: string,
    onChunk: (chunk: string) => void,
    options?: Partial<ChatSettings>
  ): Promise<void> => {
    const mergedSettings = { ...settings.value, ...options }
    abortController = new AbortController()

    try {
      // Using fetch for streaming (not $fetch)
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          settings: mergedSettings
        }),
        signal: abortController.signal
      })

      if (!response.ok) {
        throw new Error('Stream request failed')
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
              const parsed: StreamChunk = JSON.parse(data)
              if (parsed.content) {
                onChunk(parsed.content)
              }
            } catch (e) {
              // Skip invalid JSON
              console.warn('Failed to parse chunk:', data)
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Stream aborted by user')
      } else {
        console.error('Error streaming message:', error)
        throw error
      }
    } finally {
      abortController = null
    }
  }

  /**
   * Stop current streaming
   */
  const stopStream = () => {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
  }

  /**
   * Update chat settings
   */
  const updateSettings = (newSettings: Partial<ChatSettings>) => {
    settings.value = { ...settings.value, ...newSettings }
  }

  return {
    settings: readonly(settings),
    sendChatMessage,
    streamMessage,
    stopStream,
    updateSettings
  }
}
