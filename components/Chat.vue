<template>
  <div class="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
    <!-- Main Chat Area -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <div class="border-b border-gray-200 dark:border-gray-700 bg-white/30 dark:bg-white/5 backdrop-blur-lg px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold bg-gradient-to-br dark:from-white from-black via-gray-700 to-gray-500 bg-clip-text text-transparent">
              WejdanAI Chat
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span 
                :class="[
                  'inline-block w-2 h-2 rounded-full mr-2',
                  connected ? 'bg-green-500' : 'bg-red-500'
                ]"
              ></span>
              {{ connected ? 'Connected' : 'Disconnected' }}
            </p>
          </div>
          <NuxtLink 
            to="/"
            class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all rounded-full shadow-sm bg-white/30 dark:bg-white/10 ring-1 ring-gray-900/5 hover:shadow-lg"
          >
            Back to Home
          </NuxtLink>
        </div>
      </div>

      <!-- Messages Area -->
      <div 
        ref="messagesContainer"
        class="flex-1 overflow-y-auto p-6 space-y-4"
      >
        <div v-if="loading" class="flex justify-center items-center h-full">
          <div class="text-gray-500 dark:text-gray-400">Loading messages...</div>
        </div>
        
        <div v-else-if="messages.length === 0" class="flex justify-center items-center h-full">
          <div class="text-center">
            <p class="text-gray-500 dark:text-gray-400 mb-2">No messages yet</p>
            <p class="text-sm text-gray-400 dark:text-gray-500">Be the first to send a message!</p>
          </div>
        </div>

        <ChatMessage 
          v-for="message in messages" 
          :key="message.id" 
          :message="message" 
          :is-own="message.user_name === currentUser.name"
        />

        <div v-if="someoneTyping" class="flex gap-3">
          <div class="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
          <div class="bg-white/60 dark:bg-white/10 backdrop-blur-lg ring-1 ring-gray-900/5 rounded-2xl rounded-bl-md px-4 py-2">
            <div class="flex gap-1">
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></span>
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <ChatInput @send="sendMessage" @typing="handleTyping" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

interface Message {
  id: number
  user_id?: number
  user_name: string
  user_image?: string
  content: string
  created_at: string
  message_type?: string
}

// Constants
const TYPING_INDICATOR_TIMEOUT = 2000
const RECONNECTION_TIMEOUT = 3000
const DEFAULT_USER_IMAGE = 'https://images.ctfassets.net/e5382hct74si/2P1iOve0LZJRZWUzfXpi9r/9d4d27765764fb1ad7379d7cbe5f1043/ucxb4lHy_400x400.jpg'

const messages = ref<Message[]>([])
const loading = ref(true)
const connected = ref(false)
const someoneTyping = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

// Current user (would come from auth system in production)
const currentUser = ref({
  id: 1,
  name: 'You',
  image: DEFAULT_USER_IMAGE
})

let ws: WebSocket | null = null
let typingTimeout: NodeJS.Timeout | null = null

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const connectWebSocket = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsUrl = `${protocol}//${window.location.host}/api/ws`
  
  ws = new WebSocket(wsUrl)
  
  ws.onopen = () => {
    console.log('WebSocket connected')
    connected.value = true
  }
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    
    if (data.type === 'message' && data.id) {
      // Check if message already exists
      if (!messages.value.find(m => m.id === data.id)) {
        messages.value.push({
          id: data.id,
          user_id: data.user_id,
          user_name: data.user_name,
          user_image: data.user_image,
          content: data.content,
          created_at: data.created_at,
          message_type: data.message_type
        })
        scrollToBottom()
      }
    } else if (data.type === 'typing') {
      someoneTyping.value = true
      
      if (typingTimeout) {
        clearTimeout(typingTimeout)
      }
      
      typingTimeout = setTimeout(() => {
        someoneTyping.value = false
      }, TYPING_INDICATOR_TIMEOUT)
    }
  }
  
  ws.onclose = () => {
    console.log('WebSocket disconnected')
    connected.value = false
    
    // Attempt to reconnect after timeout
    setTimeout(() => {
      if (!connected.value) {
        connectWebSocket()
      }
    }, RECONNECTION_TIMEOUT)
  }
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error)
    connected.value = false
  }
}

const sendMessage = async (content: string) => {
  try {
    // Save to database
    const response = await $fetch('/api/messages', {
      method: 'POST',
      body: {
        content,
        user_name: currentUser.value.name,
        user_image: currentUser.value.image,
        user_id: currentUser.value.id
      }
    })
    
    // Broadcast via WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'message',
        ...response
      }))
    }
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

const handleTyping = () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'typing',
      user_name: currentUser.value.name
    }))
  }
}

const loadMessages = async () => {
  try {
    loading.value = true
    const data = await $fetch('/api/messages')
    messages.value = data.messages || []
    scrollToBottom()
  } catch (error) {
    console.error('Failed to load messages:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadMessages()
  connectWebSocket()
})

onUnmounted(() => {
  if (ws) {
    ws.close()
  }
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
})
</script>
