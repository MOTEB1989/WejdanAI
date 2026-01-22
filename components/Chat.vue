<template>
  <div class="flex flex-col h-full max-h-[80vh] bg-white/30 dark:bg-white/10 backdrop-blur-lg rounded-lg shadow-xl ring-1 ring-gray-900/5">
    <!-- Chat Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
      <div class="flex items-center gap-3">
        <div class="relative">
          <div class="w-3 h-3 bg-green-500 rounded-full border-2 border-white absolute -right-1 -top-1"></div>
          <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Chat Room</h2>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ connectionStatus === 'connected' ? `${onlineUsers} users online` : 'Connecting...' }}
          </p>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <div
          :class="[
            'w-2 h-2 rounded-full',
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
            'bg-red-500'
          ]"
        ></div>
        <span class="text-xs text-gray-500 dark:text-gray-400 capitalize">{{ connectionStatus }}</span>
      </div>
    </div>

    <!-- Messages Container -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-2"
      @scroll="handleScroll"
    >
      <div v-if="loading" class="flex justify-center items-center h-full">
        <div class="text-center">
          <svg class="animate-spin h-8 w-8 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading messages...</p>
        </div>
      </div>

      <div v-else-if="messages.length === 0" class="flex justify-center items-center h-full">
        <div class="text-center">
          <svg class="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <p class="mt-4 text-gray-500 dark:text-gray-400">No messages yet</p>
          <p class="text-sm text-gray-400 dark:text-gray-500">Be the first to send a message!</p>
        </div>
      </div>

      <div v-else>
        <ChatMessage
          v-for="message in messages"
          :key="message.id"
          :message="message"
          :current-user-id="currentUser.id"
        />
      </div>

      <!-- Scroll to bottom button -->
      <div
        v-if="showScrollButton"
        class="fixed bottom-24 right-8"
      >
        <button
          @click="scrollToBottom(true)"
          class="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Chat Input -->
    <ChatInput
      :disabled="connectionStatus !== 'connected'"
      :typing-users="typingUsers"
      @send="handleSendMessage"
      @typing="handleTyping"
    />
  </div>
</template>

<script setup lang="ts">
interface Message {
  id: number
  user_id?: number
  message: string
  timestamp: string
  sender_name: string
  sender_image?: string
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

// State
const messages = ref<Message[]>([])
const loading = ref(true)
const connectionStatus = ref<'connected' | 'connecting' | 'disconnected'>('connecting')
const messagesContainer = ref<HTMLElement | null>(null)
const showScrollButton = ref(false)
const typingUsers = ref<string[]>([])
const onlineUsers = ref(1)

let ws: WebSocket | null = null
let typingTimeout: NodeJS.Timeout | null = null

// Lifecycle
onMounted(async () => {
  await loadMessages()
  connectWebSocket()
  scrollToBottom()
})

onUnmounted(() => {
  if (ws) {
    ws.close()
  }
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
})

// Methods
const loadMessages = async () => {
  try {
    loading.value = true
    const response = await $fetch('/api/chat/messages', {
      query: { limit: 100 }
    })
    messages.value = response.messages || []
  } catch (error) {
    console.error('Error loading messages:', error)
  } finally {
    loading.value = false
  }
}

const connectWebSocket = () => {
  try {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/api/chat/ws`
    
    ws = new WebSocket(wsUrl)
    
    ws.onopen = () => {
      console.log('WebSocket connected')
      connectionStatus.value = 'connected'
    }
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'message') {
          // Add new message if it doesn't exist
          if (!messages.value.find(m => m.id === data.message.id)) {
            messages.value.push(data.message)
            nextTick(() => scrollToBottom())
          }
        } else if (data.type === 'typing') {
          handleRemoteTyping(data.sender_name)
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
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
      setTimeout(() => {
        if (connectionStatus.value === 'disconnected') {
          connectionStatus.value = 'connecting'
          connectWebSocket()
        }
      }, 3000)
    }
  } catch (error) {
    console.error('Error connecting WebSocket:', error)
    connectionStatus.value = 'disconnected'
  }
}

const handleSendMessage = async (messageText: string) => {
  try {
    // Save to database
    const response = await $fetch('/api/chat/messages', {
      method: 'POST',
      body: {
        message: messageText,
        sender_name: props.currentUser.name,
        sender_image: props.currentUser.image,
        user_id: props.currentUser.id
      }
    })
    
    // Broadcast via WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'message',
        message: response.message
      }))
    }
    
    // Add to local messages if not already there
    if (!messages.value.find(m => m.id === response.message.id)) {
      messages.value.push(response.message)
      nextTick(() => scrollToBottom(true))
    }
  } catch (error) {
    console.error('Error sending message:', error)
  }
}

const handleTyping = () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'typing',
      sender_name: props.currentUser.name
    }))
  }
}

const handleRemoteTyping = (senderName: string) => {
  if (senderName === props.currentUser.name) return
  
  if (!typingUsers.value.includes(senderName)) {
    typingUsers.value.push(senderName)
  }
  
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
  
  typingTimeout = setTimeout(() => {
    typingUsers.value = typingUsers.value.filter(name => name !== senderName)
  }, 3000)
}

const scrollToBottom = (smooth = false) => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      })
    }
  })
}

const handleScroll = () => {
  if (!messagesContainer.value) return
  
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight
  
  showScrollButton.value = distanceFromBottom > 200
}
</script>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.5);
}
</style>
