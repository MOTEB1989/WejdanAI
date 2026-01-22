<template>
  <main class="relative flex flex-col items-center justify-center min-h-screen py-10 px-4">
    <div class="w-full max-w-2xl">
      <h1 class="pt-4 pb-8 bg-gradient-to-br dark:from-white from-black via-[#707070] to-[#ffffff] bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-5xl">
        WejdanAI Chat
      </h1>
      
      <div class="w-full p-6 mx-auto rounded-lg shadow-xl dark:bg-white/10 bg-white/30 ring-1 ring-gray-900/5 backdrop-blur-lg">
        <div class="flex flex-col space-y-4 mb-4 h-96 overflow-y-auto" ref="chatContainer">
          <div v-for="(message, index) in messages" :key="index" 
               :class="[
                 'p-3 rounded-lg max-w-[80%]',
                 message.role === 'user' 
                   ? 'bg-blue-500 text-white self-end ml-auto' 
                   : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white self-start'
               ]">
            <p class="text-sm">{{ message.content }}</p>
          </div>
          
          <div v-if="isTyping" class="p-3 rounded-lg max-w-[80%] bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white self-start">
            <p class="text-sm">Typing...</p>
          </div>
        </div>
        
        <div class="flex space-x-2">
          <input
            v-model="userInput"
            @keyup.enter="sendMessage"
            type="text"
            placeholder="Type your message..."
            class="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            @click="sendMessage"
            :disabled="!userInput.trim() || isTyping"
            class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
      
      <div class="mt-6 text-center">
        <NuxtLink to="/" class="text-blue-500 hover:text-blue-600 underline">
          Back to Home
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const messages = ref([
  {
    role: 'assistant',
    content: 'Hello! I am WejdanAI. How can I help you today?'
  }
])

const userInput = ref('')
const isTyping = ref(false)
const chatContainer = ref(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

const sendMessage = async () => {
  if (!userInput.value.trim() || isTyping.value) return
  
  const message = userInput.value.trim()
  messages.value.push({
    role: 'user',
    content: message
  })
  
  userInput.value = ''
  isTyping.value = true
  scrollToBottom()
  
  // Simulate AI response
  setTimeout(() => {
    const responses = [
      "That's an interesting question! Let me help you with that.",
      "I understand. Here's what I can tell you about that...",
      "Great question! Based on my knowledge, I can share that...",
      "I'm here to assist you. Let me provide some information...",
      "Thank you for asking! Here's my response..."
    ]
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    
    messages.value.push({
      role: 'assistant',
      content: randomResponse
    })
    
    isTyping.value = false
    scrollToBottom()
  }, 1000 + Math.random() * 1000)
}

scrollToBottom()
</script>
