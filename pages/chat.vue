<template>
  <main class="flex min-h-screen flex-col bg-slate-950 text-slate-100">
    <div class="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6 sm:px-6">
      <!-- Header -->
      <header class="mb-6 space-y-2">
        <h1 class="text-3xl font-semibold text-white sm:text-4xl">
          وجدان AI
        </h1>
        <p class="text-sm text-slate-400 sm:text-base">
          مساعدك الذكي المدعوم بـ Claude 3.5 Sonnet
        </p>
      </header>

      <!-- Messages Container -->
      <div
        ref="messagesContainer"
        class="mb-4 flex flex-1 flex-col gap-4 overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-lg shadow-black/40 sm:p-6"
      >
        <div v-if="messages.length === 0" class="flex flex-1 items-center justify-center">
          <p class="text-center text-slate-400">
            مرحباً! كيف يمكنني مساعدتك اليوم؟
          </p>
        </div>

        <div
          v-for="(message, index) in messages"
          :key="index"
          class="flex gap-3"
          :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[75%]"
            :class="
              message.role === 'user'
                ? 'bg-blue-600/20 text-blue-50 border border-blue-400/30'
                : 'bg-slate-800/80 text-slate-100 border border-white/10'
            "
          >
            <div class="whitespace-pre-wrap break-words text-sm sm:text-base">
              {{ message.content }}
            </div>
          </div>
        </div>

        <!-- Loading Indicator -->
        <div v-if="isLoading" class="flex justify-start gap-3">
          <div
            class="max-w-[85%] rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 sm:max-w-[75%]"
          >
            <div class="flex gap-1">
              <div class="h-2 w-2 animate-bounce rounded-full bg-slate-400" style="animation-delay: 0ms"></div>
              <div class="h-2 w-2 animate-bounce rounded-full bg-slate-400" style="animation-delay: 150ms"></div>
              <div class="h-2 w-2 animate-bounce rounded-full bg-slate-400" style="animation-delay: 300ms"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Form -->
      <form @submit.prevent="sendMessage" class="flex gap-2">
        <input
          v-model="inputMessage"
          type="text"
          placeholder="اكتب رسالتك هنا..."
          :disabled="isLoading"
          class="flex-1 rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
          dir="auto"
        />
        <button
          type="submit"
          :disabled="isLoading || !inputMessage.trim()"
          class="rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:text-base"
        >
          {{ isLoading ? 'جاري الإرسال...' : 'إرسال' }}
        </button>
      </form>
    </div>
  </main>
</template>

<script setup>
const messages = ref([])
const inputMessage = ref('')
const isLoading = ref(false)
const messagesContainer = ref(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const userMessage = {
    role: 'user',
    content: inputMessage.value.trim(),
  }

  messages.value.push(userMessage)
  scrollToBottom()

  const messageToSend = inputMessage.value
  inputMessage.value = ''
  isLoading.value = true

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages.value,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('Response body is not readable')
    }

    let assistantMessage = {
      role: 'assistant',
      content: '',
    }
    messages.value.push(assistantMessage)

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            break
          }
          try {
            const parsed = JSON.parse(data)
            if (parsed.text) {
              assistantMessage.content += parsed.text
              scrollToBottom()
            }
          } catch (e) {
            console.error('Error parsing JSON:', e)
          }
        }
      }
    }
  } catch (error) {
    console.error('Error sending message:', error)
    messages.value.push({
      role: 'assistant',
      content: 'عذراً، حدث خطأ أثناء معالجة طلبك. الرجاء المحاولة مرة أخرى.',
    })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}
</script>
