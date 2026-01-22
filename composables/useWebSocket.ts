import { ref, onMounted, onUnmounted } from 'vue'
import type { Message, WebSocketMessage, TypingIndicator, UserPresence } from '../types/chat'

export const useWebSocket = () => {
  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const messages = ref<Message[]>([])
  const typingUsers = ref<TypingIndicator[]>([])
  const onlineUsers = ref<UserPresence[]>([])
  const connectionError = ref<string>('')
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5
  let reconnectTimeout: NodeJS.Timeout | null = null
  let heartbeatInterval: NodeJS.Timeout | null = null

  const connect = (userId: number, userName: string) => {
    if (typeof window === 'undefined') return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}`

    try {
      ws.value = new WebSocket(wsUrl)

      ws.value.onopen = () => {
        console.log('WebSocket connected')
        isConnected.value = true
        connectionError.value = ''
        reconnectAttempts.value = 0

        // Send presence information
        send({
          type: 'presence',
          userId,
          userName,
          payload: { status: 'online' },
        })

        // Start heartbeat
        startHeartbeat()
      }

      ws.value.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          handleMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      ws.value.onerror = (error) => {
        console.error('WebSocket error:', error)
        connectionError.value = 'WebSocket not available - using HTTP fallback'
      }

      ws.value.onclose = () => {
        console.log('WebSocket disconnected')
        isConnected.value = false
        stopHeartbeat()
        
        // Don't attempt to reconnect if WebSocket is not supported
        if (reconnectAttempts.value === 0) {
          connectionError.value = 'WebSocket not available - using HTTP fallback'
        } else if (reconnectAttempts.value < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.value), 10000)
          reconnectTimeout = setTimeout(() => {
            reconnectAttempts.value++
            console.log(`Reconnecting... Attempt ${reconnectAttempts.value}`)
            connect(userId, userName)
          }, delay)
        } else {
          connectionError.value = 'WebSocket not available - using HTTP fallback'
        }
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      connectionError.value = 'WebSocket not available - using HTTP fallback'
      isConnected.value = false
    }
  }

  const disconnect = () => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }
    stopHeartbeat()
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
    isConnected.value = false
  }

  const send = (message: WebSocketMessage) => {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  const sendMessage = (content: string, userId: number) => {
    send({
      type: 'message',
      payload: { content, userId },
      timestamp: new Date().toISOString(),
    })
  }

  const sendTypingIndicator = (isTyping: boolean, userId: number, userName: string) => {
    send({
      type: 'typing',
      payload: { isTyping, userId, userName },
      timestamp: new Date().toISOString(),
    })
  }

  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'connection':
        console.log('Connection confirmed:', message.payload)
        break

      case 'message':
        // Message will be handled by the parent component
        // which will add it to the messages list after API call
        break

      case 'typing':
        if (message.payload) {
          const { isTyping, userId, userName } = message.payload
          if (isTyping) {
            // Add or update typing indicator
            const existingIndex = typingUsers.value.findIndex(u => u.userId === userId)
            if (existingIndex === -1) {
              typingUsers.value.push({ userId, userName, isTyping: true })
            }
          } else {
            // Remove typing indicator
            typingUsers.value = typingUsers.value.filter(u => u.userId !== userId)
          }
        }
        break

      case 'presence':
        if (message.payload) {
          const { userId, userName, status } = message.payload
          if (status === 'online') {
            // Add user to online list
            const existingIndex = onlineUsers.value.findIndex(u => u.userId === userId)
            if (existingIndex === -1) {
              onlineUsers.value.push({ userId, userName, status: 'online' })
            }
          } else {
            // Remove user from online list or update status
            const userIndex = onlineUsers.value.findIndex(u => u.userId === userId)
            if (userIndex !== -1) {
              onlineUsers.value[userIndex].status = 'offline'
              onlineUsers.value[userIndex].lastSeen = new Date().toISOString()
            }
          }
        }
        break

      case 'error':
        console.error('WebSocket error message:', message.payload)
        connectionError.value = message.payload?.message || 'Unknown error'
        break

      default:
        console.log('Unknown message type:', message.type)
    }
  }

  const startHeartbeat = () => {
    heartbeatInterval = setInterval(() => {
      if (ws.value && ws.value.readyState === WebSocket.OPEN) {
        ws.value.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000) // Send ping every 30 seconds
  }

  const stopHeartbeat = () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval)
      heartbeatInterval = null
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    ws,
    isConnected,
    messages,
    typingUsers,
    onlineUsers,
    connectionError,
    connect,
    disconnect,
    send,
    sendMessage,
    sendTypingIndicator,
  }
}
