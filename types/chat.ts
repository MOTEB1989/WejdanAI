/**
 * Chat Types & Interfaces for WejdanAI
 */

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  isError?: boolean
  metadata?: {
    model?: string
    tokens?: number
    responseTime?: number
  }
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  timestamp: Date
  metadata?: {
    model?: string
    totalTokens?: number
    totalCost?: number
  }
}

export interface ChatSettings {
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'gemini-pro' | 'deepseek-chat'
  temperature: number
  maxTokens: number
  systemPrompt?: string
  streaming: boolean
}

export interface StreamChunk {
  content: string
  done: boolean
  metadata?: {
    tokens?: number
    finishReason?: string
  }
}

export interface AIProvider {
  name: string
  models: string[]
  available: boolean
  priority: number
}

export interface ChatResponse {
  success: boolean
  message?: Message
  error?: string
  metadata?: {
    model: string
    tokens: number
    responseTime: number
  }
}
