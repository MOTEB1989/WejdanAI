<template>
  <div class="flex flex-col h-screen bg-slate-950">
    <!-- Header -->
    <header class="flex-shrink-0 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm">
      <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 class="text-lg font-semibold text-white">Wejdan AI</h1>
            <p class="text-xs text-slate-400">مساعدك الذكي</p>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button
            @click="clearChat"
            class="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-200"
            title="محادثة جديدة"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          
          <NuxtLink
            to="/"
            class="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-200"
            title="الصفحة الرئيسية"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Messages Container -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto px-4 py-6"
    >
      <div class="max-w-4xl mx-auto space-y-4">
        <!-- Welcome Message -->
        <div v-if="messages.length === 0" class="text-center py-12">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-2xl">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 class="text-2xl font-semibold text-white mb-2">مرحباً بك في Wejdan AI</h2>
          <p class="text-slate-400 mb-8 max-w-md mx-auto">
            أنا مساعدك الذكي المدعوم بتقنية Claude. كيف يمكنني مساعدتك اليوم؟
          </p>
          
          <!-- Suggested Questions -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            <button
              v-for="suggestion in suggestions"
              :key="suggestion"
              @click="sendMessage(suggestion)"
              class="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500 transition-all text-slate-300 hover:text-white text-sm text-right"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>

        <!-- Messages -->
        <ChatMessage
          v-for="(message, index) in messages"
          :key="index"
          :message="message"
        />

        <!-- Typing Indicator -->
        <div v-if="isTyping" class="flex gap-3 items-start">
          <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div class="flex gap-1 items-center bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3">
            <div class="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style="animation-delay: 0ms"></div>
            <div class="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style="animation-delay: 150ms"></div>
            <div class="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style="animation-delay: 300ms"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <ChatInput
      :loading="isLoading"
      @send="handleSendMessage"
    />

    <!-- Error Toast -->
    <div
      v-if="error"
      class="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slideUp"
    >
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ error }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

const messages = ref<Message[]>([])
const isLoading = ref(false)
const isTyping = ref(false)
const error = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

const suggestions = [
  'ما هي أفضل ممارسات البرمجة؟',
  'كيف أتعلم البرمجة من الصفر؟',
  'ما الفرق بين TypeScript و JavaScript؟',
  'شرح مفهوم الذكاء الاصطناعي'
]

// Scroll to bottom
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Send message to user (from suggestions)
const sendMessage = (text: string) => {
  handleSendMessage(text)
}

// Handle send message
const handleSendMessage = async (messageText: string) => {
  if (!messageText.trim() || isLoading.value) return

  error.value = ''

  // Add user message
  const userMessage: Message = {
    role: 'user',
    content: messageText,
    timestamp: Date.now()
  }
  messages.value.push(userMessage)
  scrollToBottom()

  // Show loading states
  isLoading.value = true
  isTyping.value = true

  try {
    // Call chat API
    const response = await $fetch('/api/chat', {
      method: 'POST',
      body: {
        message: messageText,
        conversation_history: messages.value.slice(0, -1).map(m => ({
          role: m.role,
          content: m.content
        }))
      }
    })

    // Add AI response
    const aiMessage: Message = {
      role: 'assistant',
      content: response.response,
      timestamp: Date.now()
    }
    messages.value.push(aiMessage)
    scrollToBottom()
  } catch (err: any) {
    console.error('Chat error:', err)
    error.value = err.data?.message || 'حدث خطأ أثناء الإرسال. حاول مرة أخرى.'
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
      error.value = ''
    }, 5000)
  } finally {
    isLoading.value = false
    isTyping.value = false
  }
}

// Clear chat
const clearChat = () => {
  if (messages.value.length > 0 && confirm('هل تريد مسح المحادثة؟')) {
    messages.value = []
  }
}

// Load messages from localStorage on mount
onMounted(() => {
  try {
    const saved = localStorage.getItem('wejdan-chat-messages')
    if (saved) {
      messages.value = JSON.parse(saved)
      scrollToBottom()
    }
  } catch (err) {
    console.error('Failed to load messages:', err)
  }
})

// Save messages to localStorage
watch(messages, (newMessages) => {
  try {
    localStorage.setItem('wejdan-chat-messages', JSON.stringify(newMessages))
  } catch (err) {
    console.error('Failed to save messages:', err)
  }
}, { deep: true })
</script>

<style scoped>
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.animate-slideUp {
  animation: slideUp 0.3s ease-out;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}

.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgb(15 23 42);
}

::-webkit-scrollbar-thumb {
  background: rgb(51 65 85);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgb(71 85 105);
}
</style>
