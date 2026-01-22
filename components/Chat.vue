<template>
  <div class="flex flex-col h-full bg-white/30 dark:bg-white/10 backdrop-blur-lg rounded-lg shadow-xl ring-1 ring-gray-900/5 overflow-hidden">
    <!-- Chat Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-white/5 backdrop-blur-lg">
      <div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          Chat Room
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          <span v-if="isConnected" class="flex items-center gap-2">
            <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Connected
          </span>
          <span v-else class="flex items-center gap-2">
            <span class="w-2 h-2 bg-red-500 rounded-full" />
            Disconnected
          </span>
        </p>
      </div>

      <!-- User Badge -->
      <div v-if="currentUser" class="flex items-center gap-3">
        <div class="text-right">
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ currentUser.name }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ currentUser.email }}
          </p>
        </div>
        <img
          v-if="currentUser.image"
          :src="currentUser.image"
          :alt="currentUser.name"
          class="w-10 h-10 rounded-full ring-2 ring-blue-500"
        />
        <div
          v-else
          class="w-10 h-10 rounded-full ring-2 ring-blue-500 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold"
        >
          {{ currentUser.name?.charAt(0).toUpperCase() }}
        </div>
      </div>
    </div>

    <!-- Messages Container -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto px-6 py-4 space-y-1"
      @scroll="handleScroll"
    >
      <!-- Loading State -->
      <div v-if="isLoadingMessages" class="flex items-center justify-center py-8">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p class="text-sm text-gray-500 dark:text-gray-400">Loading messages...</p>
        </div>
      </div>

      <!-- Messages List -->
      <div v-else-if="allMessages.length > 0">
        <ChatMessage
          v-for="message in allMessages"
          :key="message.id"
          :message="message"
          :current-user-id="currentUser?.id"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center h-full text-center">
        <svg
          class="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4"
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
        <p class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
          No messages yet
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Start the conversation by sending a message below
        </p>
      </div>

      <!-- Scroll to Bottom Button -->
      <button
        v-if="showScrollButton"
        @click="scrollToBottom(true)"
        class="fixed bottom-24 right-8 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-all duration-200"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
    </div>

    <!-- Chat Input -->
    <ChatInput
      :disabled="!isConnected || isSendingMessage"
      :is-sending="isSendingMessage"
      @send="sendMessage"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'

interface User {
  id: number
  name: string
  email: string
  image?: string
}

interface Message {
  id: number
  user_id: number
  user_name: string
  user_email: string
  user_image?: string
  content: string
  created_at: string
  message_type: string
}

interface Props {
  currentUser?: User
}

const props = defineProps<Props>()

const allMessages = ref<Message[]>([])
const isLoadingMessages = ref(false)
const isSendingMessage = ref(false)
const isConnected = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const showScrollButton = ref(false)
const autoScroll = ref(true)

// Simulated connection for now (WebSocket would go here)
onMounted(async () => {
  await loadMessages()
  // Simulate connection
  setTimeout(() => {
    isConnected.value = true
  }, 500)
})

const loadMessages = async () => {
  isLoadingMessages.value = true
  try {
    const response = await $fetch('/api/messages')
    allMessages.value = response.messages || []
    await nextTick()
    scrollToBottom(false)
  } catch (error) {
    console.error('Failed to load messages:', error)
  } finally {
    isLoadingMessages.value = false
  }
}

const sendMessage = async (content: string) => {
  if (!props.currentUser) {
    console.error('No current user')
    return
  }

  isSendingMessage.value = true
  try {
    const response = await $fetch('/api/messages', {
      method: 'POST',
      body: {
        user_id: props.currentUser.id,
        content,
        message_type: 'text',
      },
    })

    if (response.success) {
      allMessages.value.push(response.message)
      await nextTick()
      scrollToBottom(true)
    }
  } catch (error) {
    console.error('Failed to send message:', error)
  } finally {
    isSendingMessage.value = false
  }
}

const scrollToBottom = (smooth = true) => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    })
  }
}

const handleScroll = () => {
  if (!messagesContainer.value) return
  
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value
  const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
  
  showScrollButton.value = !isAtBottom
  autoScroll.value = isAtBottom
}

watch(
  () => allMessages.value.length,
  async () => {
    if (autoScroll.value) {
      await nextTick()
      scrollToBottom(true)
    }
  }
)
</script>
