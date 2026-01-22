// Chat-related TypeScript type definitions

export interface User {
  id: number
  name: string
  email: string
  image: string
  createdAt: string
}

export interface Message {
  id: number
  user_id: number
  content: string
  timestamp: string
  message_type: 'text' | 'system'
  edited_at?: string | null
  deleted_at?: string | null
  user?: User
}

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'presence' | 'connection' | 'error'
  payload?: any
  userId?: number
  userName?: string
  timestamp?: string
}

export interface TypingIndicator {
  userId: number
  userName: string
  isTyping: boolean
}

export interface UserPresence {
  userId: number
  userName: string
  status: 'online' | 'offline'
  lastSeen?: string
}

export interface ChatState {
  messages: Message[]
  typingUsers: TypingIndicator[]
  onlineUsers: UserPresence[]
  isConnected: boolean
  connectionError?: string
}
