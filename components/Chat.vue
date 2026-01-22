<template>
  <div
    class="flex flex-col w-full h-full mx-auto overflow-hidden rounded-lg shadow-xl max-w-7xl bg-white/30 dark:bg-white/10 backdrop-blur-lg ring-1 ring-gray-900/5"
  >
    <!-- Chat header -->
    <div
      class="flex items-center justify-between px-6 py-4 border-b bg-white/50 dark:bg-white/5 border-gray-900/5"
    >
      <div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ title }}
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          <span
            :class="[
              'inline-block w-2 h-2 mr-2 rounded-full',
              isConnected ? 'bg-green-500' : 'bg-red-500',
            ]"
          ></span>
          {{ connectionStatus }}
        </p>
      </div>

      <!-- Online users count -->
      <div
        v-if="onlineUsers.length > 0"
        class="flex items-center px-3 py-1 space-x-2 text-sm rounded-full bg-white/50 dark:bg-white/5"
      >
        <div class="flex -space-x-2">
          <div
            v-for="user in onlineUsers.slice(0, 3)"
            :key="user.userId"
            class="inline-block w-8 h-8 rounded-full ring-2 ring-white dark:ring-gray-800"
          >
            <div class="w-full h-full bg-gray-300 rounded-full"></div>
          </div>
        </div>
        <span class="text-gray-600 dark:text-gray-400">
          {{ onlineUsers.length }} online
        </span>
      </div>
    </div>

    <!-- Messages area -->
    <div
      ref="messagesContainer"
      class="flex-1 px-6 py-4 space-y-2 overflow-y-auto"
      style="max-height: calc(100vh - 300px)"
      @scroll="handleScroll"
    >
      <!-- Loading indicator -->
      <div v-if="loading" class="flex items-center justify-center py-4">
        <div
          class="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"
        ></div>
      </div>

      <!-- Load more button -->
      <div
        v-if="hasMore && !loading"
        class="flex justify-center py-2"
      >
        <button
          @click="loadMore"
          class="px-4 py-2 text-sm font-medium text-gray-700 transition-all rounded-lg bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20"
        >
          Load more messages
        </button>
      </div>

      <!-- Messages list -->
      <div v-if="messages.length === 0 && !loading" class="py-8 text-center">
        <p class="text-gray-500 dark:text-gray-400">
          No messages yet. Start the conversation!
        </p>
      </div>

      <ChatMessage
        v-for="message in messages"
        :key="message.id"
        :message="message"
        :current-user-id="currentUserId"
      />

      <!-- Connection error -->
      <div
        v-if="connectionError"
        class="p-4 rounded-lg bg-red-100/50 dark:bg-red-900/20"
      >
        <p class="text-sm text-red-600 dark:text-red-400">
          {{ connectionError }}
        </p>
      </div>
    </div>

    <!-- Chat input -->
    <ChatInput
      :typing-users="typingUsers"
      :disabled="false"
      @send="handleSendMessage"
      @typing="handleTyping"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import type { Message, User, TypingIndicator, UserPresence } from '../types/chat'
import ChatMessage from './ChatMessage.vue'
import ChatInput from './ChatInput.vue'

interface Props {
  title?: string
  currentUser: User
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Chat Room',
})

const messages = ref<Message[]>([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)
const messagesContainer = ref<HTMLElement | null>(null)
const isAutoScrollEnabled = ref(true)

// WebSocket composable
const {
  isConnected,
  typingUsers,
  onlineUsers,
  connectionError,
  connect,
  disconnect,
  sendMessage,
  sendTypingIndicator,
  ws,
} = useWebSocket()

const currentUserId = computed(() => props.currentUser.id)

const connectionStatus = computed(() => {
  if (isConnected.value) return 'WebSocket Connected'
  if (connectionError.value) return 'HTTP Mode (Real-time disabled)'
  return 'Connecting...'
})

// Load messages from API
const loadMessages = async (pageNum: number = 1) => {
  loading.value = true
  try {
    const response = await $fetch<{
      messages: Message[]
      hasMore: boolean
    }>('/api/messages', {
      query: { page: pageNum, limit: 50 },
    })

    if (pageNum === 1) {
      messages.value = response.messages
    } else {
      messages.value = [...response.messages, ...messages.value]
    }

    hasMore.value = response.hasMore
  } catch (error) {
    console.error('Failed to load messages:', error)
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (loading.value || !hasMore.value) return
  page.value++
  await loadMessages(page.value)
}

const handleScroll = () => {
  if (!messagesContainer.value) return

  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value
  const scrollBottom = scrollHeight - scrollTop - clientHeight

  // Enable auto-scroll if user is near bottom (within 100px)
  isAutoScrollEnabled.value = scrollBottom < 100
}

const scrollToBottom = async (smooth: boolean = false) => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    })
  }
}

const handleSendMessage = async (content: string) => {
  try {
    // Send to API
    const newMessage = await $fetch<Message>('/api/messages', {
      method: 'POST',
      body: {
        user_id: props.currentUser.id,
        content,
        message_type: 'text',
      },
    })

    // Add to local messages
    messages.value.push(newMessage)

    // Broadcast via WebSocket
    sendMessage(content, props.currentUser.id)

    // Scroll to bottom
    if (isAutoScrollEnabled.value) {
      scrollToBottom(true)
    }
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

const handleTyping = (isTyping: boolean) => {
  sendTypingIndicator(isTyping, props.currentUser.id, props.currentUser.name)
}

// Listen for incoming WebSocket messages
watch(
  () => ws.value,
  (newWs) => {
    if (!newWs) return

    const originalOnMessage = newWs.onmessage

    newWs.onmessage = (event) => {
      // Call original handler
      if (originalOnMessage) {
        originalOnMessage.call(newWs, event)
      }

      // Handle message events
      try {
        const wsMessage = JSON.parse(event.data)
        if (wsMessage.type === 'message' && wsMessage.payload) {
          // Reload messages to get the new message with full user data
          loadMessages(1).then(() => {
            if (isAutoScrollEnabled.value) {
              scrollToBottom(true)
            }
          })
        }
      } catch (error) {
        console.error('Failed to handle WebSocket message:', error)
      }
    }
  }
)

onMounted(async () => {
  // Load initial messages
  await loadMessages(1)
  scrollToBottom(false)

  // Connect to WebSocket
  connect(props.currentUser.id, props.currentUser.name)
})

onUnmounted(() => {
  disconnect()
})
</script>
