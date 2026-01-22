// Chat-related TypeScript types

export interface User {
  id: number
  name: string
  email: string
  image?: string
  createdAt?: Date
}

export interface Message {
  id: number
  userId: number
  user?: User
  content: string
  createdAt: Date
  messageType: 'text' | 'system'
  isRead: boolean
}

export interface OnlineUser {
  id: number
  name: string
  image?: string
  lastSeen: Date
}

export interface TypingUser {
  userId: number
  userName: string
}

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'user_joined' | 'user_left' | 'presence_update'
  data: any
  timestamp: Date
}

export interface ChatState {
  messages: Message[]
  onlineUsers: OnlineUser[]
  typingUsers: TypingUser[]
  isConnected: boolean
  currentUserId?: number
}
