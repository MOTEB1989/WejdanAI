<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <h2 class="text-lg font-bold text-gray-900 dark:text-white">
        المحادثات السابقة
      </h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {{ conversations.length }} محادثة
      </p>
    </div>

    <!-- Conversations List -->
    <div class="flex-1 overflow-y-auto p-2 space-y-2">
      <div
        v-for="conversation in sortedConversations"
        :key="conversation.id"
        @click="$emit('select', conversation)"
        class="group relative p-4 rounded-lg cursor-pointer transition-all"
        :class="conversation.id === currentId
          ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
          : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-2 border-transparent'
        "
      >
        <!-- Conversation Info -->
        <div class="flex items-start justify-between mb-2">
          <h3
            class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 flex-1"
          >
            {{ conversation.title }}
          </h3>

          <!-- Delete Button -->
          <button
            @click.stop="confirmDelete(conversation.id)"
            class="opacity-0 group-hover:opacity-100 ml-2 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-opacity"
          >
            🗑️
          </button>
        </div>

        <div class="flex items-center justify-between text-xs">
          <span class="text-gray-500 dark:text-gray-400">
            {{ conversation.messages.length }} رسالة
          </span>
          <span class="text-gray-400 dark:text-gray-500">
            {{ formatDate(conversation.timestamp) }}
          </span>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="conversations.length === 0"
        class="text-center py-12 text-gray-500 dark:text-gray-400"
      >
        <div class="text-6xl mb-4">💬</div>
        <p class="text-sm">لا توجد محادثات سابقة</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Conversation } from '~/types/chat'

interface Props {
  conversations: Conversation[]
  currentId: string | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [conversation: Conversation]
  delete: [id: string]
}>()

const sortedConversations = computed(() => {
  return [...props.conversations].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })
})

const formatDate = (timestamp: Date) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) return 'اليوم'
  if (diffInDays === 1) return 'أمس'
  if (diffInDays < 7) return `منذ ${diffInDays} أيام`

  return date.toLocaleDateString('ar-SA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const confirmDelete = (id: string) => {
  if (confirm('هل أنت متأكد من حذف هذه المحادثة؟')) {
    emit('delete', id)
  }
}
</script>
