<template>
  <main class="relative flex flex-col items-center justify-center min-h-screen py-10 px-4">
    <!-- Navigation -->
    <div class="absolute top-4 left-4 right-4 flex justify-between items-center">
      <NuxtLink
        to="/"
        class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all rounded-full shadow-sm bg-white/30 dark:bg-white/80 ring-1 ring-gray-900/5 dark:text-black hover:shadow-lg active:shadow-sm"
      >
        ← Back to Home
      </NuxtLink>
      
      <a
        href="https://vercel.com"
        class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 transition-all rounded-full shadow-sm bg-white/30 dark:bg-white/80 ring-1 ring-gray-900/5 dark:text-black hover:shadow-lg active:shadow-sm"
      >
        Deploy your own
      </a>
    </div>

    <!-- Header -->
    <h1
      class="pt-8 pb-8 bg-gradient-to-br dark:from-white from-black via-[#707070] to-[#ffffff] bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-6xl"
    >
      Real-time Chat
    </h1>
    
    <p class="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-lg">
      Experience real-time messaging with WebSocket-powered chat. Send messages, see typing indicators, and connect with others instantly.
    </p>

    <!-- Chat Component -->
    <div class="w-full max-w-3xl">
      <Chat :current-user="currentUser" />
    </div>

    <!-- Info Section -->
    <div class="w-full max-w-3xl mt-8 p-6 rounded-lg shadow-xl bg-white/30 dark:bg-white/10 ring-1 ring-gray-900/5 backdrop-blur-lg">
      <h2 class="text-xl font-semibold mb-4">Chat Features</h2>
      <ul class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
        <li class="flex items-start">
          <svg class="w-5 h-5 mr-2 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span><strong>Real-time messaging</strong> - Messages appear instantly for all connected users</span>
        </li>
        <li class="flex items-start">
          <svg class="w-5 h-5 mr-2 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span><strong>Typing indicators</strong> - See when others are composing messages</span>
        </li>
        <li class="flex items-start">
          <svg class="w-5 h-5 mr-2 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span><strong>Online status</strong> - Track the number of connected users</span>
        </li>
        <li class="flex items-start">
          <svg class="w-5 h-5 mr-2 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span><strong>Auto-reconnection</strong> - Automatically reconnects if connection is lost</span>
        </li>
        <li class="flex items-start">
          <svg class="w-5 h-5 mr-2 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span><strong>Persistent storage</strong> - Messages are saved to PostgreSQL database</span>
        </li>
        <li class="flex items-start">
          <svg class="w-5 h-5 mr-2 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span><strong>Responsive design</strong> - Works seamlessly on mobile and desktop</span>
        </li>
      </ul>
    </div>

    <!-- Footer -->
    <div class="flex flex-col items-center mt-8 space-y-4">
      <a href="https://vercel.com">
        <img
          src="/vercel.svg"
          alt="Vercel Logo"
          class="my-2 text-white dark:text-white"
          width="100"
          height="24"
        />
      </a>
      <a
        href="https://github.com/Wejdan-AI/LexNexus"
        class="flex items-center space-x-2"
      >
        <img src="/github.svg" alt="GitHub Logo" class="h-6 dark:invert" />
        <p class="font-light">Source</p>
      </a>
    </div>
  </main>
</template>

<script setup>
// Get current user (in a real app, this would come from auth)
const { data: usersData } = await useFetch('/api/get-users')
const currentUser = computed(() => {
  if (usersData.value?.users?.[0]) {
    return usersData.value.users[0]
  }
  return {
    id: 1,
    name: 'Guest User',
    email: 'guest@example.com',
    image: 'https://ui-avatars.com/api/?name=Guest+User'
  }
})
</script>
