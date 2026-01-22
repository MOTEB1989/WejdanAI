<template>
  <div class="border-t border-gray-900/5 bg-white/30 dark:bg-white/10 backdrop-blur-lg p-4">
    <form @submit.prevent="handleSubmit" class="flex items-end space-x-2">
      <!-- Text Input -->
      <div class="flex-1 relative">
        <textarea
          ref="inputRef"
          v-model="messageText"
          @keydown="handleKeyDown"
          @input="handleInput"
          placeholder="Type a message..."
          rows="1"
          class="w-full px-4 py-3 bg-white/50 dark:bg-white/5 border border-gray-900/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-hidden dark:text-white text-gray-900 placeholder-gray-500"
          :maxlength="maxLength"
        />
        
        <!-- Character Counter -->
        <div
          v-if="messageText.length > maxLength * 0.8"
          class="absolute bottom-2 right-3 text-xs"
          :class="messageText.length >= maxLength ? 'text-red-500' : 'text-gray-400'"
        >
          {{ messageText.length }}/{{ maxLength }}
        </div>
      </div>

      <!-- Send Button -->
      <button
        type="submit"
        :disabled="!messageText.trim() || isSending"
        class="px-6 py-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
      >
        <span v-if="!isSending">Send</span>
        <span v-else>Sending...</span>
      </button>
    </form>

    <!-- Typing Indicator -->
    <div
      v-if="typingUsers.size > 0"
      class="mt-2 text-xs text-gray-500 dark:text-gray-400"
    >
      {{ typingText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'

interface Props {
  typingUsers: Map<number, string>
  isSending?: boolean
  maxLength?: number
}

interface Emits {
  (e: 'send', message: string): void
  (e: 'typing', isTyping: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  isSending: false,
  maxLength: 1000
})

const emit = defineEmits<Emits>()

const messageText = ref('')
const inputRef = ref<HTMLTextAreaElement | null>(null)
let typingTimeout: NodeJS.Timeout | null = null

const typingText = computed(() => {
  const users = Array.from(props.typingUsers.values())
  if (users.length === 0) return ''
  if (users.length === 1) return `${users[0]} is typing...`
  if (users.length === 2) return `${users[0]} and ${users[1]} are typing...`
  return `${users[0]} and ${users.length - 1} others are typing...`
})

const handleSubmit = () => {
  const text = messageText.value.trim()
  if (!text || props.isSending) return

  emit('send', text)
  messageText.value = ''
  
  // Reset typing indicator
  emit('typing', false)
  if (typingTimeout) {
    clearTimeout(typingTimeout)
    typingTimeout = null
  }

  // Reset textarea height
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.style.height = 'auto'
    }
  })
}

const handleKeyDown = (event: KeyboardEvent) => {
  // Enter without shift sends message
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSubmit()
  }
}

const handleInput = () => {
  // Auto-resize textarea
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
    inputRef.value.style.height = `${Math.min(inputRef.value.scrollHeight, 150)}px`
  }

  // Emit typing indicator
  if (messageText.value.trim()) {
    emit('typing', true)
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }
    
    // Set new timeout to stop typing indicator after 2 seconds of no input
    typingTimeout = setTimeout(() => {
      emit('typing', false)
    }, 2000)
  } else {
    emit('typing', false)
    if (typingTimeout) {
      clearTimeout(typingTimeout)
      typingTimeout = null
    }
  }
}

// Watch for changes in typingUsers to force reactivity
watch(() => props.typingUsers.size, () => {
  // Force re-computation of typingText
})
</script>
