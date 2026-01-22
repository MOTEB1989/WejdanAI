<template>
  <div
    :class="[
      'flex mb-4 animate-fade-in',
      isOwnMessage ? 'justify-end' : 'justify-start',
    ]"
  >
    <!-- Avatar for received messages (left side) -->
    <img
      v-if="!isOwnMessage && message.user_image"
      :src="message.user_image"
      :alt="message.user_name"
      class="w-8 h-8 mr-2 rounded-full ring-1 ring-gray-900/5"
    />

    <div
      :class="[
        'max-w-[70%] flex flex-col',
        isOwnMessage ? 'items-end' : 'items-start',
      ]"
    >
      <!-- User name for received messages -->
      <span
        v-if="!isOwnMessage"
        class="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400"
      >
        {{ message.user_name }}
      </span>

      <!-- Message bubble -->
      <div
        :class="[
          'px-4 py-2 rounded-2xl shadow-md',
          isOwnMessage
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm'
            : 'bg-white/50 dark:bg-white/10 backdrop-blur-lg ring-1 ring-gray-900/5 text-gray-900 dark:text-white rounded-bl-sm',
        ]"
      >
        <p class="text-sm leading-relaxed break-words">{{ message.content }}</p>
      </div>

      <!-- Timestamp -->
      <span class="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {{ formatTime(message.created_at) }}
      </span>
    </div>

    <!-- Avatar for sent messages (right side) -->
    <img
      v-if="isOwnMessage && message.user_image"
      :src="message.user_image"
      :alt="message.user_name"
      class="w-8 h-8 ml-2 rounded-full ring-1 ring-gray-900/5"
    />
  </div>
</template>

<script setup lang="ts">
import ms from 'ms'

interface Message {
  id: number
  user_id: number
  user_name: string
  user_image?: string
  content: string
  type: string
  created_at: string
}

const props = defineProps<{
  message: Message
  currentUserId: number
}>()

const isOwnMessage = computed(() => props.message.user_id === props.currentUserId)

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = Date.now()
  const diff = now - date.getTime()

  // If less than 24 hours, show relative time
  if (diff < 24 * 60 * 60 * 1000) {
    return ms(diff) + ' ago'
  }

  // Otherwise show formatted date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
