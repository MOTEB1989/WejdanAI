/**
 * useChatHistory - Manage chat conversation history
 * Handles local storage and persistence of conversations
 */

import type { Conversation } from '~/types/chat'

const STORAGE_KEY = 'wejdanai_chat_history'
const MAX_CONVERSATIONS = 50

export const useChatHistory = () => {
  /**
   * Get all conversations from local storage
   */
  const getConversations = async (): Promise<Conversation[]> => {
    if (process.client) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const conversations = JSON.parse(stored)
          // Convert timestamp strings back to Date objects
          return conversations.map((conv: any) => ({
            ...conv,
            timestamp: new Date(conv.timestamp),
            messages: conv.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }))
        }
      } catch (error) {
        console.error('Error loading conversations:', error)
      }
    }
    return []
  }

  /**
   * Save a conversation
   */
  const saveConversation = async (conversation: Conversation): Promise<void> => {
    if (process.client) {
      try {
        const conversations = await getConversations()

        // Check if conversation already exists
        const existingIndex = conversations.findIndex(c => c.id === conversation.id)

        if (existingIndex >= 0) {
          // Update existing
          conversations[existingIndex] = conversation
        } else {
          // Add new
          conversations.unshift(conversation)

          // Limit to MAX_CONVERSATIONS
          if (conversations.length > MAX_CONVERSATIONS) {
            conversations.pop()
          }
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
      } catch (error) {
        console.error('Error saving conversation:', error)
      }
    }
  }

  /**
   * Get a specific conversation by ID
   */
  const getConversation = async (id: string): Promise<Conversation | null> => {
    const conversations = await getConversations()
    return conversations.find(c => c.id === id) || null
  }

  /**
   * Delete a conversation
   */
  const deleteConversation = async (id: string): Promise<void> => {
    if (process.client) {
      try {
        const conversations = await getConversations()
        const filtered = conversations.filter(c => c.id !== id)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
      } catch (error) {
        console.error('Error deleting conversation:', error)
      }
    }
  }

  /**
   * Clear all conversations
   */
  const clearAllConversations = async (): Promise<void> => {
    if (process.client) {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (error) {
        console.error('Error clearing conversations:', error)
      }
    }
  }

  /**
   * Export conversations as JSON
   */
  const exportConversations = async (): Promise<string> => {
    const conversations = await getConversations()
    return JSON.stringify(conversations, null, 2)
  }

  /**
   * Import conversations from JSON
   */
  const importConversations = async (jsonData: string): Promise<boolean> => {
    try {
      const imported = JSON.parse(jsonData)

      if (!Array.isArray(imported)) {
        throw new Error('Invalid format')
      }

      // Validate structure
      for (const conv of imported) {
        if (!conv.id || !conv.messages || !Array.isArray(conv.messages)) {
          throw new Error('Invalid conversation structure')
        }
      }

      // Merge with existing
      const existing = await getConversations()
      const merged = [...imported, ...existing]

      // Remove duplicates
      const unique = merged.filter((conv, index, self) =>
        index === self.findIndex(c => c.id === conv.id)
      )

      // Limit to MAX_CONVERSATIONS
      const limited = unique.slice(0, MAX_CONVERSATIONS)

      if (process.client) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(limited))
      }

      return true
    } catch (error) {
      console.error('Error importing conversations:', error)
      return false
    }
  }

  return {
    getConversations,
    saveConversation,
    getConversation,
    deleteConversation,
    clearAllConversations,
    exportConversations,
    importConversations
  }
}
