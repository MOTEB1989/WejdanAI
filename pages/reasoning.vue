<template>
  <main class="relative flex h-screen flex-col bg-slate-950 text-slate-100">
    <!-- Mobile Header -->
    <header class="safe-top border-b border-white/10 bg-slate-900/95 backdrop-blur-xl">
      <div class="px-4 py-3 sm:px-6">
        <div class="flex items-center justify-between">
          <!-- Logo & Title -->
          <div class="flex items-center gap-3">
            <NuxtLink
              to="/"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition active:scale-95 sm:h-10 sm:w-10"
            >
              <svg class="h-5 w-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </NuxtLink>
            <div>
              <h1 class="text-base font-semibold text-white sm:text-lg">
                🧠 Reasoning Assistant
              </h1>
              <p class="text-xs text-slate-400 sm:text-sm">
                Advanced AI Models
              </p>
            </div>
          </div>

          <!-- Settings Button (Mobile) -->
          <button
            @click="showSettings = !showSettings"
            class="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition active:scale-95 sm:h-10 sm:w-10"
          >
            <svg class="h-5 w-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        </div>

        <!-- Desktop Settings -->
        <div class="mt-3 hidden items-center gap-2 sm:flex">
          <select
            v-model="preference"
            class="flex-1 rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="accuracy">🎯 Accuracy</option>
            <option value="complexity">🧩 Complexity</option>
            <option value="speed">⚡ Speed</option>
            <option value="cost">💰 Cost</option>
          </select>
          <select
            v-model="taskType"
            class="flex-1 rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="general">General</option>
            <option value="mathematical">📐 Mathematical</option>
            <option value="logical">🧠 Logical</option>
            <option value="analytical">📊 Analytical</option>
            <option value="coding">💻 Coding</option>
          </select>
        </div>
      </div>
    </header>

    <!-- Mobile Settings Bottom Sheet -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showSettings"
        @click="showSettings = false"
        class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm sm:hidden"
      >
        <div
          @click.stop
          class="absolute bottom-0 left-0 right-0 rounded-t-3xl border-t border-white/10 bg-slate-900 p-6 pb-safe"
        >
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-white">Settings</h3>
            <button
              @click="showSettings = false"
              class="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition active:scale-95"
            >
              <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-300">
                Preference
              </label>
              <select
                v-model="preference"
                class="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-3 text-base text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="accuracy">🎯 Accuracy</option>
                <option value="complexity">🧩 Complexity</option>
                <option value="speed">⚡ Speed</option>
                <option value="cost">💰 Cost</option>
              </select>
            </div>

            <div>
              <label class="mb-2 block text-sm font-medium text-slate-300">
                Task Type
              </label>
              <select
                v-model="taskType"
                class="w-full rounded-lg border border-white/10 bg-slate-800 px-4 py-3 text-base text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="general">General</option>
                <option value="mathematical">📐 Mathematical</option>
                <option value="logical">🧠 Logical</option>
                <option value="analytical">📊 Analytical</option>
                <option value="coding">💻 Coding</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Chat Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
      <div class="mx-auto max-w-4xl space-y-4 sm:space-y-6">
        <!-- Welcome Message -->
        <div v-if="messages.length === 0" class="py-8 text-center sm:py-20">
          <div class="mb-4 text-5xl sm:text-6xl">🧠</div>
          <h2 class="mb-2 text-xl font-semibold text-white sm:text-2xl">
            Reasoning Assistant
          </h2>
          <p class="mb-6 text-sm text-slate-400 sm:mb-8 sm:text-base">
            Ask complex questions
          </p>
          <div class="grid grid-cols-2 gap-3 sm:gap-4">
            <button
              @click="askSample('Solve: If x² + 5x + 6 = 0, what are the values of x?')"
              class="rounded-xl border border-white/10 bg-slate-900/60 p-3 text-left transition active:scale-95 sm:rounded-2xl sm:p-4"
            >
              <div class="mb-1 text-xs font-semibold text-white sm:text-sm">📐 Math</div>
              <div class="text-xs text-slate-400">Quadratic equation</div>
            </button>
            <button
              @click="askSample('Explain recursion with a real example')"
              class="rounded-xl border border-white/10 bg-slate-900/60 p-3 text-left transition active:scale-95 sm:rounded-2xl sm:p-4"
            >
              <div class="mb-1 text-xs font-semibold text-white sm:text-sm">💻 Code</div>
              <div class="text-xs text-slate-400">Programming</div>
            </button>
            <button
              @click="askSample('If all doctors have degrees, and Ahmad is a doctor, what can we conclude?')"
              class="rounded-xl border border-white/10 bg-slate-900/60 p-3 text-left transition active:scale-95 sm:rounded-2xl sm:p-4"
            >
              <div class="mb-1 text-xs font-semibold text-white sm:text-sm">🧠 Logic</div>
              <div class="text-xs text-slate-400">Reasoning</div>
            </button>
            <button
              @click="askSample('Analyze pros and cons of remote work')"
              class="rounded-xl border border-white/10 bg-slate-900/60 p-3 text-left transition active:scale-95 sm:rounded-2xl sm:p-4"
            >
              <div class="mb-1 text-xs font-semibold text-white sm:text-sm">📊 Analysis</div>
              <div class="text-xs text-slate-400">Critical thinking</div>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          class="flex gap-2 sm:gap-4"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-3xl sm:px-6 sm:py-4"
            :class="
              msg.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'border border-white/10 bg-slate-900/60 text-slate-100'
            "
          >
            <!-- User Message -->
            <div v-if="msg.role === 'user'" class="whitespace-pre-wrap text-sm sm:text-base">
              {{ msg.content }}
            </div>

            <!-- Assistant Message -->
            <div v-else>
              <div class="mb-2 flex flex-wrap items-center gap-2 text-xs sm:mb-3">
                <span class="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                  {{ msg.provider || 'AI' }}
                </span>
                <span v-if="msg.model" class="text-xs text-slate-400">
                  {{ msg.model }}
                </span>
                <span v-if="msg.latency_ms" class="text-xs text-slate-400">
                  {{ msg.latency_ms }}ms
                </span>
              </div>

              <!-- Reasoning Steps -->
              <div v-if="msg.reasoning_steps && msg.reasoning_steps.length > 0" class="mb-3 space-y-2 sm:mb-4">
                <details class="rounded-lg border border-white/5 bg-white/5">
                  <summary class="cursor-pointer px-3 py-2 text-xs font-semibold text-slate-300 sm:px-4 sm:text-sm">
                    🧩 Reasoning ({{ msg.reasoning_steps.length }} steps)
                  </summary>
                  <div class="space-y-2 px-3 pb-3 pt-2 sm:px-4">
                    <div
                      v-for="step in msg.reasoning_steps"
                      :key="step.step_number"
                      class="rounded-lg border border-white/5 bg-white/5 p-2 sm:p-3"
                    >
                      <div class="mb-1 text-xs font-semibold text-blue-300">
                        Step {{ step.step_number }}
                      </div>
                      <div class="text-xs text-slate-300 sm:text-sm">{{ step.thought }}</div>
                    </div>
                  </div>
                </details>
              </div>

              <!-- Answer -->
              <div class="whitespace-pre-wrap text-sm leading-relaxed sm:text-base">
                {{ msg.answer || msg.content }}
              </div>

              <!-- Metadata -->
              <div v-if="msg.thinking_tokens" class="mt-2 text-xs text-slate-500">
                Thinking tokens: {{ msg.thinking_tokens }}
              </div>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="flex gap-2 sm:gap-4">
          <div class="max-w-3xl rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3 sm:px-6 sm:py-4">
            <div class="flex items-center gap-2">
              <div class="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
              <div class="h-2 w-2 animate-pulse rounded-full bg-blue-500" style="animation-delay: 0.2s"></div>
              <div class="h-2 w-2 animate-pulse rounded-full bg-blue-500" style="animation-delay: 0.4s"></div>
              <span class="text-sm text-slate-400">Thinking...</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area (Fixed at bottom, iOS safe area aware) -->
    <div class="safe-bottom border-t border-white/10 bg-slate-900/95 backdrop-blur-xl">
      <form @submit.prevent="sendMessage" class="px-4 py-3 sm:px-6 sm:py-4">
        <div class="mx-auto max-w-4xl">
          <div class="flex gap-2 sm:gap-3">
            <textarea
              ref="textareaRef"
              v-model="input"
              @input="adjustTextareaHeight"
              @keydown.enter.exact.prevent="sendMessage"
              placeholder="Ask a question..."
              rows="1"
              class="flex-1 resize-none rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-base text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none sm:rounded-lg"
              style="max-height: 120px"
              :disabled="isLoading"
            ></textarea>
            <button
              type="submit"
              :disabled="isLoading || !input.trim()"
              class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 font-semibold text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:h-auto sm:w-auto sm:rounded-lg sm:px-6"
            >
              <svg v-if="!isLoading" class="h-5 w-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span class="hidden sm:inline">{{ isLoading ? '...' : 'Send' }}</span>
            </button>
          </div>
          <div class="mt-2 flex items-center justify-between text-xs text-slate-500">
            <div class="hidden sm:block">
              Press Enter to send
            </div>
            <button
              v-if="messages.length > 0"
              @click="clearChat"
              type="button"
              class="text-slate-400 transition active:text-white"
            >
              Clear
            </button>
          </div>
        </div>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'

const messages = ref([])
const input = ref('')
const isLoading = ref(false)
const preference = ref('accuracy')
const taskType = ref('general')
const showSettings = ref(false)
const messagesContainer = ref(null)
const textareaRef = ref(null)

// Use current hostname for API calls (works on mobile/desktop)
const getApiBase = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    return `http://${hostname}:8001`
  }
  return 'http://localhost:8001'
}

const API_BASE = getApiBase()

// Auto-scroll to bottom when new messages arrive
async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Adjust textarea height
function adjustTextareaHeight() {
  const textarea = textareaRef.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }
}

async function sendMessage() {
  if (!input.value.trim() || isLoading.value) return

  const userMessage = {
    role: 'user',
    content: input.value.trim(),
  }

  messages.value.push(userMessage)
  const query = input.value.trim()
  input.value = ''

  // Reset textarea height
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }

  isLoading.value = true
  showSettings.value = false // Close settings on mobile
  await scrollToBottom()

  try {
    const response = await fetch(`${API_BASE}/api/reasoning/reason`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        task_type: taskType.value,
        preference: preference.value,
        enable_chain_tracking: true,
        max_iterations: 1,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail?.msg || 'Failed to get response')
    }

    const data = await response.json()
    messages.value.push({
      role: 'assistant',
      ...data,
    })
  } catch (error) {
    console.error('Error:', error)
    messages.value.push({
      role: 'assistant',
      content: `Error: ${error.message}\n\nPlease ensure:\n1. Reasoning Orchestrator is running\n2. API keys are configured\n3. At least one provider is enabled`,
      provider: 'System',
    })
  } finally {
    isLoading.value = false
    await scrollToBottom()
  }
}

function askSample(question) {
  input.value = question
  sendMessage()
}

function clearChat() {
  if (confirm('Clear all messages?')) {
    messages.value = []
  }
}

onMounted(() => {
  // Focus textarea on mount (desktop only)
  if (window.innerWidth >= 640 && textareaRef.value) {
    textareaRef.value.focus()
  }
})
</script>

<style scoped>
/* iOS Safe Area Support */
.safe-top {
  padding-top: env(safe-area-inset-top);
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Smooth scrolling */
.overflow-y-auto {
  -webkit-overflow-scrolling: touch;
}

/* Prevent zoom on input focus (iOS) */
input,
textarea,
select {
  font-size: 16px;
}

@media (min-width: 640px) {
  input,
  textarea,
  select {
    font-size: 0.875rem;
  }
}

/* Custom scrollbar for desktop */
@media (min-width: 640px) {
  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: transparent;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.3);
    border-radius: 3px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 163, 184, 0.5);
  }
}
</style>
