<template>
  <div class="space-y-3">
    <!-- Suggestions (if empty) -->
    <div v-if="!modelValue && showSuggestions" class="flex flex-wrap gap-2">
      <button
        v-for="suggestion in suggestions"
        :key="suggestion"
        @click="useSuggestion(suggestion)"
        class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        {{ suggestion }}
      </button>
    </div>

    <!-- Input Area -->
    <div class="relative">
      <div class="flex items-end space-x-3 rtl:space-x-reverse">
        <!-- Textarea -->
        <div class="flex-1 relative">
          <textarea
            ref="inputRef"
            :value="modelValue"
            @input="handleInput"
            @keydown="handleKeydown"
            :disabled="isDisabled"
            :placeholder="placeholder"
            rows="1"
            class="w-full resize-none rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-4 pr-12 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all max-h-48 overflow-y-auto"
            style="min-height: 56px;"
          />

          <!-- Character Count -->
          <div
            v-if="modelValue.length > 0"
            class="absolute left-3 bottom-3 text-xs text-gray-400 dark:text-gray-500"
          >
            {{ modelValue.length }}
          </div>
        </div>

        <!-- Send/Stop Button -->
        <button
          v-if="!isLoading"
          @click="handleSend"
          :disabled="!canSend"
          class="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span class="text-2xl">🚀</span>
        </button>

        <button
          v-else
          @click="$emit('stop')"
          class="flex-shrink-0 w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center hover:shadow-lg transition-all"
        >
          <span class="text-2xl">⏹️</span>
        </button>
      </div>

      <!-- File Upload (Optional) -->
      <div v-if="false" class="absolute bottom-4 left-4">
        <label class="cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors inline-block">
          <input type="file" class="hidden" @change="handleFileUpload" />
          <span class="text-xl">📎</span>
        </label>
      </div>
    </div>

    <!-- Tips -->
    <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-2">
      <span>اضغط Enter للإرسال، Shift+Enter لسطر جديد</span>
      <span v-if="isLoading" class="text-blue-600 dark:text-blue-400 animate-pulse">
        جاري الكتابة...
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'

interface Props {
  modelValue: string
  isLoading?: boolean
  isDisabled?: boolean
  placeholder?: string
  showSuggestions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  isDisabled: false,
  placeholder: 'اكتب رسالتك هنا... 💬',
  showSuggestions: true
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  send: []
  stop: []
}>()

const inputRef = ref<HTMLTextAreaElement | null>(null)

const suggestions = [
  'اكتب لي كود Python لـ...',
  'اشرح لي مفهوم...',
  'ساعدني في تصحيح الكود',
  'اقترح أفكار لمشروع...'
]

const canSend = computed(() => {
  return props.modelValue.trim().length > 0 && !props.isDisabled
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
  autoResize(target)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

const handleSend = () => {
  if (canSend.value) {
    emit('send')
    resetTextarea()
  }
}

const useSuggestion = (suggestion: string) => {
  emit('update:modelValue', suggestion)
  focusInput()
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    // TODO: Implement file upload
    console.log('File selected:', file.name)
  }
}

const autoResize = (textarea: HTMLTextAreaElement) => {
  textarea.style.height = '56px'
  textarea.style.height = Math.min(textarea.scrollHeight, 192) + 'px'
}

const resetTextarea = async () => {
  await nextTick()
  if (inputRef.value) {
    inputRef.value.style.height = '56px'
  }
}

const focusInput = async () => {
  await nextTick()
  inputRef.value?.focus()
}

// Auto-resize on model value change
watch(() => props.modelValue, async () => {
  await nextTick()
  if (inputRef.value) {
    autoResize(inputRef.value)
  }
})
</script>
