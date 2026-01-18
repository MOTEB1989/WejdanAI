<template>
  <div class="space-y-3">
    <div
      v-for="deployment in deployments"
      :key="deployment.id"
      class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700"
    >
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center">
          <span
            class="w-2 h-2 rounded-full mr-2"
            :class="statusColor(deployment.status)"
          />
          <span class="font-semibold text-gray-900 dark:text-white">
            {{ deployment.branch }}
          </span>
        </div>
        <span
          class="px-2 py-1 text-xs rounded-full"
          :class="environmentBadge(deployment.environment)"
        >
          {{ deployment.environment }}
        </span>
      </div>
      <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>{{ deployment.timestamp }}</span>
        <span>{{ deployment.duration }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Deployment {
  id: number
  branch: string
  status: 'success' | 'failed' | 'pending'
  timestamp: string
  duration: string
  environment: 'production' | 'staging' | 'development'
}

interface Props {
  deployments: Deployment[]
}

defineProps<Props>()

const statusColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'bg-green-500'
    case 'failed':
      return 'bg-red-500'
    case 'pending':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-500'
  }
}

const environmentBadge = (env: string) => {
  switch (env) {
    case 'production':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'staging':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'development':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>
