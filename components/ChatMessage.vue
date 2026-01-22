<template>
  <div
    :class="[
      'flex items-end gap-2 mb-4',
      isCurrentUser ? 'flex-row-reverse' : 'flex-row'
    ]"
  >
    <!-- User Avatar -->
    <img
      v-if="message.user_image"
      :src="message.user_image"
      :alt="message.user_name"
      class="w-8 h-8 rounded-full ring-1 ring-gray-900/5 flex-shrink-0"
    />
    <div
      v-else
      class="w-8 h-8 rounded-full ring-1 ring-gray-900/5 flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold"
    >
      {{ message.user_name?.charAt(0).toUpperCase() }}
    </div>

    <!-- Message Bubble -->
    <div
      :class="[
        'max-w-[70%] px-4 py-2 rounded-2xl shadow-sm',
        isCurrentUser
          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
          : 'bg-white/60 dark:bg-white/10 text-gray-900 dark:text-white rounded-bl-md ring-1 ring-gray-900/5 backdrop-blur-lg'
      ]"
    >
      <!-- User Name (only for received messages) -->
      <p
        v-if="!isCurrentUser"
        class="text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300"
      >
        {{ message.user_name }}
      </p>

      <!-- Message Content -->
      <p class="text-sm leading-relaxed break-words">
        {{ message.content }}
      </p>

      <!-- Timestamp -->
      <p
        :class="[
          'text-xs mt-1',
          isCurrentUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
        ]"
      >
        {{ timeAgo(message.created_at) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import ms from 'ms'

interface Message {
  id: number
  user_id: number
  user_name: string
  user_email: string
  user_image?: string
  content: string
  created_at: string
  message_type: string
}

interface Props {
  message: Message
  currentUserId?: number
}

const props = defineProps<Props>()

const isCurrentUser = computed(() => {
  return props.currentUserId === props.message.user_id
})

const timeAgo = (timestamp: string) => {
  if (!timestamp) return 'now'
  const diff = Date.now() - new Date(timestamp).getTime()
  if (diff < 60000) return 'just now'
  return `${ms(diff)} ago`
}
</script>
