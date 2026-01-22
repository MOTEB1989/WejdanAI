<template>
  <div
    class="p-4 border-t bg-white/30 dark:bg-white/10 backdrop-blur-lg border-gray-900/5"
  >
    <!-- Typing indicator -->
    <div
      v-if="typingUsers.length > 0"
      class="mb-2 text-sm text-gray-600 dark:text-gray-400"
    >
      <span class="italic">
        {{ typingUsersText }}
      </span>
    </div>

    <!-- Input form -->
    <form @submit.prevent="handleSubmit" class="flex space-x-2">
      <div class="relative flex-1">
        <textarea
          v-model="messageText"
          @input="handleInput"
          @keydown="handleKeyDown"
          :placeholder="placeholder"
          :disabled="disabled"
          class="w-full px-4 py-3 pr-12 text-sm transition-all duration-200 border rounded-lg resize-none bg-white/70 dark:bg-gray-800/50 border-gray-900/5 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          :class="[
            maxLength && messageText.length > maxLength
              ? 'border-red-500'
              : '',
          ]"
          rows="1"
          style="max-height: 120px; min-height: 44px"
          ref="textareaRef"
        ></textarea>

        <!-- Character count -->
        <div
          v-if="maxLength"
          class="absolute text-xs text-gray-500 bottom-2 right-12"
          :class="[
            messageText.length > maxLength ? 'text-red-500' : '',
          ]"
        >
          {{ messageText.length }}/{{ maxLength }}
        </div>
      </div>

      <!-- Send button -->
      <button
        type="submit"
        :disabled="!canSend"
        class="px-6 py-3 text-sm font-medium text-white transition-all duration-200 bg-blue-500 rounded-lg shadow-sm hover:bg-blue-600 hover:shadow-md active:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500"
      >
        <svg
          v-if="!sending"
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
          />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { TypingIndicator } from '../types/chat'

interface Props {
  typingUsers?: TypingIndicator[]
  placeholder?: string
  maxLength?: number
  disabled?: boolean
}

interface Emits {
  (e: 'send', message: string): void
  (e: 'typing', isTyping: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  typingUsers: () => [],
  placeholder: 'Type a message...',
  maxLength: 2000,
  disabled: false,
})

const emit = defineEmits<Emits>()

const messageText = ref('')
const sending = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
let typingTimeout: NodeJS.Timeout | null = null

const canSend = computed(() => {
  return (
    messageText.value.trim().length > 0 &&
    (!props.maxLength || messageText.value.length <= props.maxLength) &&
    !sending.value &&
    !props.disabled
  )
})

const typingUsersText = computed(() => {
  const names = props.typingUsers.map((u) => u.userName)
  if (names.length === 0) return ''
  if (names.length === 1) return `${names[0]} is typing...`
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`
  return `${names[0]} and ${names.length - 1} others are typing...`
})

const handleInput = () => {
  // Auto-resize textarea
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = `${Math.min(textareaRef.value.scrollHeight, 120)}px`
  }

  // Emit typing indicator (debounced)
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }

  if (messageText.value.trim().length > 0) {
    emit('typing', true)

    typingTimeout = setTimeout(() => {
      emit('typing', false)
    }, 2000)
  } else {
    emit('typing', false)
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  // Send message on Enter (without Shift)
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSubmit()
  }
}

const handleSubmit = async () => {
  if (!canSend.value) return

  const message = messageText.value.trim()
  if (!message) return

  sending.value = true
  emit('typing', false)

  try {
    emit('send', message)
    messageText.value = ''

    // Reset textarea height
    await nextTick()
    if (textareaRef.value) {
      textareaRef.value.style.height = '44px'
    }
  } catch (error) {
    console.error('Failed to send message:', error)
  } finally {
    sending.value = false
  }
}

// Watch for disabled state changes
watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) {
      emit('typing', false)
    }
  }
)
</script>
