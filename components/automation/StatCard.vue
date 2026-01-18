<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl"
    :class="[colorClasses[color]]"
  >
    <div class="flex items-center justify-between mb-4">
      <div class="text-3xl">{{ icon }}</div>
      <div
        v-if="trend"
        class="flex items-center text-sm font-semibold"
        :class="trendColor"
      >
        <span class="mr-1">{{ trend }}</span>
        <svg
          v-if="trendDirection === 'up'"
          class="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
            clip-rule="evenodd"
          />
        </svg>
        <svg
          v-else-if="trendDirection === 'down'"
          class="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </div>
    <div>
      <p class="text-gray-600 dark:text-gray-400 text-sm mb-1">{{ title }}</p>
      <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ value }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: string | number
  icon: string
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red'
  trend?: string
}

const props = defineProps<Props>()

const colorClasses = {
  blue: 'border-l-4 border-blue-500',
  green: 'border-l-4 border-green-500',
  yellow: 'border-l-4 border-yellow-500',
  purple: 'border-l-4 border-purple-500',
  red: 'border-l-4 border-red-500'
}

const trendDirection = computed(() => {
  if (!props.trend) return null
  if (props.trend.startsWith('+')) return 'up'
  if (props.trend.startsWith('-')) return 'down'
  return null
})

const trendColor = computed(() => {
  if (trendDirection.value === 'up') return 'text-green-600'
  if (trendDirection.value === 'down') return 'text-red-600'
  return 'text-gray-600'
})
</script>
