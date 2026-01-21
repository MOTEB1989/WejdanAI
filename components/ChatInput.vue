<template>
  <div class="border-t border-slate-700 bg-slate-900/80 backdrop-blur-sm">
    <div class="max-w-4xl mx-auto p-4">
      <div class="flex gap-3 items-end">
        <!-- Textarea Input -->
        <div class="flex-1 relative">
          <textarea
            ref="textareaRef"
            v-model="inputMessage"
            :disabled="loading"
            :placeholder="loading ? 'جاري الكتابة...' : 'اكتب رسالتك هنا...'"
            class="w-full rounded-2xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-400 px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            :class="{ 'text-right': isRTL }"
            rows="1"
            @keydown.enter.exact.prevent="handleSubmit"
            @input="adjustHeight"
          />
          
          <!-- Character count (optional) -->
          <div 
            v-if="inputMessage.length > 0"
            class="absolute left-3 bottom-3 text-xs text-slate-500"
          >
            {{ inputMessage.length }}
          </div>
        </div>

        <!-- Send Button -->
        <button
          @click="handleSubmit"
          :disabled="!canSend"
          class="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
        >
          <svg
            v-if="!loading"
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
          <svg
            v-else
            class="w-5 h-5 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </button>
      </div>

      <!-- Typing Indicator -->
      <div v-if="loading" class="mt-2 flex items-center gap-2 text-sm text-slate-400">
        <div class="flex gap-1">
          <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
          <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
          <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
        </div>
        <span>{{ typingText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'

interface Props {
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  (e: 'send', message: string): void
}>()

const inputMessage = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// Check if text is RTL (contains Arabic characters)
const isRTL = computed(() => {
  const arabicRegex = /[\u0600-\u06FF]/
  return arabicRegex.test(inputMessage.value)
})

// Can send message
const canSend = computed(() => {
  return inputMessage.value.trim().length > 0 && !props.loading
})

// Random typing text
const typingText = computed(() => {
  const texts = [
    'Wejdan تفكر...',
    'جاري معالجة الطلب...',
    'تحليل السؤال...',
    'إنشاء الإجابة...'
  ]
  return texts[Math.floor(Math.random() * texts.length)]
})

// Auto-resize textarea
const adjustHeight = () => {
  if (!textareaRef.value) return
  
  textareaRef.value.style.height = 'auto'
  const newHeight = Math.min(textareaRef.value.scrollHeight, 200)
  textareaRef.value.style.height = `${newHeight}px`
}

// Handle submit
const handleSubmit = () => {
  if (!canSend.value) return
  
  const message = inputMessage.value.trim()
  if (message) {
    emit('send', message)
    inputMessage.value = ''
    
    // Reset textarea height
    nextTick(() => {
      if (textareaRef.value) {
        textareaRef.value.style.height = 'auto'
      }
    })
  }
}

// Focus on input when component mounts
watch(() => props.loading, (newVal) => {
  if (!newVal) {
    nextTick(() => {
      textareaRef.value?.focus()
    })
  }
})
</script>

<style scoped>
textarea {
  max-height: 200px;
  line-height: 1.5;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
