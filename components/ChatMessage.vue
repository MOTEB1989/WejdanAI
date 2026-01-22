<template>
  <div
    :class="[
      'flex mb-4',
      isSentByCurrentUser ? 'justify-end' : 'justify-start',
    ]"
  >
    <!-- Avatar for received messages -->
    <div
      v-if="!isSentByCurrentUser && message.user"
      class="flex-shrink-0 mr-3"
    >
      <img
        :src="message.user.image"
        :alt="message.user.name"
        class="w-10 h-10 rounded-full ring-1 ring-gray-900/5"
      />
    </div>

    <!-- Message bubble -->
    <div
      :class="[
        'max-w-xs md:max-w-md lg:max-w-lg',
        messageType === 'system' ? 'w-full' : '',
      ]"
    >
      <!-- User name for received messages -->
      <div
        v-if="!isSentByCurrentUser && message.user && messageType !== 'system'"
        class="mb-1 text-xs text-gray-600 dark:text-gray-400"
      >
        {{ message.user.name }}
      </div>

      <!-- Message content -->
      <div
        :class="[
          'px-4 py-2 rounded-lg shadow-sm transition-all duration-200',
          messageType === 'system'
            ? 'bg-gray-100/50 dark:bg-gray-800/50 text-center text-sm text-gray-600 dark:text-gray-400'
            : isSentByCurrentUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-white/70 dark:bg-white/10 backdrop-blur-lg ring-1 ring-gray-900/5 text-gray-900 dark:text-white rounded-bl-none',
          'hover:shadow-md',
        ]"
      >
        <p class="break-words whitespace-pre-wrap">{{ message.content }}</p>

        <!-- Timestamp and status -->
        <div
          v-if="messageType !== 'system'"
          :class="[
            'flex items-center justify-end mt-1 space-x-2 text-xs',
            isSentByCurrentUser
              ? 'text-blue-100'
              : 'text-gray-500 dark:text-gray-400',
          ]"
        >
          <span>{{ formattedTime }}</span>
          <span v-if="message.edited_at" class="italic">(edited)</span>
        </div>
      </div>
    </div>

    <!-- Avatar for sent messages -->
    <div
      v-if="isSentByCurrentUser && message.user"
      class="flex-shrink-0 ml-3"
    >
      <img
        :src="message.user.image"
        :alt="message.user.name"
        class="w-10 h-10 rounded-full ring-1 ring-gray-900/5"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ms from 'ms'
import type { Message } from '../types/chat'

interface Props {
  message: Message
  currentUserId?: number
}

const props = defineProps<Props>()

const isSentByCurrentUser = computed(() => {
  return props.message.user_id === props.currentUserId
})

const messageType = computed(() => {
  return props.message.message_type || 'text'
})

const formattedTime = computed(() => {
  if (!props.message.timestamp) return ''
  const timestamp = new Date(props.message.timestamp)
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()

  // If less than 24 hours, show relative time
  if (diff < 86400000) {
    return ms(diff, { long: false }) + ' ago'
  }

  // Otherwise show date and time
  return timestamp.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})
</script>
