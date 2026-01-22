<template>
  <div class="flex flex-col h-full bg-white/30 dark:bg-white/10 backdrop-blur-lg rounded-lg shadow-xl ring-1 ring-gray-900/5">
    <!-- Chat Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-900/5">
      <div class="space-y-1">
        <h2 class="text-xl font-semibold dark:text-white text-gray-900">
          WejdanAI Chat
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Real-time messaging
        </p>
      </div>
      
      <!-- Connection Status -->
      <div class="flex items-center space-x-2">
        <div
          :class="[
            'w-2 h-2 rounded-full',
            isConnected ? 'bg-green-500' : 'bg-red-500'
          ]"
        />
        <span class="text-sm text-gray-500 dark:text-gray-400">
          {{ isConnected ? 'Connected' : 'Disconnected' }}
        </span>
      </div>
    </div>

    <!-- Messages Container -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto px-6 py-4 space-y-2"
      @scroll="handleScroll"
    >
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-8">
        <div class="text-gray-500 dark:text-gray-400">Loading messages...</div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="allMessages.length === 0"
        class="flex flex-col items-center justify-center h-full text-center"
      >
        <div class="text-gray-500 dark:text-gray-400 mb-2">
          <svg
            class="w-16 h-16 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p class="text-lg font-medium">No messages yet</p>
          <p class="text-sm mt-1">Be the first to start the conversation!</p>
        </div>
      </div>

      <!-- Messages -->
      <div v-else>
        <ChatMessage
          v-for="message in allMessages"
          :key="message.id || message.timestamp"
          :message="message"
          :current-user-id="currentUser.id"
        />
      </div>

      <!-- Auto-scroll anchor -->
      <div ref="scrollAnchor" />
    </div>

    <!-- Chat Input -->
    <ChatInput
      :typing-users="typingUsers"
      :is-sending="isSending"
      @send="handleSendMessage"
      @typing="handleTyping"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useWebSocket } from '~/composables/useWebSocket'
import type { Message } from '~/composables/useWebSocket'

interface Props {
  currentUser: {
    id: number
    name: string
    image?: string
  }
}

const props = defineProps<Props>()

const messagesContainer = ref<HTMLElement | null>(null)
const scrollAnchor = ref<HTMLElement | null>(null)
const isLoading = ref(true)
const isSending = ref(false)
const historicalMessages = ref<Message[]>([])
const shouldAutoScroll = ref(true)

// WebSocket composable
const {
  isConnected,
  messages: wsMessages,
  typingUsers,
  connect,
  sendMessage,
  sendTypingIndicator
} = useWebSocket()

// Combine historical and real-time messages
const allMessages = computed(() => {
  const combined = [...historicalMessages.value, ...wsMessages.value]
  // Remove duplicates based on timestamp and content
  const unique = combined.filter((message, index, self) =>
    index === self.findIndex((m) =>
      m.timestamp === message.timestamp && m.content === message.content
    )
  )
  // Sort by timestamp
  return unique.sort((a, b) => {
    const timeA = new Date(a.timestamp || a.createdAt || 0).getTime()
    const timeB = new Date(b.timestamp || b.createdAt || 0).getTime()
    return timeA - timeB
  })
})

// Load historical messages
const loadMessages = async () => {
  try {
    isLoading.value = true
    const response = await fetch('/api/messages/recent')
    const data = await response.json()
    
    if (data.messages) {
      historicalMessages.value = data.messages.map((msg: any) => ({
        id: msg.id,
        userId: msg.user_id,
        userName: msg.user_name,
        userImage: msg.user_image,
        content: msg.content,
        messageType: msg.message_type,
        createdAt: msg.created_at,
        timestamp: msg.created_at
      }))
    }
  } catch (error) {
    console.error('Error loading messages:', error)
  } finally {
    isLoading.value = false
  }
}

// Send message
const handleSendMessage = async (content: string) => {
  try {
    isSending.value = true

    // Save to database
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: props.currentUser.id,
        user_name: props.currentUser.name,
        user_image: props.currentUser.image,
        content,
        message_type: 'text'
      })
    })

    const data = await response.json()
    
    if (data.message) {
      // Broadcast via WebSocket
      sendMessage({
        id: data.message.id,
        userId: props.currentUser.id,
        userName: props.currentUser.name,
        userImage: props.currentUser.image,
        content,
        messageType: 'text',
        timestamp: data.message.created_at
      })
    }
  } catch (error) {
    console.error('Error sending message:', error)
  } finally {
    isSending.value = false
  }
}

// Handle typing indicator
const handleTyping = (isTyping: boolean) => {
  sendTypingIndicator(props.currentUser.id, props.currentUser.name, isTyping)
}

// Auto-scroll to bottom
const scrollToBottom = (smooth = true) => {
  nextTick(() => {
    if (messagesContainer.value && shouldAutoScroll.value) {
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      })
    }
  })
}

// Handle scroll to detect if user is at bottom
const handleScroll = () => {
  if (!messagesContainer.value) return
  
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value
  const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
  shouldAutoScroll.value = isAtBottom
}

// Watch for new messages
watch(() => allMessages.value.length, () => {
  scrollToBottom()
})

// Initialize
onMounted(async () => {
  await loadMessages()
  
  // Connect to WebSocket
  connect(props.currentUser.id, props.currentUser.name, props.currentUser.image)
  
  // Initial scroll
  setTimeout(() => {
    scrollToBottom(false)
  }, 100)
})
</script>
