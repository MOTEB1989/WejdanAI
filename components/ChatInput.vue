<template>
  <div
    class="p-4 bg-white/30 dark:bg-white/10 backdrop-blur-lg border-t border-gray-900/5"
  >
    <form @submit.prevent="handleSend" class="flex items-end gap-2">
      <div class="flex-1">
        <textarea
          ref="inputRef"
          v-model="message"
          @keydown="handleKeydown"
          @input="handleInput"
          placeholder="Type a message..."
          rows="1"
          class="w-full px-4 py-3 text-sm bg-white/50 dark:bg-white/5 backdrop-blur-lg rounded-2xl border border-gray-900/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          :disabled="disabled"
        />
        <div
          v-if="characterCount > 0"
          class="mt-1 text-xs text-right"
          :class="
            characterCount > maxLength
              ? 'text-red-500'
              : 'text-gray-500 dark:text-gray-400'
          "
        >
          {{ characterCount }} / {{ maxLength }}
        </div>
      </div>
      <button
        type="submit"
        :disabled="!canSend || disabled"
        class="px-6 py-3 text-sm font-medium text-white transition-all rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:shadow-md"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-5 h-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
          />
        </svg>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean
  maxLength?: number
}>()

const emit = defineEmits<{
  (e: 'send', message: string): void
  (e: 'typing'): void
}>()

const message = ref('')
const inputRef = ref<HTMLTextAreaElement | null>(null)
const maxLength = props.maxLength || 1000

const characterCount = computed(() => message.value.length)

const canSend = computed(() => {
  return (
    message.value.trim().length > 0 && characterCount.value <= maxLength
  )
})

let typingTimeout: NodeJS.Timeout | null = null

const handleInput = () => {
  // Auto-resize textarea
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
    inputRef.value.style.height = inputRef.value.scrollHeight + 'px'
  }

  // Emit typing event with debounce
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
  typingTimeout = setTimeout(() => {
    emit('typing')
  }, 300)
}

const handleKeydown = (event: KeyboardEvent) => {
  // Send on Enter (without Shift)
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

const handleSend = () => {
  if (canSend.value) {
    emit('send', message.value.trim())
    message.value = ''

    // Reset textarea height
    if (inputRef.value) {
      inputRef.value.style.height = 'auto'
    }
  }
}

// Focus input on mount
onMounted(() => {
  inputRef.value?.focus()
})
</script>
