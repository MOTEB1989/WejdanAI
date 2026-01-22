<template>
  <div class="flex flex-col h-full">
    <!-- Online users sidebar (for desktop) -->
    <div v-if="showUserList" class="mb-4 p-4 bg-white/30 dark:bg-white/10 backdrop-blur-lg ring-1 ring-gray-900/5 rounded-lg">
      <h3 class="text-sm font-semibold mb-3">Online Users ({{ onlineUsers.length }})</h3>
      <div class="flex flex-wrap gap-2">
        <div
          v-for="user in onlineUsers"
          :key="user.id"
          class="flex items-center gap-2 px-3 py-2 bg-white/50 dark:bg-white/5 rounded-full"
        >
          <img
            v-if="user.image"
            :src="user.image"
            :alt="user.name"
            class="w-6 h-6 rounded-full ring-1 ring-gray-900/5"
          />
          <div class="w-2 h-2 bg-green-500 rounded-full"></div>
          <span class="text-xs font-medium">{{ user.name }}</span>
        </div>
      </div>
    </div>

    <!-- Messages container -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto p-4 space-y-2 bg-white/20 dark:bg-white/5 backdrop-blur-lg ring-1 ring-gray-900/5 rounded-t-lg"
    >
      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center h-full">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>

      <!-- Empty state -->
      <div v-else-if="messages.length === 0" class="flex items-center justify-center h-full">
        <div class="text-center">
          <p class="text-gray-500">No messages yet</p>
          <p class="text-sm text-gray-400 mt-2">Start a conversation!</p>
        </div>
      </div>

      <!-- Messages -->
      <div v-else>
        <ChatMessage
          v-for="message in messages"
          :key="message.id"
          :message="message"
          :current-user-id="currentUserId"
        />
      </div>
    </div>

    <!-- Chat input -->
    <ChatInput
      :typing-users="typingUsers"
      @send="handleSendMessage"
      @typing="handleTyping"
    />

    <!-- Connection status -->
    <div
      v-if="!isConnected"
      class="absolute top-4 right-4 px-3 py-2 bg-red-500/90 text-white text-xs rounded-full backdrop-blur-lg"
    >
      Disconnected
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Message, OnlineUser } from '~/types/chat'

const props = defineProps<{
  currentUserId?: number
  showUserList?: boolean
}>()

const emit = defineEmits<{
  sendMessage: [message: string]
}>()

// State
const messages = ref<Message[]>([])
const onlineUsers = ref<OnlineUser[]>([])
const typingUsers = ref<string[]>([])
const isConnected = ref(false)
const loading = ref(true)
const messagesContainer = ref<HTMLDivElement | null>(null)

// WebSocket connection
let ws: WebSocket | null = null

// Fetch initial messages
const fetchMessages = async () => {
  try {
    loading.value = true
    const response = await $fetch<{ messages: Message[] }>('/api/messages')
    messages.value = response.messages || []
    
    // Scroll to bottom after loading messages
    nextTick(() => {
      scrollToBottom()
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
  } finally {
    loading.value = false
  }
}

// Fetch online users
const fetchOnlineUsers = async () => {
  try {
    const response = await $fetch<{ users: OnlineUser[] }>('/api/users/online')
    onlineUsers.value = response.users || []
  } catch (error) {
    console.error('Error fetching online users:', error)
  }
}

// Initialize WebSocket connection
const initWebSocket = () => {
  // In a real implementation, we would connect to ws://localhost:3000/api/websocket
  // For now, we'll simulate the connection
  console.log('WebSocket connection would be initialized here')
  isConnected.value = true
  
  // Note: Actual WebSocket implementation would require server-side WebSocket support
  // This is a simplified version for demonstration
}

// Scroll to bottom of messages
const scrollToBottom = (smooth = false) => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    })
  }
}

// Handle sending message
const handleSendMessage = async (content: string) => {
  if (!props.currentUserId) {
    console.error('No current user ID')
    return
  }

  try {
    // Send message to API
    const newMessage = await $fetch<Message>('/api/messages', {
      method: 'POST',
      body: {
        userId: props.currentUserId,
        content,
        messageType: 'text',
      },
    })

    // Add message to list (optimistic update)
    messages.value.push(newMessage)
    
    // Scroll to bottom
    nextTick(() => {
      scrollToBottom(true)
    })

    // Emit event
    emit('sendMessage', content)
  } catch (error) {
    console.error('Error sending message:', error)
  }
}

// Handle typing indicator
const handleTyping = (isTyping: boolean) => {
  // In real implementation, this would send typing status via WebSocket
  console.log('Typing:', isTyping)
}

// Initialize on mount
onMounted(async () => {
  await fetchMessages()
  await fetchOnlineUsers()
  initWebSocket()
})

// Cleanup on unmount
onBeforeUnmount(() => {
  if (ws) {
    ws.close()
  }
})
</script>
