import { ref, onMounted, onUnmounted } from 'vue'

export interface Message {
  id?: number
  userId: number
  userName: string
  userImage?: string
  content: string
  messageType?: string
  timestamp?: string
  createdAt?: string
}

export const useWebSocket = () => {
  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = 2000
  const messages = ref<Message[]>([])
  const typingUsers = ref<Map<number, string>>(new Map())
  
  const connect = (userId: number, userName: string, userImage?: string) => {
    if (ws.value?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      // Determine WebSocket URL based on current location
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const host = window.location.host
      const wsUrl = `${protocol}//${host}/api/websocket`
      
      ws.value = new WebSocket(wsUrl)

      ws.value.onopen = () => {
        console.log('WebSocket connected')
        isConnected.value = true
        reconnectAttempts.value = 0

        // Identify the user
        send({
          type: 'identify',
          userId,
          userName,
          userImage
        })
      }

      ws.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleMessage(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.value.onclose = () => {
        console.log('WebSocket disconnected')
        isConnected.value = false
        
        // Attempt to reconnect
        if (reconnectAttempts.value < maxReconnectAttempts) {
          reconnectAttempts.value++
          console.log(`Reconnecting... Attempt ${reconnectAttempts.value}`)
          setTimeout(() => {
            connect(userId, userName, userImage)
          }, reconnectDelay * reconnectAttempts.value)
        }
      }

      ws.value.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Error creating WebSocket connection:', error)
    }
  }

  const disconnect = () => {
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
    isConnected.value = false
  }

  const send = (data: any) => {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(data))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  const sendMessage = (message: Message) => {
    send({
      type: 'message',
      ...message,
      timestamp: new Date().toISOString()
    })
  }

  const sendTypingIndicator = (userId: number, userName: string, isTyping: boolean) => {
    send({
      type: 'typing',
      userId,
      userName,
      isTyping
    })
  }

  const handleMessage = (data: any) => {
    switch (data.type) {
      case 'connected':
        console.log('Connected to WebSocket server:', data.clientId)
        break

      case 'message':
        // Add message to local messages array
        messages.value.push({
          id: data.id,
          userId: data.userId,
          userName: data.userName,
          userImage: data.userImage,
          content: data.content,
          messageType: data.messageType || 'text',
          timestamp: data.timestamp
        })
        break

      case 'typing':
        if (data.isTyping) {
          typingUsers.value.set(data.userId, data.userName)
        } else {
          typingUsers.value.delete(data.userId)
        }
        break

      case 'user_joined':
        console.log(`${data.userName} joined the chat`)
        break

      case 'user_left':
        console.log(`${data.userName} left the chat`)
        typingUsers.value.delete(data.userId)
        break

      case 'pong':
        // Heartbeat response
        break

      default:
        console.log('Unknown message type:', data.type)
    }
  }

  // Heartbeat to keep connection alive
  let heartbeatInterval: NodeJS.Timeout | null = null
  
  const startHeartbeat = () => {
    heartbeatInterval = setInterval(() => {
      if (isConnected.value) {
        send({ type: 'ping' })
      }
    }, 25000) // Send ping every 25 seconds
  }

  const stopHeartbeat = () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval)
      heartbeatInterval = null
    }
  }

  onMounted(() => {
    startHeartbeat()
  })

  onUnmounted(() => {
    stopHeartbeat()
    disconnect()
  })

  return {
    ws,
    isConnected,
    messages,
    typingUsers,
    connect,
    disconnect,
    send,
    sendMessage,
    sendTypingIndicator
  }
}
