<template>
  <div
    :class="[
      'flex mb-4',
      isOwnMessage ? 'justify-end' : 'justify-start'
    ]"
  >
    <div
      :class="[
        'flex items-end space-x-2 max-w-[70%]',
        isOwnMessage ? 'flex-row-reverse space-x-reverse' : 'flex-row'
      ]"
    >
      <!-- User Avatar -->
      <img
        v-if="message.userImage"
        :src="message.userImage"
        :alt="message.userName"
        class="w-8 h-8 rounded-full ring-1 ring-gray-900/5 flex-shrink-0"
      />
      <div
        v-else
        class="w-8 h-8 rounded-full ring-1 ring-gray-900/5 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0"
      >
        <span class="text-white text-xs font-medium">
          {{ getInitials(message.userName) }}
        </span>
      </div>

      <!-- Message Bubble -->
      <div class="flex flex-col" :class="isOwnMessage ? 'items-end' : 'items-start'">
        <div
          :class="[
            'rounded-2xl px-4 py-2 shadow-sm',
            isOwnMessage
              ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-sm'
              : 'bg-white/30 dark:bg-white/10 backdrop-blur-lg ring-1 ring-gray-900/5 dark:text-white text-gray-900 rounded-bl-sm'
          ]"
        >
          <p v-if="!isOwnMessage" class="text-xs font-medium mb-1 opacity-70">
            {{ message.userName }}
          </p>
          <p class="text-sm break-words whitespace-pre-wrap">
            {{ message.content }}
          </p>
        </div>
        
        <!-- Timestamp -->
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
          {{ formatTimestamp(message.timestamp || message.createdAt) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ms from 'ms'
import type { Message } from '~/composables/useWebSocket'

interface Props {
  message: Message
  currentUserId: number
}

const props = defineProps<Props>()

const isOwnMessage = computed(() => {
  return props.message.userId === props.currentUserId
})

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatTimestamp = (timestamp?: string) => {
  if (!timestamp) return 'just now'
  const date = new Date(timestamp)
  const now = Date.now()
  const diff = now - date.getTime()
  
  // If less than 1 minute, show "just now"
  if (diff < 60000) {
    return 'just now'
  }
  
  // If less than 1 hour, show minutes ago
  if (diff < 3600000) {
    return `${ms(diff)} ago`
  }
  
  // If today, show time
  const today = new Date()
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }
  
  // Otherwise show date and time
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}
</script>
