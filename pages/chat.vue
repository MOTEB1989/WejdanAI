<template>
  <main class="relative flex flex-col items-center justify-center min-h-screen py-10 px-4">
    <!-- Header -->
    <div class="w-full max-w-4xl mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-3xl font-bold bg-gradient-to-br dark:from-white from-black via-[#707070] to-[#ffffff] bg-clip-text text-transparent">
            WejdanAI Chat
          </h1>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Real-time messaging powered by WebSockets
          </p>
        </div>
        <NuxtLink
          to="/"
          class="px-4 py-2 text-sm font-medium text-gray-600 transition-all rounded-full shadow-sm bg-white/30 dark:bg-white/80 ring-1 ring-gray-900/5 dark:text-black hover:shadow-lg active:shadow-sm"
        >
          ← Back to Home
        </NuxtLink>
      </div>
    </div>

    <!-- Chat Component -->
    <div class="w-full max-w-4xl">
      <Chat v-if="currentUser" :current-user="currentUser" />
      
      <div v-else class="text-center py-12">
        <svg class="animate-spin h-12 w-12 mx-auto text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Loading user data...</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="w-full max-w-4xl mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
      <p>Built with Nuxt 3, Tailwind CSS, and WebSockets</p>
    </div>
  </main>
</template>

<script setup lang="ts">
interface User {
  id: number
  name: string
  email: string
  image?: string
}

const currentUser = ref<User | null>(null)

onMounted(async () => {
  try {
    // Fetch users and use the first one as the current user (for demo purposes)
    const { data } = await useFetch('/api/get-users')
    if (data.value?.users && data.value.users.length > 0) {
      currentUser.value = data.value.users[0]
    } else {
      // Fallback user if no users exist
      currentUser.value = {
        id: 1,
        name: 'Guest User',
        email: 'guest@wejdanai.com',
        image: 'https://ui-avatars.com/api/?background=random&name=Guest+User'
      }
    }
  } catch (error) {
    console.error('Error loading user:', error)
    // Fallback user
    currentUser.value = {
      id: 1,
      name: 'Guest User',
      email: 'guest@wejdanai.com',
      image: 'https://ui-avatars.com/api/?background=random&name=Guest+User'
    }
  }
})
</script>
