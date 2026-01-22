<template>
  <div class="border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-white/5 backdrop-blur-lg p-4">
    <!-- Typing Indicator -->
    <div v-if="typingUsers.length > 0" class="text-xs text-gray-500 dark:text-gray-400 mb-2">
      {{ typingText }}
    </div>

    <!-- Input Form -->
    <form @submit.prevent="handleSubmit" class="flex items-end gap-2">
      <div class="flex-1 relative">
        <textarea
          v-model="message"
          ref="inputRef"
          :placeholder="placeholder"
          :disabled="disabled"
          @keydown="handleKeyDown"
          @input="handleInput"
          rows="1"
          class="w-full px-4 py-3 pr-12 rounded-2xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style="min-height: 48px; max-height: 150px"
        />
      </div>

      <button
        type="submit"
        :disabled="!message.trim() || disabled || isSending"
        class="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center gap-2"
      >
        <span v-if="isSending">Sending...</span>
        <span v-else>Send</span>
        <svg
          v-if="!isSending"
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted } from 'vue'

interface Props {
  disabled?: boolean
  placeholder?: string
  typingUsers?: string[]
  isSending?: boolean
}

interface Emits {
  (e: 'send', message: string): void
  (e: 'typing'): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  placeholder: 'Type a message...',
  typingUsers: () => [],
  isSending: false,
})

const emit = defineEmits<Emits>()

const message = ref('')
const inputRef = ref<HTMLTextAreaElement | null>(null)
const typingTimeout = ref<NodeJS.Timeout | null>(null)

const typingText = computed(() => {
  const users = props.typingUsers
  if (users.length === 0) return ''
  if (users.length === 1) return `${users[0]} is typing...`
  if (users.length === 2) return `${users[0]} and ${users[1]} are typing...`
  return `${users[0]} and ${users.length - 1} others are typing...`
})

const handleSubmit = () => {
  const trimmedMessage = message.value.trim()
  if (trimmedMessage && !props.disabled && !props.isSending) {
    emit('send', trimmedMessage)
    message.value = ''
    adjustTextareaHeight()
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSubmit()
  }
}

const handleInput = () => {
  adjustTextareaHeight()
  
  // Emit typing event with debounce
  emit('typing')
  
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
  typingTimeout.value = setTimeout(() => {
    // Stop typing indicator after 3 seconds of no input
  }, 3000)
}

onUnmounted(() => {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
})

const adjustTextareaHeight = () => {
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.style.height = 'auto'
      inputRef.value.style.height = `${Math.min(inputRef.value.scrollHeight, 150)}px`
    }
  })
}

defineExpose({
  focus: () => inputRef.value?.focus(),
})
</script>
