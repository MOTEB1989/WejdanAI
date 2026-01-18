<template>
  <div class="space-y-4">
    <div class="h-48 flex items-end justify-between space-x-2">
      <div
        v-for="item in data"
        :key="item.date"
        class="flex-1 flex flex-col items-center"
      >
        <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-t-lg overflow-hidden">
          <div
            class="bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-500"
            :style="{ height: `${(item.score / 10) * 100}%` }"
          />
        </div>
        <div class="text-xs text-gray-600 dark:text-gray-400 mt-2">
          {{ formatDate(item.date) }}
        </div>
      </div>
    </div>
    <div class="text-center">
      <div class="text-3xl font-bold text-gray-900 dark:text-white">
        {{ averageScore.toFixed(1) }}/10
      </div>
      <div class="text-sm text-gray-600 dark:text-gray-400">
        متوسط الجودة
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface QualityData {
  date: string
  score: number
}

interface Props {
  data: QualityData[]
}

const props = defineProps<Props>()

const averageScore = computed(() => {
  if (props.data.length === 0) return 0
  const sum = props.data.reduce((acc, item) => acc + item.score, 0)
  return sum / props.data.length
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getDate()}/${date.getMonth() + 1}`
}
</script>
