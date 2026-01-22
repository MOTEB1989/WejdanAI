<template>
  <div class="p-4 border-t border-gray-900/5 dark:border-white/10 bg-white/50 dark:bg-white/5">
    <form @submit.prevent="handleSubmit" class="flex items-end space-x-2">
      <div class="flex-1">
        <textarea
          ref="inputRef"
          v-model="message"
          @input="handleInput"
          @keydown.enter.exact.prevent="handleSubmit"
          placeholder="Type a message..."
          rows="1"
          class="w-full px-4 py-2 text-sm resize-none rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
          :disabled="disabled"
          style="max-height: 120px; min-height: 40px;"
        ></textarea>
      </div>
      
      <button
        type="submit"
        :disabled="disabled || !message.trim()"
        class="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white transition-all transform active:scale-95"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
          />
        </svg>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  'send-message': [message: string]
  'typing': [isTyping: boolean]
}>()

const message = ref('')
const inputRef = ref<HTMLTextAreaElement | null>(null)
const typingTimeout = ref<any>(null)

// Auto-resize textarea
const handleInput = () => {
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
    inputRef.value.style.height = Math.min(inputRef.value.scrollHeight, 120) + 'px'
  }
  
  // Emit typing event
  emit('typing', true)
  
  // Clear previous timeout
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
  
  // Set new timeout to stop typing indicator
  typingTimeout.value = setTimeout(() => {
    emit('typing', false)
  }, 1000)
}

// Handle submit
const handleSubmit = () => {
  if (!message.value.trim() || props.disabled) return
  
  emit('send-message', message.value)
  emit('typing', false)
  message.value = ''
  
  // Reset textarea height
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
  }
  
  // Clear typing timeout
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
}

// Watch for disabled state changes
watch(() => props.disabled, (disabled) => {
  if (disabled && typingTimeout.value) {
    clearTimeout(typingTimeout.value)
    emit('typing', false)
  }
})
</script>
