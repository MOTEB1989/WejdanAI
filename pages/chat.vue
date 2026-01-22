<template>
  <main class="relative flex flex-col min-h-screen py-6 px-4 md:py-10">
    <!-- Header -->
    <div class="max-w-7xl w-full mx-auto mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1
            class="pb-2 bg-gradient-to-br dark:from-white from-black via-[#707070] to-[#ffffff] bg-clip-text text-3xl md:text-5xl font-medium tracking-tight text-transparent"
          >
            WejdanAI Chat
          </h1>
          <p class="text-gray-600 dark:text-gray-300 text-sm md:text-base">
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

    <!-- Chat Container -->
    <div class="max-w-7xl w-full h-[calc(100vh-200px)] mx-auto">
      <Chat :current-user="currentUser" />
    </div>

    <!-- Footer -->
    <div class="max-w-7xl w-full mx-auto mt-6 text-center">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Built with Nuxt 3, PostgreSQL, and WebSockets
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
// Set page meta
useHead({
  title: 'Chat - WejdanAI',
  meta: [
    {
      name: 'description',
      content: 'Real-time chat application built with Nuxt 3 and WebSockets'
    }
  ]
})

// Get users to simulate current user
const { data: usersData } = await useFetch('/api/get-users')

// Use first user as current user, or create a default
const currentUser = computed(() => {
  if (usersData.value?.users && usersData.value.users.length > 0) {
    const user = usersData.value.users[0]
    return {
      id: user.id,
      name: user.name,
      image: user.image
    }
  }
  
  // Default user if no users exist
  return {
    id: 1,
    name: 'Guest User',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'
  }
})
</script>
