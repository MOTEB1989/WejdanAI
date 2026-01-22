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
        Real-time messaging powered by WebSocket (Demo Mode)
      </p>
    </div>

    <!-- Chat component with demo user -->
    <div class="w-full h-[calc(100vh-180px)]">
      <Chat :current-user="demoUser" title="WejdanAI Chat Room" />
    </div>

    <!-- User info (for demo/debugging) -->
    <div
      class="w-full max-w-7xl mt-4 px-4 py-3 rounded-lg bg-white/30 dark:bg-white/10 backdrop-blur-lg ring-1 ring-gray-900/5"
    >
      <div class="flex items-center space-x-3">
        <img
          :src="demoUser.image"
          :alt="demoUser.name"
          class="w-10 h-10 rounded-full ring-1 ring-gray-900/5"
        />
        <div>
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            Logged in as {{ demoUser.name }}
          </p>
          <p class="text-xs text-gray-600 dark:text-gray-400">
            {{ demoUser.email }}
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
import { ref } from 'vue'
import type { User } from '../types/chat'
import Chat from '../components/Chat.vue'

// Demo user (for development/demo purposes)
const demoUser = ref<User>({
  id: 1,
  name: 'Demo User',
  email: 'demo@wejdanai.com',
  image: 'https://images.ctfassets.net/e5382hct74si/2P1iOve0LZJRZWUzfXpi9r/9d4d27765764fb1ad7379d7cbe5f1043/ucxb4lHy_400x400.jpg',
  createdAt: new Date().toISOString(),
})
</script>
