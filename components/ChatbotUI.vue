<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col h-[80vh]">
      <!-- Header -->
      <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
        <div class="flex items-center gap-3">
          <div class="bg-white/20 p-2 rounded-full">
            <Bot :size="28" />
          </div>
          <div>
            <h1 class="text-2xl font-bold">وجدان AI</h1>
            <p class="text-purple-200">مساعد ذكي متاح على مدار الساعة</p>
          </div>
          <Sparkles class="ml-auto text-yellow-300" :size="24" />
        </div>
      </div>

      <!-- Messages -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['flex', message.sender === 'user' ? 'justify-end' : 'justify-start']"
        >
          <div
            :class="[
              'max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl',
              message.sender === 'user'
                ? 'bg-indigo-500 text-white rounded-tr-none'
                : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'
            ]"
          >
            <div class="flex items-start gap-2">
              <div v-if="message.sender === 'ai'" class="mt-0.5 text-purple-600">
                <Bot :size="16" />
              </div>
              <span>{{ message.text }}</span>
              <div v-if="message.sender === 'user'" class="mt-0.5 text-indigo-200">
                <User :size="16" />
              </div>
            </div>
          </div>
        </div>

        <!-- Loading indicator -->
        <div v-if="isLoading" class="flex justify-start">
          <div class="bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
            </div>
          </div>
        </div>

        <div ref="messagesEndRef" />
      </div>

      <!-- Input -->
      <div class="p-4 border-t border-gray-200 bg-white">
        <div class="flex gap-2">
          <textarea
            v-model="input"
            @keydown="handleKeyPress"
            placeholder="اكتب رسالتك هنا..."
            class="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows="1"
            :disabled="isLoading"
          />
          <button
            @click="handleSend"
            :disabled="!input.trim() || isLoading"
            class="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send :size="20" />
          </button>
        </div>
        <p class="text-center text-xs text-gray-500 mt-2">
          هذه واجهة تجريبية محلية - لا تتصل بأي خادوم خارجي
        </p>
      </div>
    </div>

    <div class="mt-6 text-center text-gray-600 max-w-2xl">
      <p class="text-sm">
        ✨ هذه الواجهة تعمل بالكامل في متصفحك! لا حاجة لروابط خارجية أو اتصال بالخادوم.
        <br />
        يمكنك استخدامها مباشرة — كل ما تكتبه يبقى محليًا على جهازك.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { Send, Bot, User, Sparkles } from 'lucide-vue-next'

const messages = ref([
  { id: 1, text: "مرحباً! أنا وجدان، مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟", sender: 'ai' }
])
const input = ref('')
const isLoading = ref(false)
const messagesEndRef = ref(null)

const scrollToBottom = () => {
  if (messagesEndRef.value) {
    messagesEndRef.value.scrollIntoView({ behavior: 'smooth' })
  }
}

watch(messages, async () => {
  await nextTick()
  scrollToBottom()
}, { deep: true })

const simulateAIResponse = (userMessage) => {
  const responses = [
    "فهمت ما تقصد. دعني أفكر قليلاً...",
    "سؤال ممتاز! إليك ما أعرفه عن هذا الموضوع.",
    "بناءً على معرفتي، أنصحك بما يلي...",
    "يمكنني مساعدتك في ذلك! هل تريد التفاصيل الآن؟",
    "أحسنت! هذا بالضبط ما أبحث عنه.",
    "سأبذل قصارى جهدي للإجابة بدقة.",
    "هل تقصد كذا وكذا؟ أخبرني إن كنت بحاجة لتوضيح أكثر."
  ]
  return responses[Math.floor(Math.random() * responses.length)]
}

const handleSend = async () => {
  if (!input.value.trim() || isLoading.value) return

  const userMessage = { id: Date.now(), text: input.value, sender: 'user' }
  messages.value.push(userMessage)
  const userInput = input.value
  input.value = ''
  isLoading.value = true

  // Simulate AI thinking delay
  setTimeout(() => {
    const aiMessage = {
      id: Date.now() + 1,
      text: simulateAIResponse(userInput),
      sender: 'ai'
    }
    messages.value.push(aiMessage)
    isLoading.value = false
  }, 1000)
}

const handleKeyPress = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}
</script>
