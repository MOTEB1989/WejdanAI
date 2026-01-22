<template>
  <div class="flex flex-col h-full max-h-[600px] bg-white/30 dark:bg-white/10 rounded-lg shadow-xl ring-1 ring-gray-900/5 backdrop-blur-lg overflow-hidden">
    <!-- Chat Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-900/5 dark:border-white/10">
      <div class="flex items-center space-x-3">
        <div class="w-3 h-3 rounded-full" :class="isConnected ? 'bg-green-500' : 'bg-red-500'"></div>
        <div>
          <h3 class="text-lg font-semibold">Chat Room</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ isConnected ? `${onlineUsers} users online` : 'Disconnected' }}
          </p>
        </div>
      </div>
      <button 
        @click="reconnect" 
        class="px-3 py-1 text-sm font-medium rounded-md hover:bg-white/20 dark:hover:bg-white/5 transition-colors"
        :disabled="isConnected"
      >
        Reconnect
      </button>
    </div>

    <!-- Messages Area -->
    <div 
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      @scroll="handleScroll"
    >
      <div v-if="loading" class="flex items-center justify-center h-full">
        <div class="text-gray-500 dark:text-gray-400">Loading messages...</div>
      </div>
      
      <template v-else>
        <ChatMessage
          v-for="message in messages"
          :key="message.id"
          :message="message"
          :is-own-message="message.clientId === currentClientId"
        />
      </template>
      
      <!-- Typing Indicator -->
      <TypingIndicator v-if="someoneIsTyping" :users="typingUsers" />
    </div>

    <!-- Input Area -->
    <ChatInput 
      @send-message="sendMessage"
      @typing="handleTyping"
      :disabled="!isConnected"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

interface Message {
  id: number
  content: string
  name?: string
  email?: string
  image?: string
  created_at?: string
  timestamp?: string
  clientId?: string
  userName?: string
}

const props = defineProps<{
  currentUser?: {
    id: number
    name: string
    email: string
    image?: string
  }
}>()

const messages = ref<Message[]>([])
const messagesContainer = ref<HTMLElement | null>(null)
const loading = ref(true)
const isConnected = ref(false)
const onlineUsers = ref(0)
const currentClientId = ref<string>('')
const someoneIsTyping = ref(false)
const typingUsers = ref<string[]>([])
const typingTimeout = ref<any>(null)

let ws: WebSocket | null = null

// Fetch initial messages
const fetchMessages = async () => {
  try {
    const response = await $fetch('/api/messages')
    if (response && response.messages) {
      messages.value = response.messages.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        name: msg.name,
        email: msg.email,
        image: msg.image,
        created_at: msg.created_at,
        clientId: null // Server messages don't have clientId
      }))
    }
  } catch (error) {
    console.error('Error fetching messages:', error)
  } finally {
    loading.value = false
  }
}

// Connect to WebSocket
const connectWebSocket = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${window.location.host}/api/websocket`
  
  ws = new WebSocket(wsUrl)
  
  ws.onopen = () => {
    console.log('WebSocket connected')
    isConnected.value = true
  }
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      
      switch (data.type) {
        case 'connection':
          currentClientId.value = data.clientId
          onlineUsers.value = data.onlineUsers
          break
          
        case 'message:broadcast':
          // Add message to the list
          messages.value.push({
            id: Date.now(),
            content: data.data.content,
            name: data.userName,
            timestamp: data.timestamp,
            clientId: data.clientId
          })
          scrollToBottom()
          break
          
        case 'typing:broadcast':
          handleRemoteTyping(data)
          break
          
        case 'user:online':
          onlineUsers.value = data.onlineUsers
          break
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error)
    }
  }
  
  ws.onclose = () => {
    console.log('WebSocket disconnected')
    isConnected.value = false
    // Auto-reconnect after 3 seconds
    setTimeout(() => {
      if (!isConnected.value) {
        connectWebSocket()
      }
    }, 3000)
  }
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
    isConnected.value = false
  }
}

// Send message
const sendMessage = async (content: string) => {
  if (!content.trim() || !isConnected.value) return
  
  try {
    // Save to database
    await $fetch('/api/messages', {
      method: 'POST',
      body: {
        user_id: props.currentUser?.id || 1,
        content
      }
    })
    
    // Broadcast via WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'message:send',
        data: {
          content,
          userName: props.currentUser?.name || 'Anonymous'
        }
      }))
    }
  } catch (error) {
    console.error('Error sending message:', error)
  }
}

// Handle typing
const handleTyping = (isTyping: boolean) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) return
  
  if (isTyping) {
    ws.send(JSON.stringify({
      type: 'typing:start'
    }))
  } else {
    ws.send(JSON.stringify({
      type: 'typing:stop'
    }))
  }
}

// Handle remote typing
const handleRemoteTyping = (data: any) => {
  if (data.isTyping) {
    if (!typingUsers.value.includes(data.userName)) {
      typingUsers.value.push(data.userName)
    }
  } else {
    typingUsers.value = typingUsers.value.filter(u => u !== data.userName)
  }
  
  someoneIsTyping.value = typingUsers.value.length > 0
}

// Scroll to bottom
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Handle scroll
const handleScroll = () => {
  // Could implement infinite scroll here
}

// Reconnect
const reconnect = () => {
  if (!isConnected.value) {
    connectWebSocket()
  }
}

// Lifecycle
onMounted(async () => {
  await fetchMessages()
  connectWebSocket()
  scrollToBottom()
  
  // Identify user
  if (ws && props.currentUser) {
    setTimeout(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'user:identify',
          userName: props.currentUser?.name || 'Anonymous'
        }))
      }
    }, 500)
  }
})

onUnmounted(() => {
  if (ws) {
    ws.close()
  }
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
})
</script>
