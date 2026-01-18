<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
    <div class="container mx-auto px-4 py-6 h-screen flex flex-col">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 rounded-t-2xl shadow-lg p-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4 rtl:space-x-reverse">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span class="text-2xl">🤖</span>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                وجدان AI
              </h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                مساعدك الذكي للبرمجة والإبداع
              </p>
            </div>
          </div>

          <div class="flex items-center space-x-3 rtl:space-x-reverse">
            <!-- New Chat Button -->
            <button
              @click="startNewConversation"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2 rtl:space-x-reverse"
            >
              <span>➕</span>
              <span class="hidden sm:inline">محادثة جديدة</span>
            </button>

            <!-- History Button -->
            <button
              @click="showHistory = !showHistory"
              class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
            >
              📚
            </button>
          </div>
        </div>
      </div>

      <!-- Main Chat Area -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Sidebar - History -->
        <transition name="slide">
          <div
            v-if="showHistory"
            class="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto"
          >
            <ChatSidebar
              :conversations="conversations"
              :current-id="currentConversationId"
              @select="loadConversation"
              @delete="deleteConversation"
            />
          </div>
        </transition>

        <!-- Messages Area -->
        <div class="flex-1 flex flex-col bg-white dark:bg-gray-800">
          <!-- Messages List -->
          <div
            ref="messagesContainer"
            class="flex-1 overflow-y-auto p-6 space-y-4"
          >
            <ChatWelcome v-if="messages.length === 0" />

            <MessageBubble
              v-for="message in messages"
              :key="message.id"
              :message="message"
              @copy="copyMessage"
              @regenerate="regenerateMessage"
            />

            <TypingIndicator v-if="isTyping" />
          </div>

          <!-- Input Area -->
          <div class="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
            <MessageInput
              v-model="userInput"
              :is-loading="isLoading"
              :is-disabled="isLoading"
              @send="sendMessage"
              @stop="stopGeneration"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import type { Message, Conversation } from '~/types/chat'

// State
const userInput = ref('')
const messages = ref<Message[]>([])
const conversations = ref<Conversation[]>([])
const currentConversationId = ref<string | null>(null)
const isLoading = ref(false)
const isTyping = ref(false)
const showHistory = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

// Composables
const { sendChatMessage, streamMessage, stopStream } = useChat()
const { getConversations, saveConversation, deleteConversation: deleteConv } = useChatHistory()

// Methods
const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return

  const userMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: userInput.value,
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  const query = userInput.value
  userInput.value = ''

  isLoading.value = true
  isTyping.value = true

  await scrollToBottom()

  try {
    // AI Response Message
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date()
    }

    messages.value.push(aiMessage)

    // Stream response
    await streamMessage(query, (chunk) => {
      aiMessage.content += chunk
      scrollToBottom()
    })

    isTyping.value = false

    // Save to history
    await saveConversation({
      id: currentConversationId.value || Date.now().toString(),
      title: query.substring(0, 50) + '...',
      messages: messages.value,
      timestamp: new Date()
    })

    // Save to database
    await $fetch('/api/logs', {
      method: 'POST',
      body: {
        user_id: 'user-' + Date.now(),
        query: query,
        response: aiMessage.content
      }
    })

  } catch (error) {
    console.error('Error sending message:', error)
    isTyping.value = false

    // Show error message
    messages.value.push({
      id: Date.now().toString(),
      role: 'assistant',
      content: '❌ عذراً، حدث خطأ. الرجاء المحاولة مرة أخرى.',
      timestamp: new Date(),
      isError: true
    })
  } finally {
    isLoading.value = false
  }
}

const stopGeneration = () => {
  stopStream()
  isLoading.value = false
  isTyping.value = false
}

const startNewConversation = () => {
  messages.value = []
  currentConversationId.value = null
  userInput.value = ''
}

const loadConversation = (conversation: Conversation) => {
  messages.value = conversation.messages
  currentConversationId.value = conversation.id
  showHistory.value = false
}

const deleteConversation = async (id: string) => {
  await deleteConv(id)
  conversations.value = await getConversations()

  if (currentConversationId.value === id) {
    startNewConversation()
  }
}

const copyMessage = (content: string) => {
  navigator.clipboard.writeText(content)
  // TODO: Show toast notification
}

const regenerateMessage = async (messageId: string) => {
  // Find the user message before this AI message
  const messageIndex = messages.value.findIndex(m => m.id === messageId)
  if (messageIndex > 0) {
    const userMessage = messages.value[messageIndex - 1]
    messages.value = messages.value.slice(0, messageIndex)
    userInput.value = userMessage.content
    await sendMessage()
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Lifecycle
onMounted(async () => {
  conversations.value = await getConversations()
})

// Watch for new messages to auto-scroll
watch(() => messages.value.length, () => {
  scrollToBottom()
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(100%);
}
</style>
