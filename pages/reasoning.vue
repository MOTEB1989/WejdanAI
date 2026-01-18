<template>
  <main class="min-h-screen bg-slate-950 text-slate-100">
    <div class="mx-auto flex max-w-7xl flex-col h-screen">
      <!-- Header -->
      <header class="border-b border-white/10 bg-slate-900/60 px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold text-white">
              🧠 Reasoning Assistant
            </h1>
            <p class="text-sm text-slate-400">
              Powered by Advanced AI Models
            </p>
          </div>
          <div class="flex items-center gap-3">
            <NuxtLink
              to="/"
              class="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10"
            >
              ← Operations
            </NuxtLink>
            <select
              v-model="preference"
              class="rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="accuracy">🎯 Accuracy</option>
              <option value="complexity">🧩 Complexity</option>
              <option value="speed">⚡ Speed</option>
              <option value="cost">💰 Cost</option>
            </select>
            <select
              v-model="taskType"
              class="rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
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

      <!-- Chat Messages -->
      <div class="flex-1 overflow-y-auto px-6 py-6">
        <div class="mx-auto max-w-4xl space-y-6">
          <!-- Welcome Message -->
          <div v-if="messages.length === 0" class="text-center py-20">
            <div class="text-6xl mb-4">🧠</div>
            <h2 class="text-2xl font-semibold text-white mb-2">
              Welcome to Reasoning Assistant
            </h2>
            <p class="text-slate-400 mb-8">
              Ask complex questions and get detailed reasoning from advanced AI models
            </p>
            <div class="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
              <button
                @click="askSample('Solve: If x² + 5x + 6 = 0, what are the values of x?')"
                class="rounded-lg border border-white/10 bg-slate-900/60 p-4 text-left transition hover:bg-slate-900"
              >
                <div class="text-sm font-semibold text-white mb-1">📐 Math Problem</div>
                <div class="text-xs text-slate-400">Solve quadratic equation</div>
              </button>
              <button
                @click="askSample('Explain the concept of recursion with a real-world example')"
                class="rounded-lg border border-white/10 bg-slate-900/60 p-4 text-left transition hover:bg-slate-900"
              >
                <div class="text-sm font-semibold text-white mb-1">💻 Coding</div>
                <div class="text-xs text-slate-400">Programming concepts</div>
              </button>
              <button
                @click="askSample('If all doctors have degrees, and Ahmad is a doctor, what can we conclude?')"
                class="rounded-lg border border-white/10 bg-slate-900/60 p-4 text-left transition hover:bg-slate-900"
              >
                <div class="text-sm font-semibold text-white mb-1">🧠 Logic</div>
                <div class="text-xs text-slate-400">Logical reasoning</div>
              </button>
              <button
                @click="askSample('Analyze the pros and cons of remote work')"
                class="rounded-lg border border-white/10 bg-slate-900/60 p-4 text-left transition hover:bg-slate-900"
              >
                <div class="text-sm font-semibold text-white mb-1">📊 Analysis</div>
                <div class="text-xs text-slate-400">Critical thinking</div>
              </button>
            </div>
          </div>

          <!-- Messages -->
          <div
            v-for="(msg, idx) in messages"
            :key="idx"
            class="flex gap-4"
            :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-3xl rounded-2xl px-6 py-4"
              :class="
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'border border-white/10 bg-slate-900/60 text-slate-100'
              "
            >
              <!-- User Message -->
              <div v-if="msg.role === 'user'" class="whitespace-pre-wrap">
                {{ msg.content }}
              </div>

              <!-- Assistant Message -->
              <div v-else>
                <div class="mb-3 flex items-center gap-2 text-sm">
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
                <div v-if="msg.reasoning_steps && msg.reasoning_steps.length > 0" class="mb-4 space-y-2">
                  <details class="rounded-lg border border-white/5 bg-white/5">
                    <summary class="cursor-pointer px-4 py-2 text-sm font-semibold text-slate-300">
                      🧩 Reasoning Steps ({{ msg.reasoning_steps.length }})
                    </summary>
                    <div class="space-y-2 px-4 pb-3 pt-2">
                      <div
                        v-for="step in msg.reasoning_steps"
                        :key="step.step_number"
                        class="rounded-lg border border-white/5 bg-white/5 p-3"
                      >
                        <div class="mb-1 text-xs font-semibold text-blue-300">
                          Step {{ step.step_number }}
                        </div>
                        <div class="text-sm text-slate-300">{{ step.thought }}</div>
                        <div v-if="step.confidence" class="mt-1 text-xs text-slate-500">
                          Confidence: {{ (step.confidence * 100).toFixed(0) }}%
                        </div>
                      </div>
                    </div>
                  </details>
                </div>

                <!-- Answer -->
                <div class="prose prose-invert max-w-none whitespace-pre-wrap text-sm">
                  {{ msg.answer || msg.content }}
                </div>

                <!-- Metadata -->
                <div v-if="msg.thinking_tokens" class="mt-3 text-xs text-slate-500">
                  Thinking tokens: {{ msg.thinking_tokens }}
                </div>
              </div>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="isLoading" class="flex gap-4">
            <div class="max-w-3xl rounded-2xl border border-white/10 bg-slate-900/60 px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
                <div class="h-2 w-2 animate-pulse rounded-full bg-blue-500" style="animation-delay: 0.2s"></div>
                <div class="h-2 w-2 animate-pulse rounded-full bg-blue-500" style="animation-delay: 0.4s"></div>
                <span class="text-sm text-slate-400">Thinking...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="border-t border-white/10 bg-slate-900/60 px-6 py-4">
        <form @submit.prevent="sendMessage" class="mx-auto max-w-4xl">
          <div class="flex gap-3">
            <textarea
              v-model="input"
              @keydown.enter.exact.prevent="sendMessage"
              placeholder="Ask a complex question..."
              rows="1"
              class="flex-1 resize-none rounded-lg border border-white/10 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              :disabled="isLoading"
            ></textarea>
            <button
              type="submit"
              :disabled="isLoading || !input.trim()"
              class="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ isLoading ? '...' : 'Send' }}
            </button>
          </div>
          <div class="mt-2 flex items-center justify-between text-xs text-slate-500">
            <div>
              Press Enter to send, Shift+Enter for new line
            </div>
            <button
              v-if="messages.length > 0"
              @click="clearChat"
              type="button"
              class="text-slate-400 hover:text-white transition"
            >
              Clear Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'

const messages = ref([])
const input = ref('')
const isLoading = ref(false)
const preference = ref('accuracy')
const taskType = ref('general')

const API_BASE = 'http://localhost:8001'

async function sendMessage() {
  if (!input.value.trim() || isLoading.value) return

  const userMessage = {
    role: 'user',
    content: input.value.trim(),
  }

  messages.value.push(userMessage)
  const query = input.value.trim()
  input.value = ''
  isLoading.value = true

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
      content: `Error: ${error.message}. Please make sure:\n1. Reasoning Orchestrator is running (python3 ReasoningOrchestrator)\n2. You have configured API keys in data/reasoning_connections.json\n3. At least one provider is enabled`,
      provider: 'System',
    })
  } finally {
    isLoading.value = false
  }
}

function askSample(question) {
  input.value = question
  sendMessage()
}

function clearChat() {
  if (confirm('Are you sure you want to clear the chat?')) {
    messages.value = []
  }
}
</script>
