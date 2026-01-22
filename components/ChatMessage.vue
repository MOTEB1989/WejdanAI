<template>
  <div
    :class="[
      'flex gap-3 mb-4 animate-fadeIn',
      isOwnMessage ? 'flex-row-reverse' : 'flex-row'
    ]"
  >
    <!-- Avatar -->
    <div class="flex-shrink-0">
      <img
        :src="message.sender_image || defaultAvatar"
        :alt="message.sender_name"
        class="w-10 h-10 rounded-full ring-2 ring-white/20"
      />
    </div>

    <!-- Message Bubble -->
    <div :class="['flex flex-col', isOwnMessage ? 'items-end' : 'items-start']">
      <div class="flex items-center gap-2 mb-1">
        <span
          :class="[
            'text-sm font-medium',
            isOwnMessage ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
          ]"
        >
          {{ message.sender_name }}
        </span>
        <span class="text-xs text-gray-500">
          {{ formatTime(message.timestamp) }}
        </span>
      </div>

      <div
        :class="[
          'px-4 py-2 rounded-2xl max-w-xs md:max-w-md break-words',
          isOwnMessage
            ? 'bg-blue-500 text-white rounded-tr-sm'
            : 'bg-white/30 dark:bg-white/10 backdrop-blur-lg text-gray-900 dark:text-white rounded-tl-sm ring-1 ring-gray-900/5'
        ]"
      >
        <p class="text-sm">{{ message.message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ms from 'ms'

interface Message {
  id: number
  user_id?: number
  message: string
  timestamp: string
  sender_name: string
  sender_image?: string
}

const props = defineProps<{
  message: Message
  currentUserId?: number
}>()

const defaultAvatar = 'https://ui-avatars.com/api/?background=random&name='

const isOwnMessage = computed(() => {
  return props.message.sender_name === props.currentUserId?.toString() || 
         props.message.user_id === props.currentUserId
})

const formatTime = (timestamp: string) => {
  if (!timestamp) return ''
  const diff = Date.now() - new Date(timestamp).getTime()
  return ms(diff, { long: false })
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
</style>
