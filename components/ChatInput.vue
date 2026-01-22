<template>
  <div class="p-4 bg-white/30 dark:bg-white/10 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50">
    <form @submit.prevent="handleSubmit" class="flex gap-2">
      <input
        v-model="message"
        type="text"
        placeholder="Type a message..."
        :disabled="disabled"
        class="flex-1 px-4 py-3 rounded-full bg-white/50 dark:bg-white/5 border border-gray-300/50 dark:border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all"
        @input="handleTyping"
      />
      <button
        type="submit"
        :disabled="!message.trim() || disabled"
        class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl active:shadow-md"
      >
        <span v-if="!sending">Send</span>
        <span v-else class="flex items-center gap-2">
          <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Sending
        </span>
      </button>
    </form>
    
    <!-- Typing Indicator -->
    <div v-if="typingUsers.length > 0" class="mt-2 text-xs text-gray-500 dark:text-gray-400">
      <span class="italic">
        {{ typingUsers.join(', ') }} {{ typingUsers.length === 1 ? 'is' : 'are' }} typing...
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const message = ref('')
const sending = ref(false)

const props = defineProps<{
  disabled?: boolean
  typingUsers?: string[]
}>()

const emit = defineEmits<{
  send: [message: string]
  typing: []
}>()

const handleSubmit = async () => {
  if (!message.value.trim() || props.disabled) return
  
  const messageToSend = message.value.trim()
  message.value = ''
  sending.value = true
  
  try {
    emit('send', messageToSend)
  } finally {
    sending.value = false
  }
}

const handleTyping = () => {
  emit('typing')
}
</script>
