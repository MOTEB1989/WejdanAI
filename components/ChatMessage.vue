<template>
  <div class="flex" :class="isOwnMessage ? 'justify-end' : 'justify-start'">
    <div class="flex max-w-[70%]" :class="isOwnMessage ? 'flex-row-reverse' : 'flex-row'">
      <!-- User Avatar -->
      <div class="flex-shrink-0" :class="isOwnMessage ? 'ml-3' : 'mr-3'">
        <img
          :src="message.image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(displayName)"
          :alt="displayName"
          class="w-8 h-8 rounded-full ring-1 ring-gray-900/5 dark:ring-white/10"
        />
      </div>
      
      <!-- Message Bubble -->
      <div class="flex flex-col" :class="isOwnMessage ? 'items-end' : 'items-start'">
        <div class="flex items-center mb-1 space-x-2">
          <span class="text-xs font-medium text-gray-700 dark:text-gray-300">
            {{ displayName }}
          </span>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ formatTime(message.created_at || message.timestamp) }}
          </span>
        </div>
        
        <div
          class="px-4 py-2 rounded-2xl break-words"
          :class="
            isOwnMessage
              ? 'bg-blue-500 text-white rounded-tr-sm'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-sm'
          "
        >
          <p class="text-sm whitespace-pre-wrap">{{ message.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ms from 'ms'

interface Message {
  id: number
  content: string
  name?: string
  userName?: string
  email?: string
  image?: string
  created_at?: string
  timestamp?: string
  clientId?: string
}

const props = defineProps<{
  message: Message
  isOwnMessage: boolean
}>()

const displayName = computed(() => {
  return props.message.name || props.message.userName || 'Anonymous'
})

const formatTime = (timestamp?: string) => {
  if (!timestamp) return 'just now'
  
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  // If less than 1 minute, show "just now"
  if (diff < 60000) return 'just now'
  
  // If less than 24 hours, show relative time
  if (diff < 86400000) {
    return ms(diff, { long: false }) + ' ago'
  }
  
  // Otherwise show time
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}
</script>
