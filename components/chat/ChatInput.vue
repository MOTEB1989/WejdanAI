<template>
  <div class="flex items-end gap-2 p-4 bg-white/30 dark:bg-white/10 backdrop-blur-lg ring-1 ring-gray-900/5">
    <!-- Text input -->
    <textarea
      v-model="message"
      ref="textareaRef"
      @keydown.enter.exact.prevent="sendMessage"
      @input="handleInput"
      placeholder="Type a message..."
      rows="1"
      class="flex-1 resize-none bg-transparent border-none outline-none text-sm max-h-32 min-h-[2.5rem] py-2 px-3 rounded-lg focus:ring-2 focus:ring-blue-500/50"
    ></textarea>

    <!-- Typing indicator (shown to others) -->
    <div v-if="isTyping" class="text-xs text-gray-500 absolute -top-6 left-4">
      {{ typingUsers.join(', ') }} {{ typingUsers.length === 1 ? 'is' : 'are' }} typing...
    </div>

    <!-- Send button -->
    <button
      @click="sendMessage"
      :disabled="!message.trim() || sending"
      class="p-2.5 rounded-full bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors flex-shrink-0"
      title="Send message"
    >
      <svg
        v-if="!sending"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="w-5 h-5"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
      </svg>
      <svg
        v-else
        class="animate-spin h-5 w-5 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  typingUsers?: string[]
}>()

const emit = defineEmits<{
  send: [message: string]
  typing: [isTyping: boolean]
}>()

const message = ref('')
const sending = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const typingTimeout = ref<NodeJS.Timeout | null>(null)

const isTyping = computed(() => props.typingUsers && props.typingUsers.length > 0)

const sendMessage = async () => {
  if (!message.value.trim() || sending.value) return

  sending.value = true
  emit('send', message.value.trim())
  message.value = ''
  
  // Reset textarea height
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }
  
  // Stop typing indicator
  emit('typing', false)
  
  setTimeout(() => {
    sending.value = false
  }, 500)
}

const handleInput = () => {
  // Auto-resize textarea
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }

  // Emit typing indicator
  emit('typing', true)
  
  // Clear existing timeout
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
  
  // Set new timeout to stop typing indicator
  typingTimeout.value = setTimeout(() => {
    emit('typing', false)
  }, 1000)
}

onBeforeUnmount(() => {
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
})
</script>
