<template>
  <main class="relative min-h-screen py-10 px-4">
    <!-- Header -->
    <div class="max-w-6xl mx-auto mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1
            class="text-4xl font-medium tracking-tight bg-gradient-to-br dark:from-white from-black via-[#707070] to-[#ffffff] bg-clip-text text-transparent"
          >
            Chat
          </h1>
          <p class="text-sm text-gray-500 mt-2">Real-time messaging</p>
        </div>
        <NuxtLink
          to="/"
          class="px-4 py-2 text-sm font-medium text-gray-600 transition-all rounded-full shadow-sm bg-white/30 dark:bg-white/80 ring-1 ring-gray-900/5 dark:text-black hover:shadow-lg active:shadow-sm"
        >
          ← Back to Home
        </NuxtLink>
      </div>
    </div>

    <!-- Chat interface -->
    <div class="max-w-6xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <!-- User list (desktop) -->
        <div class="hidden lg:block lg:col-span-1">
          <ChatUserList :users="onlineUsers" />
        </div>

        <!-- Main chat -->
        <div
          class="lg:col-span-3 rounded-lg shadow-xl dark:bg-white/10 bg-white/30 ring-1 ring-gray-900/5 backdrop-blur-lg overflow-hidden"
          style="height: calc(100vh - 200px)"
        >
          <Chat
            :current-user-id="currentUser?.id"
            :show-user-list="false"
            @send-message="handleSendMessage"
          />
        </div>
      </div>
    </div>

    <!-- Mobile user list toggle -->
    <button
      class="lg:hidden fixed bottom-20 right-4 p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
      @click="showMobileUsers = !showMobileUsers"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="w-6 h-6"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    </button>

    <!-- Mobile user list modal -->
    <div
      v-if="showMobileUsers"
      class="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      @click="showMobileUsers = false"
    >
      <div
        class="absolute bottom-0 left-0 right-0 max-h-[70vh] bg-white dark:bg-gray-900 rounded-t-2xl p-4"
        @click.stop
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">Online Users</h2>
          <button
            @click="showMobileUsers = false"
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ChatUserList :users="onlineUsers" />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { OnlineUser, User } from '~/types/chat'

// State
const showMobileUsers = ref(false)
const onlineUsers = ref<OnlineUser[]>([])
const currentUser = ref<User | null>(null)

// Fetch online users
const fetchOnlineUsers = async () => {
  try {
    const response = await $fetch<{ users: OnlineUser[] }>('/api/users/online')
    onlineUsers.value = response.users || []
    
    // Set current user to first user for demo purposes
    if (onlineUsers.value.length > 0 && !currentUser.value) {
      currentUser.value = {
        id: onlineUsers.value[0].id,
        name: onlineUsers.value[0].name,
        email: '',
        image: onlineUsers.value[0].image,
      }
    }
  } catch (error) {
    console.error('Error fetching online users:', error)
  }
}

// Handle send message
const handleSendMessage = (message: string) => {
  console.log('Message sent:', message)
}

// Initialize on mount
onMounted(() => {
  fetchOnlineUsers()
  
  // Refresh online users every 30 seconds
  const interval = setInterval(fetchOnlineUsers, 30000)
  
  onBeforeUnmount(() => {
    clearInterval(interval)
  })
})
</script>
