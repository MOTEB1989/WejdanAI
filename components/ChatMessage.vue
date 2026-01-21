<template>
  <div
    class="flex gap-3 animate-fadeIn"
    :class="[
      message.role === 'user' ? 'justify-end' : 'justify-start'
    ]"
  >
    <!-- AI Avatar -->
    <div
      v-if="message.role === 'assistant'"
      class="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
    >
      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    </div>

    <!-- Message Bubble -->
    <div
      class="max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 shadow-lg"
      :class="[
        message.role === 'user'
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
          : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-md'
      ]"
    >
      <div
        class="text-sm sm:text-base whitespace-pre-wrap break-words"
        :class="{ 'text-right': message.role === 'user' && isRTL(message.content) }"
        v-html="formatMessage(message.content)"
      />
      
      <!-- Timestamp -->
      <div
        class="mt-1 text-xs opacity-60"
        :class="{ 'text-right': message.role === 'user' }"
      >
        {{ formatTime(message.timestamp) }}
      </div>
    </div>

    <!-- User Avatar -->
    <div
      v-if="message.role === 'user'"
      class="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"
    >
      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: number
}

interface Props {
  message: Message
}

defineProps<Props>()

// Check if text is RTL (contains Arabic characters)
const isRTL = (text: string): boolean => {
  const arabicRegex = /[\u0600-\u06FF]/
  return arabicRegex.test(text)
}

// Format message content (basic markdown support)
const formatMessage = (content: string): string => {
  if (!content) return ''
  
  // Escape HTML
  let formatted = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  
  // Bold **text**
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  
  // Italic *text*
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>')
  
  // Code `text`
  formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-slate-900/50 px-1 py-0.5 rounded text-sm">$1</code>')
  
  return formatted
}

// Format timestamp
const formatTime = (timestamp?: number): string => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // Less than 1 minute
  if (diff < 60000) {
    return 'الآن'
  }
  
  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `منذ ${minutes} دقيقة`
  }
  
  // Same day
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
  }
  
  // Different day
  return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
</style>
