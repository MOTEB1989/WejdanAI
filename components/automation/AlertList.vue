<template>
  <div class="space-y-3">
    <div
      v-for="alert in alerts"
      :key="alert.id"
      class="p-3 rounded-lg"
      :class="alertClasses(alert.type)"
    >
      <div class="flex items-start">
        <span class="text-lg ml-2">{{ alertIcon(alert.type) }}</span>
        <div class="flex-1">
          <p class="text-sm font-medium mb-1">{{ alert.message }}</p>
          <p class="text-xs opacity-75">{{ alert.timestamp }}</p>
        </div>
      </div>
    </div>
    <div v-if="alerts.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-4">
      لا توجد تنبيهات
    </div>
  </div>
</template>

<script setup lang="ts">
interface Alert {
  id: number
  type: 'info' | 'warning' | 'error' | 'success'
  message: string
  timestamp: string
}

interface Props {
  alerts: Alert[]
}

defineProps<Props>()

const alertClasses = (type: string) => {
  switch (type) {
    case 'info':
      return 'bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-200'
    case 'warning':
      return 'bg-yellow-50 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-200'
    case 'error':
      return 'bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-200'
    case 'success':
      return 'bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-200'
    default:
      return 'bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-gray-200'
  }
}

const alertIcon = (type: string) => {
  switch (type) {
    case 'info':
      return 'ℹ️'
    case 'warning':
      return '⚠️'
    case 'error':
      return '❌'
    case 'success':
      return '✅'
    default:
      return '📌'
  }
}
</script>
