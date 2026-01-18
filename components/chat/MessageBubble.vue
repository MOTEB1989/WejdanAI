<template>
  <div
    class="flex"
    :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
  >
    <div
      class="max-w-[80%] rounded-2xl px-6 py-4 shadow-md"
      :class="bubbleClasses"
    >
      <!-- Avatar & Header -->
      <div class="flex items-start space-x-3 rtl:space-x-reverse mb-2">
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          :class="message.role === 'user' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-purple-100 dark:bg-purple-900'"
        >
          <span class="text-lg">{{ message.role === 'user' ? '👤' : '🤖' }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-semibold" :class="textClasses">
              {{ message.role === 'user' ? 'أنت' : 'وجدان AI' }}
            </span>
            <span class="text-xs opacity-60" :class="textClasses">
              {{ formatTime(message.timestamp) }}
            </span>
          </div>

          <!-- Message Content -->
          <div
            class="prose prose-sm dark:prose-invert max-w-none"
            :class="[textClasses, { 'text-red-600 dark:text-red-400': message.isError }]"
            v-html="formattedContent"
          />
        </div>
      </div>

      <!-- Actions -->
      <div
        v-if="message.role === 'assistant' && !message.isError"
        class="flex items-center justify-end space-x-2 rtl:space-x-reverse mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
      >
        <button
          @click="$emit('copy', message.content)"
          class="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
          title="نسخ"
        >
          📋
        </button>
        <button
          @click="$emit('regenerate', message.id)"
          class="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
          title="إعادة توليد"
        >
          🔄
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Message } from '~/types/chat'
import { marked } from 'marked'

interface Props {
  message: Message
}

const props = defineProps<Props>()
const emit = defineEmits<{
  copy: [content: string]
  regenerate: [id: string]
}>()

const bubbleClasses = computed(() => {
  if (props.message.role === 'user') {
    return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
  } else if (props.message.isError) {
    return 'bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700'
  } else {
    return 'bg-gray-100 dark:bg-gray-700'
  }
})

const textClasses = computed(() => {
  return props.message.role === 'user'
    ? 'text-white'
    : 'text-gray-900 dark:text-gray-100'
})

const formattedContent = computed(() => {
  try {
    // Configure marked for code highlighting
    marked.setOptions({
      breaks: true,
      gfm: true,
    })

    return marked.parse(props.message.content)
  } catch (error) {
    return props.message.content
  }
})

const formatTime = (timestamp: Date) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)

  if (diffInMinutes < 1) return 'الآن'
  if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`
  if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`

  return date.toLocaleString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short'
  })
}
</script>

<style scoped>
/* Custom scrollbar for code blocks */
:deep(pre) {
  @apply bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto my-3;
}

:deep(code) {
  @apply text-sm font-mono;
}

:deep(p) {
  @apply mb-2;
}

:deep(ul), :deep(ol) {
  @apply mr-6 mb-2;
}

:deep(a) {
  @apply text-blue-600 dark:text-blue-400 underline;
}
</style>
