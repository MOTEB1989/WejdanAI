<template>
  <div
    class="flex flex-col h-full bg-white/30 dark:bg-white/10 backdrop-blur-lg rounded-lg shadow-xl ring-1 ring-gray-900/5"
  >
    <!-- Chat Header -->
    <div
      class="flex items-center justify-between p-4 border-b border-gray-900/5"
    >
      <div>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          Chat
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          <span
            v-if="connectionStatus === 'connected'"
            class="inline-flex items-center"
          >
            <span class="w-2 h-2 mr-2 bg-green-500 rounded-full animate-pulse"></span>
            {{ onlineUsersCount }} user{{ onlineUsersCount !== 1 ? 's' : '' }} online
          </span>
          <span v-else-if="connectionStatus === 'connecting'" class="inline-flex items-center">
            <span class="w-2 h-2 mr-2 bg-yellow-500 rounded-full animate-pulse"></span>
            Connecting...
          </span>
          <span v-else class="inline-flex items-center">
            <span class="w-2 h-2 mr-2 bg-red-500 rounded-full"></span>
            Disconnected
          </span>
        </p>
      </div>
    </div>

    <!-- Messages Area -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-2 scroll-smooth"
      @scroll="handleScroll"
    >
      <!-- Loading indicator -->
      <div v-if="loading" class="flex items-center justify-center py-8">
        <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- Messages -->
      <ChatMessage
        v-for="message in messages"
        :key="message.id"
        :message="message"
        :current-user-id="currentUser.id"
      />

      <!-- Typing indicator -->
      <div
        v-if="someoneTyping"
        class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400"
      >
        <div class="flex space-x-1">
          <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
          <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
          <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
        </div>
        <span>Someone is typing...</span>
      </div>

      <!-- Empty state -->
      <div
        v-if="!loading && messages.length === 0"
        class="flex flex-col items-center justify-center h-full text-center py-12"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-16 h-16 mb-4 text-gray-400"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
          />
        </svg>
        <p class="text-lg font-medium text-gray-600 dark:text-gray-300">
          No messages yet
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Start the conversation!
        </p>
      </div>
    </div>

    <!-- Chat Input -->
    <ChatInput
      :disabled="connectionStatus !== 'connected'"
      @send="handleSendMessage"
      @typing="handleTyping"
    />
  </div>
</template>

<script setup lang="ts">
interface Message {
  id: number
  user_id: number
  user_name: string
  user_image?: string
  content: string
  type: string
  created_at: string
}

interface User {
  id: number
  name: string
  email: string
  image?: string
}

const props = defineProps<{
  currentUser: User
}>()

const messages = ref<Message[]>([])
const loading = ref(true)
const connectionStatus = ref<'connected' | 'connecting' | 'disconnected'>('disconnected')
const onlineUsersCount = ref(1)
const someoneTyping = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

let ws: WebSocket | null = null
let reconnectTimeout: NodeJS.Timeout | null = null
let typingTimeout: NodeJS.Timeout | null = null

// Load initial messages
const loadMessages = async () => {
  try {
    loading.value = true
    const response = await $fetch<{ messages: Message[] }>('/api/messages', {
      query: { limit: 50, offset: 0 },
    })
    messages.value = response.messages || []
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Failed to load messages:', error)
  } finally {
    loading.value = false
  }
}

// WebSocket connection
const connectWebSocket = () => {
  connectionStatus.value = 'connecting'

  // For development, use ws:// and for production use wss://
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${window.location.host}`

  try {
    ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('WebSocket connected')
      connectionStatus.value = 'connected'

      // Send user info
      ws?.send(
        JSON.stringify({
          type: 'user_connected',
          user: props.currentUser,
        })
      )
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'new_message') {
          messages.value.push(data.message)
          nextTick(() => scrollToBottom())
        } else if (data.type === 'users_count') {
          onlineUsersCount.value = data.count
        } else if (data.type === 'user_typing') {
          if (data.userId !== props.currentUser.id) {
            someoneTyping.value = true
            if (typingTimeout) clearTimeout(typingTimeout)
            typingTimeout = setTimeout(() => {
              someoneTyping.value = false
            }, 3000)
          }
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      connectionStatus.value = 'disconnected'
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      connectionStatus.value = 'disconnected'

      // Attempt to reconnect after 3 seconds
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      reconnectTimeout = setTimeout(() => {
        console.log('Attempting to reconnect...')
        connectWebSocket()
      }, 3000)
    }
  } catch (error) {
    console.error('Failed to create WebSocket connection:', error)
    connectionStatus.value = 'disconnected'
  }
}

// Send message
const handleSendMessage = async (content: string) => {
  try {
    // Optimistically add message to UI
    const tempMessage: Message = {
      id: Date.now(), // Temporary ID
      user_id: props.currentUser.id,
      user_name: props.currentUser.name,
      user_image: props.currentUser.image,
      content,
      type: 'text',
      created_at: new Date().toISOString(),
    }
    messages.value.push(tempMessage)
    await nextTick()
    scrollToBottom()

    // Send to server
    const savedMessage = await $fetch<Message>('/api/messages', {
      method: 'POST',
      body: {
        user_id: props.currentUser.id,
        user_name: props.currentUser.name,
        user_image: props.currentUser.image,
        content,
        type: 'text',
      },
    })

    // Replace temp message with saved message
    const index = messages.value.findIndex((m) => m.id === tempMessage.id)
    if (index !== -1) {
      messages.value[index] = savedMessage
    }

    // Broadcast via WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: 'send_message',
          message: savedMessage,
        })
      )
    }
  } catch (error) {
    console.error('Failed to send message:', error)
    // Remove optimistic message on error
    messages.value = messages.value.filter((m) => m.id !== Date.now())
  }
}

// Handle typing indicator
const handleTyping = () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: 'typing',
        userId: props.currentUser.id,
        userName: props.currentUser.name,
      })
    )
  }
}

// Scroll to bottom
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Handle scroll (for future infinite scroll)
const handleScroll = () => {
  // Can be used for loading more messages when scrolling up
}

// Lifecycle
onMounted(() => {
  loadMessages()
  connectWebSocket()
})

onUnmounted(() => {
  if (ws) {
    ws.close()
  }
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
  }
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
})
</script>

<style scoped>
/* Custom scrollbar for messages */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
</style>
