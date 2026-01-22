<template>
  <main
    class="relative flex flex-col items-center justify-center min-h-screen py-6 px-4"
  >
    <!-- Header -->
    <div class="w-full max-w-7xl mb-6">
      <div class="flex items-center justify-between mb-4">
        <h1
          class="bg-gradient-to-br dark:from-white from-black via-[#707070] to-[#ffffff] bg-clip-text text-4xl font-medium tracking-tight text-transparent"
        >
          WejdanAI Chat
        </h1>
        <a
          href="/"
          class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all rounded-full shadow-sm bg-white/30 dark:bg-white/80 ring-1 ring-gray-900/5 hover:shadow-lg active:shadow-sm"
        >
          ← Back to Home
        </a>
      </div>
      <p class="text-gray-600 dark:text-gray-300">
        Real-time messaging powered by WebSocket
      </p>
    </div>

    <!-- Loading state -->
    <div
      v-if="pending"
      class="flex items-center justify-center w-full max-w-7xl h-96"
    >
      <div
        class="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"
      ></div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="w-full max-w-7xl p-12 mx-auto rounded-lg shadow-xl bg-white/30 dark:bg-white/10 backdrop-blur-lg ring-1 ring-gray-900/5"
    >
      <div class="text-center">
        <h2 class="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
          Error Loading Chat
        </h2>
        <p class="mb-6 text-gray-600 dark:text-gray-400">
          {{ error.message || 'Failed to load user data' }}
        </p>
        <button
          @click="refresh"
          class="px-6 py-3 text-sm font-medium text-white bg-blue-500 rounded-lg shadow-sm hover:bg-blue-600 hover:shadow-md active:shadow-sm"
        >
          Retry
        </button>
      </div>
    </div>

    <!-- Chat component -->
    <div
      v-else-if="currentUser"
      class="w-full h-[calc(100vh-180px)]"
    >
      <Chat :current-user="currentUser" title="WejdanAI Chat Room" />
    </div>

    <!-- User info (for demo/debugging) -->
    <div
      v-if="currentUser && !pending"
      class="w-full max-w-7xl mt-4 px-4 py-3 rounded-lg bg-white/30 dark:bg-white/10 backdrop-blur-lg ring-1 ring-gray-900/5"
    >
      <div class="flex items-center space-x-3">
        <img
          :src="currentUser.image"
          :alt="currentUser.name"
          class="w-10 h-10 rounded-full ring-1 ring-gray-900/5"
        />
        <div>
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            Logged in as {{ currentUser.name }}
          </p>
          <p class="text-xs text-gray-600 dark:text-gray-400">
            {{ currentUser.email }}
          </p>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-6 text-center">
      <a
        href="https://github.com/Wejdan-AI/LexNexus"
        class="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
      >
        <img src="/github.svg" alt="GitHub" class="h-5 dark:invert" />
        <span class="text-sm">View Source</span>
      </a>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '../types/chat'
import Chat from '../components/Chat.vue'

// Fetch current user (using the first user from the profiles table for demo)
const { data, pending, error, refresh } = await useFetch<{
  users: User[]
  duration: number
}>('/api/get-users')

// For demo purposes, use the first user as current user
// In a real app, this would come from authentication
const currentUser = computed(() => {
  if (data.value && data.value.users && data.value.users.length > 0) {
    return data.value.users[0]
  }
  return null
})
</script>
