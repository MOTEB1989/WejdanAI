<template>
  <div class="flex items-center space-x-2">
    <div class="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700">
      <div class="flex space-x-1">
        <div class="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
        <div class="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
        <div class="w-1.5 h-1.5 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
      </div>
    </div>
    <span class="text-xs text-gray-500 dark:text-gray-400 italic">
      {{ typingText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  users: string[]
}>()

const typingText = computed(() => {
  const count = props.users.length
  if (count === 0) return ''
  if (count === 1) return `${props.users[0]} is typing...`
  if (count === 2) return `${props.users[0]} and ${props.users[1]} are typing...`
  return `${props.users[0]} and ${count - 1} others are typing...`
})
</script>
