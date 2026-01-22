<template>
  <main
    class="relative flex flex-col items-center justify-center min-h-screen py-10 px-4"
  >
    <div class="w-full max-w-2xl">
      <h1
        class="pt-4 pb-8 bg-gradient-to-br dark:from-white from-black via-[#707070] to-[#ffffff] bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-6xl"
      >
        Vercel AI Demo
      </h1>
      <p class="text-center text-gray-600 dark:text-gray-300 mb-8">
        This is a demo page showcasing Vercel AI SDK integration with Tailwind CSS.
      </p>
      
      <div
        class="w-full p-8 rounded-lg shadow-xl dark:bg-white/10 bg-white/30 ring-1 ring-gray-900/5 backdrop-blur-lg"
      >
        <h2 class="text-2xl font-semibold mb-4">AI Chat Example</h2>
        <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
          To enable AI features, set your <code class="px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded">OPENAI_API_KEY</code> 
          environment variable and restart the server.
        </p>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">
              Try it out:
            </label>
            <textarea
              v-model="message"
              class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Type a message..."
            ></textarea>
          </div>
          
          <button
            @click="sendMessage"
            :disabled="loading || !message.trim()"
            class="w-full px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ loading ? 'Sending...' : 'Send Message' }}
          </button>
          
          <div v-if="response" class="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
            <p class="text-sm font-medium mb-2">Response:</p>
            <p class="text-sm">{{ response }}</p>
          </div>
          
          <div v-if="error" class="p-4 rounded-lg bg-red-100 dark:bg-red-900/30">
            <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
          </div>
        </div>
      </div>
      
      <div class="mt-8 text-center">
        <NuxtLink
          to="/"
          class="px-6 py-2 text-sm font-medium text-gray-600 transition-all rounded-full shadow-sm bg-white/30 dark:bg-white/80 ring-1 ring-gray-900/5 dark:text-black hover:shadow-lg active:shadow-sm inline-block"
        >
          ← Back to Home
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

<script setup>
const message = ref('')
const response = ref('')
const error = ref('')
const loading = ref(false)

const sendMessage = async () => {
  if (!message.value.trim()) return
  
  loading.value = true
  error.value = ''
  response.value = ''
  
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: message.value }
        ]
      })
    })
    
    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.statusMessage || 'Failed to get response')
    }
    
    // For now, just show that the endpoint is reachable
    // In a real app, you'd handle streaming responses
    response.value = 'AI endpoint is configured! (Note: Streaming response handling requires additional client-side setup)'
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
