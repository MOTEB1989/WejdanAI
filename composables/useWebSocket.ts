import { ref, onUnmounted } from 'vue'

interface WebSocketMessage {
  type: string
  data: any
  timestamp?: number
}

export const useWebSocket = (url: string) => {
  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const messages = ref<WebSocketMessage[]>([])
  const error = ref<string | null>(null)

  const connect = () => {
    try {
      ws.value = new WebSocket(url)

      ws.value.onopen = () => {
        isConnected.value = true
        error.value = null
        console.log('WebSocket connected')
      }

      ws.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          messages.value.push(data)
        } catch (e) {
          console.error('Failed to parse message:', e)
        }
      }

      ws.value.onerror = (event) => {
        console.error('WebSocket error:', event)
        error.value = 'WebSocket connection error'
      }

      ws.value.onclose = () => {
        isConnected.value = false
        console.log('WebSocket disconnected')
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (ws.value?.readyState === WebSocket.CLOSED) {
            connect()
          }
        }, 3000)
      }
    } catch (e) {
      console.error('Failed to create WebSocket:', e)
      error.value = 'Failed to create WebSocket connection'
    }
  }

  const send = (data: WebSocketMessage) => {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(data))
    } else {
      console.error('WebSocket is not connected')
    }
  }

  const disconnect = () => {
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    connect,
    send,
    disconnect,
    isConnected,
    messages,
    error,
  }
}
