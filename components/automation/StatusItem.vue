<template>
  <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
    <span class="text-sm font-medium text-gray-900 dark:text-white">
      {{ label }}
    </span>
    <span
      class="px-3 py-1 text-xs font-semibold rounded-full"
      :class="statusClasses"
    >
      {{ statusText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  status: 'operational' | 'warning' | 'error' | 'maintenance'
}

const props = defineProps<Props>()

const statusClasses = computed(() => {
  switch (props.status) {
    case 'operational':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'error':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'maintenance':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    default:
      return 'bg-gray-100 text-gray-800'
  }
})

const statusText = computed(() => {
  switch (props.status) {
    case 'operational':
      return 'تعمل'
    case 'warning':
      return 'تحذير'
    case 'error':
      return 'خطأ'
    case 'maintenance':
      return 'صيانة'
    default:
      return 'غير معروف'
  }
})
</script>
