<template>
  <div class="p-4 bg-white/30 dark:bg-white/10 backdrop-blur-lg ring-1 ring-gray-900/5 rounded-lg">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">Online Users</h3>
      <span class="text-sm text-gray-500">{{ users.length }} online</span>
    </div>

    <!-- User list -->
    <div class="space-y-2 max-h-96 overflow-y-auto">
      <div
        v-for="user in users"
        :key="user.id"
        class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/30 dark:hover:bg-white/5 transition-colors"
      >
        <div class="relative">
          <img
            v-if="user.image"
            :src="user.image"
            :alt="user.name"
            class="w-10 h-10 rounded-full ring-1 ring-gray-900/5"
          />
          <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate">{{ user.name }}</p>
          <p class="text-xs text-gray-500">Active now</p>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="users.length === 0" class="text-center py-8 text-gray-500">
        <p class="text-sm">No users online</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OnlineUser } from '~/types/chat'

defineProps<{
  users: OnlineUser[]
}>()
</script>
