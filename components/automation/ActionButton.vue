<template>
  <button
    class="w-full flex items-start p-4 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 text-right"
    @click="$emit('click')"
  >
    <div class="text-2xl ml-3">{{ icon }}</div>
    <div class="flex-1">
      <div class="font-semibold text-gray-900 dark:text-white mb-1">
        {{ label }}
      </div>
      <div class="text-sm text-gray-600 dark:text-gray-400">
        {{ description }}
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  label: string
  description: string
}

defineProps<Props>()
defineEmits(['click'])
</script>
