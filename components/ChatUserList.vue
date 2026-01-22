<template>
  <div class="h-full bg-white/30 dark:bg-white/10 backdrop-blur-lg ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
    <div class="p-4 border-b border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Online Users
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ users.length }} {{ users.length === 1 ? 'user' : 'users' }} online
      </p>
    </div>

    <div class="overflow-y-auto" style="max-height: calc(100vh - 200px)">
      <div
        v-for="user in users"
        :key="user.id"
        class="flex items-center gap-3 p-3 hover:bg-white/20 dark:hover:bg-white/5 transition-colors cursor-pointer border-b border-gray-100 dark:border-gray-800"
      >
        <!-- User Avatar -->
        <div class="relative">
          <img
            v-if="user.image"
            :src="user.image"
            :alt="user.name"
            class="w-10 h-10 rounded-full ring-1 ring-gray-900/5"
          />
          <div
            v-else
            class="w-10 h-10 rounded-full ring-1 ring-gray-900/5 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold"
          >
            {{ user.name?.charAt(0).toUpperCase() }}
          </div>

          <!-- Online Status Indicator -->
          <div
            :class="[
              'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900',
              user.isOnline ? 'bg-green-500' : 'bg-gray-400'
            ]"
          />
        </div>

        <!-- User Info -->
        <div class="flex-1 min-w-0">
          <p class="font-medium text-gray-900 dark:text-white truncate">
            {{ user.name }}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
            {{ user.email }}
          </p>
        </div>

        <!-- Typing Indicator -->
        <div v-if="user.isTyping" class="flex items-center gap-1">
          <div class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0ms" />
          <div class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 150ms" />
          <div class="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 300ms" />
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="users.length === 0"
        class="flex flex-col items-center justify-center p-8 text-center"
      >
        <svg
          class="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p class="text-gray-500 dark:text-gray-400">No users online</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface User {
  id: number
  name: string
  email: string
  image?: string
  isOnline?: boolean
  isTyping?: boolean
}

interface Props {
  users: User[]
}

defineProps<Props>()
</script>
