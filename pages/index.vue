<script setup>
import { ref } from 'vue'
import { Send, Bot, User, Settings, Paperclip } from 'lucide-vue-next'

const messages = ref([
  {
    id: 1,
    role: 'assistant',
    content: 'مرحباً! أنا وجدان، كيف يمكنني مساعدتك اليوم؟',
    time: '١٢:٠٠ م',
  },
])

const nextId = ref(2)
const input = ref('')
const isTyping = ref(false)

const timeNow = () =>
  new Date().toLocaleTimeString('ar-EG', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

const handleSend = async () => {
  if (!input.value.trim()) return
  const text = input.value
  input.value = ''

  messages.value.push({
    id: nextId.value++,
    role: 'user',
    content: text,
    time: timeNow(),
  })

  isTyping.value = true
  try {
    // TODO: استبدل هذا بمناداة API الخاصة بـ WejdanAI
    await new Promise((resolve) => setTimeout(resolve, 600))
    messages.value.push({
      id: nextId.value++,
      role: 'assistant',
      content: 'سأعمل على ذلك حالاً وأعود إليك بالتفاصيل.',
      time: timeNow(),
    })
  } finally {
    isTyping.value = false
  }
}
</script>

<template>
  <div class="flex h-screen flex-col bg-slate-50 font-cairo" dir="rtl">
    <nav
      class="sticky top-0 z-10 flex items-center justify-between border-b bg-white/80 p-4 shadow-sm backdrop-blur-md"
    >
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
          W
        </div>
        <span class="font-bold text-slate-800">وجدان الذكي</span>
      </div>
      <Settings class="h-5 w-5 cursor-pointer text-slate-500" />
    </nav>

    <main class="flex-1 overflow-y-auto p-4">
      <div class="mx-auto flex w-full max-w-4xl flex-col space-y-4">
        <div
          v-for="msg in messages"
          :key="msg.id"
          :class="['flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : '']"
        >
          <div
            :class="[
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
              msg.role === 'user'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-slate-100 text-slate-600',
            ]"
          >
            <component :is="msg.role === 'user' ? User : Bot" class="h-5 w-5" />
          </div>
          <div
            :class="[
              'max-w-[75%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm',
              msg.role === 'user'
                ? 'rounded-tr-none bg-blue-600 text-white'
                : 'rounded-tl-none border bg-white',
            ]"
          >
            {{ msg.content }}
            <div class="mt-1 text-left text-[10px] opacity-60">{{ msg.time }}</div>
          </div>
        </div>
        <div v-if="isTyping" class="flex items-center gap-2 text-sm text-slate-500">
          <Bot class="h-4 w-4" />
          <span>وجدان يكتب...</span>
        </div>
      </div>
    </main>

    <footer class="sticky bottom-0 border-t bg-white p-4">
      <div
        class="mx-auto flex w-full max-w-4xl items-center gap-2 rounded-full bg-slate-100 px-4 py-1 focus-within:ring-2 focus-within:ring-blue-500/20"
      >
        <Paperclip class="h-5 w-5 cursor-pointer text-slate-400" />
        <input
          v-model="input"
          @keyup.enter="handleSend"
          placeholder="اكتب سؤالك هنا..."
          class="flex-1 border-none bg-transparent py-3 text-base outline-none"
        />
        <button @click="handleSend" class="p-1 text-blue-600 hover:text-blue-700">
          <Send class="h-6 w-6 -scale-x-100" />
        </button>
      </div>
    </footer>
  </div>
</template>
