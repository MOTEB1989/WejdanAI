<template>
  <main class="relative flex items-center justify-center min-h-screen py-10 px-4">
    <!-- Background -->
    <div class="absolute inset-0 -z-10">
      <div class="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900" />
    </div>

    <!-- Main Container -->
    <div class="w-full max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1
          class="pb-4 bg-gradient-to-br dark:from-white from-black via-[#707070] to-[#9f9f9f] bg-clip-text text-4xl font-medium tracking-tight text-transparent md:text-6xl"
        >
          WejdanAI Chat
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          Real-time messaging for your team
        </p>
      </div>

      <!-- Layout Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-250px)] min-h-[600px]">
        <!-- User List Sidebar (Desktop only) -->
        <div class="hidden lg:block">
          <ChatUserList :users="onlineUsers" />
        </div>

        <!-- Chat Area -->
        <div class="lg:col-span-3">
          <Chat :current-user="currentUser" />
        </div>
      </div>

      <!-- Navigation Links -->
      <div class="flex items-center justify-center gap-6 mt-8">
        <NuxtLink
          to="/"
          class="px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 transition-all rounded-full shadow-sm bg-white/30 dark:bg-white/10 ring-1 ring-gray-900/5 hover:shadow-lg hover:bg-white/50 dark:hover:bg-white/20"
        >
          ← Back to Home
        </NuxtLink>
        <a
          href="https://github.com/Wejdan-AI/LexNexus"
          target="_blank"
          class="flex items-center gap-2 px-6 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 transition-all rounded-full shadow-sm bg-white/30 dark:bg-white/10 ring-1 ring-gray-900/5 hover:shadow-lg hover:bg-white/50 dark:hover:bg-white/20"
        >
          <img src="/github.svg" alt="GitHub" class="h-4 dark:invert" />
          Source
        </a>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface User {
  id: number
  name: string
  email: string
  image?: string
  createdAt?: string
  isOnline?: boolean
  isTyping?: boolean
}

const currentUser = ref<User | undefined>()
const onlineUsers = ref<User[]>([])

onMounted(async () => {
  // Fetch users from API
  try {
    const response = await $fetch('/api/get-users')
    const users = response.users || []
    
    // For demo purposes, set first user as current user
    if (users.length > 0) {
      currentUser.value = {
        ...users[0],
        isOnline: true,
      }
      
      // Set all users as online
      onlineUsers.value = users.map((user: User, index: number) => ({
        ...user,
        isOnline: true,
        isTyping: false,
      }))
    }
  } catch (error) {
    console.error('Failed to load users:', error)
  }
})
</script>
