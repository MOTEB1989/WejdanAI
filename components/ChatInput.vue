<template>
  <div class="border-t border-gray-200 dark:border-gray-700 bg-white/30 dark:bg-white/5 backdrop-blur-lg p-4">
    <div class="flex gap-2">
      <input
        v-model="message"
        type="text"
        placeholder="Type a message..."
        class="flex-1 rounded-full px-4 py-2 bg-white/60 dark:bg-white/10 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        @keyup.enter="handleSend"
        @input="handleTyping"
      />
      <button
        :disabled="!message.trim() || sending"
        @click="handleSend"
        class="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full transition-colors text-sm font-medium shadow-sm"
      >
        {{ sending ? 'Sending...' : 'Send' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const message = ref('')
const sending = ref(false)

const emit = defineEmits<{
  send: [message: string]
  typing: []
}>()

const handleSend = async () => {
  if (!message.value.trim() || sending.value) return
  
  sending.value = true
  emit('send', message.value.trim())
  message.value = ''
  sending.value = false
}

let typingTimer: NodeJS.Timeout | null = null
const handleTyping = () => {
  if (typingTimer) {
    clearTimeout(typingTimer)
  }
  
  typingTimer = setTimeout(() => {
    emit('typing')
  }, 500)
}
</script>
