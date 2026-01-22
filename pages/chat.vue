<template>
  <div class="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <!-- Navigation Header -->
    <header class="p-4 bg-white/30 dark:bg-white/10 backdrop-blur-lg border-b border-gray-900/5">
      <div class="container flex items-center justify-between mx-auto">
        <div class="flex items-center space-x-4">
          <NuxtLink
            to="/"
            class="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            ← Back to Home
          </NuxtLink>
        </div>
        <h1
          class="text-2xl font-bold bg-gradient-to-br dark:from-white from-black via-[#707070] to-[#ffffff] bg-clip-text text-transparent"
        >
          WejdanAI Chat
        </h1>
        <div class="w-24"></div> <!-- Spacer for centering -->
      </div>
    </header>

    <!-- Main Chat Container -->
    <main class="flex-1 container mx-auto p-4 overflow-hidden">
      <div class="h-full max-w-5xl mx-auto">
        <Chat v-if="currentUser" :current-user="currentUser" />
        <div
          v-else
          class="flex items-center justify-center h-full"
        >
          <div class="text-center p-8 bg-white/30 dark:bg-white/10 backdrop-blur-lg rounded-lg shadow-xl ring-1 ring-gray-900/5">
            <div class="w-12 h-12 mx-auto mb-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-lg font-medium text-gray-600 dark:text-gray-300">
              Loading...
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
interface User {
  id: number
  name: string
  email: string
  image?: string
}

const currentUser = ref<User | null>(null)

// Load current user (using first user from profiles for demo)
onMounted(async () => {
  try {
    const response = await $fetch<{ users: User[] }>('/api/chat-users')
    if (response.users && response.users.length > 0) {
      // For demo purposes, use the first user
      // In a real app, this would come from authentication
      currentUser.value = response.users[0]
    }
  } catch (error) {
    console.error('Failed to load user:', error)
  }
})

// Set page title
useHead({
  title: 'Chat - WejdanAI',
})
</script>
