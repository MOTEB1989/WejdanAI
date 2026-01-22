<template>
  <div 
    :class="[
      'flex gap-3',
      isOwn ? 'flex-row-reverse' : 'flex-row'
    ]"
  >
    <!-- Avatar -->
    <img
      :src="message.user_image || 'https://via.placeholder.com/40'"
      :alt="message.user_name"
      class="w-10 h-10 rounded-full ring-1 ring-gray-900/5 flex-shrink-0"
    />
    
    <!-- Message Content -->
    <div 
      :class="[
        'flex flex-col max-w-md',
        isOwn ? 'items-end' : 'items-start'
      ]"
    >
      <!-- User Name -->
      <span 
        v-if="!isOwn"
        class="text-xs text-gray-500 dark:text-gray-400 mb-1 px-1"
      >
        {{ message.user_name }}
      </span>
      
      <!-- Message Bubble -->
      <div
        :class="[
          'rounded-2xl px-4 py-2 shadow-sm break-words',
          isOwn 
            ? 'bg-blue-500 text-white rounded-br-md' 
            : 'bg-white/60 dark:bg-white/10 backdrop-blur-lg ring-1 ring-gray-900/5 rounded-bl-md'
        ]"
      >
        <p class="text-sm">{{ message.content }}</p>
      </div>
      
      <!-- Timestamp -->
      <span class="text-xs text-gray-400 mt-1 px-1">
        {{ formatTime(message.created_at) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import ms from 'ms'

interface Message {
  id: number
  user_id?: number
  user_name: string
  user_image?: string
  content: string
  created_at: string
  message_type?: string
}

interface Props {
  message: Message
  isOwn: boolean
}

defineProps<Props>()

const formatTime = (timestamp: string) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = Date.now()
  const diff = now - date.getTime()
  
  // If less than 1 minute, show "just now"
  if (diff < 60000) {
    return 'just now'
  }
  
  // If less than 24 hours, show time ago
  if (diff < 86400000) {
    return ms(diff) + ' ago'
  }
  
  // Otherwise show formatted date
  return date.toLocaleString()
}
</script>
