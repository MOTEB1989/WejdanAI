<template>
  <div
    :class="[
      'flex gap-3 mb-3',
      isOwnMessage ? 'justify-end' : 'justify-start'
    ]"
  >
    <!-- Avatar for received messages -->
    <img
      v-if="!isOwnMessage && message.user?.image"
      :src="message.user.image"
      :alt="message.user.name"
      class="w-8 h-8 rounded-full ring-1 ring-gray-900/5 flex-shrink-0"
    />
    
    <!-- Message bubble -->
    <div :class="['flex flex-col', isOwnMessage ? 'items-end' : 'items-start', 'max-w-[70%]']">
      <!-- User name for received messages -->
      <span v-if="!isOwnMessage && message.user?.name" class="text-xs text-gray-500 mb-1 px-2">
        {{ message.user.name }}
      </span>
      
      <!-- Message content -->
      <div
        :class="[
          'px-4 py-2 rounded-2xl backdrop-blur-lg ring-1',
          isOwnMessage
            ? 'bg-blue-500/90 text-white ring-blue-600/20'
            : 'bg-white/30 dark:bg-white/10 ring-gray-900/5'
        ]"
      >
        <p class="text-sm break-words">{{ message.content }}</p>
      </div>
      
      <!-- Timestamp and status -->
      <div class="flex items-center gap-2 mt-1 px-2">
        <span class="text-xs text-gray-500">
          {{ formatTime(message.createdAt) }}
        </span>
        <span v-if="isOwnMessage && message.isRead" class="text-xs text-blue-500">
          Read
        </span>
      </div>
    </div>

    <!-- Avatar for sent messages -->
    <img
      v-if="isOwnMessage && message.user?.image"
      :src="message.user.image"
      :alt="message.user.name"
      class="w-8 h-8 rounded-full ring-1 ring-gray-900/5 flex-shrink-0"
    />
  </div>
</template>

<script setup lang="ts">
import ms from 'ms'
import type { Message } from '~/types/chat'

const props = defineProps<{
  message: Message
  currentUserId?: number
}>()

const isOwnMessage = computed(() => {
  return props.message.userId === props.currentUserId
})

const formatTime = (timestamp: Date) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  
  // If less than 24 hours, show relative time
  if (diffMs < 24 * 60 * 60 * 1000) {
    return ms(diffMs) + ' ago'
  }
  
  // Otherwise show time
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>
