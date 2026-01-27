<template>
  <div class="chat-container">
    <header class="chat-header">
      <h1>WejdanAI Chat</h1>
      <p class="subtitle">مساعد ذكي ثنائي اللغة | Bilingual AI Assistant</p>
    </header>

    <main class="chat-main">
      <!-- Messages Area -->
      <div class="messages-area" ref="messagesArea">
        <div v-if="messages.length === 0" class="welcome-message">
          <p>👋 مرحباً! كيف يمكنني مساعدتك اليوم؟</p>
          <p>Hello! How can I help you today?</p>
        </div>

        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message', msg.role]"
        >
          <div class="message-content">
            <span class="message-role">{{ msg.role === 'user' ? '👤' : '🤖' }}</span>
            <p>{{ msg.content }}</p>
          </div>
        </div>

        <div v-if="loading" class="message assistant loading">
          <div class="message-content">
            <span class="message-role">🤖</span>
            <p class="typing-indicator">
              <span></span><span></span><span></span>
            </p>
          </div>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="error-banner">
        ⚠️ {{ error }}
        <button @click="error = ''" class="dismiss-btn">&times;</button>
      </div>

      <!-- Input Form -->
      <form @submit.prevent="sendMessage" class="chat-form">
        <textarea
          v-model="userInput"
          :disabled="loading"
          rows="3"
          placeholder="اكتب رسالتك هنا... | Type your message here..."
          @keydown.enter.exact.prevent="sendMessage"
          @keydown.enter.shift.exact="userInput += '\n'"
        ></textarea>
        <button type="submit" :disabled="loading || !userInput.trim()">
          {{ loading ? '...' : 'إرسال | Send' }}
        </button>
      </form>
    </main>

    <footer class="chat-footer">
      <p>Powered by WejdanAI</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatApiResponse {
  ok: boolean;
  reply?: string;
  error?: string;
}

const userInput = ref('');
const messages = ref<Message[]>([]);
const loading = ref(false);
const error = ref('');
const messagesArea = ref<HTMLElement | null>(null);

async function scrollToBottom() {
  await nextTick();
  if (messagesArea.value) {
    messagesArea.value.scrollTop = messagesArea.value.scrollHeight;
  }
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message || loading.value) return;

  // Clear input and error
  userInput.value = '';
  error.value = '';

  // Add user message
  messages.value.push({ role: 'user', content: message });
  await scrollToBottom();

  // Set loading state
  loading.value = true;

  try {
    const response = await $fetch<ChatApiResponse>('/api/chat', {
      method: 'POST',
      body: { message }
    });

    if (response.ok && response.reply) {
      messages.value.push({ role: 'assistant', content: response.reply });
    } else {
      error.value = response.error || 'حدث خطأ غير متوقع / Unexpected error occurred';
    }
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    error.value = `فشل الاتصال / Connection failed: ${errorMessage}`;
  } finally {
    loading.value = false;
    await scrollToBottom();
  }
}
</script>

<style scoped>
.chat-container {
  max-width: 800px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.chat-header {
  padding: 20px;
  text-align: center;
  color: white;
}

.chat-header h1 {
  margin: 0;
  font-size: 1.8rem;
}

.chat-header .subtitle {
  margin: 8px 0 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
}

.messages-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  max-height: calc(100vh - 280px);
}

.welcome-message {
  text-align: center;
  color: #666;
  padding: 40px 20px;
}

.welcome-message p {
  margin: 8px 0;
}

.message {
  margin-bottom: 16px;
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

.message-content {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  word-wrap: break-word;
}

.message.user .message-content {
  background: #667eea;
  color: white;
  flex-direction: row-reverse;
  border-bottom-right-radius: 4px;
}

.message.assistant .message-content {
  background: white;
  color: #333;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.message-role {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.message-content p {
  margin: 0;
  line-height: 1.5;
  white-space: pre-wrap;
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.error-banner {
  margin: 0 20px;
  padding: 12px 16px;
  background: #ffebee;
  color: #c62828;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dismiss-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #c62828;
  padding: 0 4px;
}

.chat-form {
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #eee;
  display: flex;
  gap: 12px;
}

.chat-form textarea {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 12px;
  resize: none;
  font-size: 1rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.chat-form textarea:focus {
  border-color: #667eea;
}

.chat-form textarea:disabled {
  background: #f5f5f5;
}

.chat-form button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}

.chat-form button:hover:not(:disabled) {
  opacity: 0.9;
}

.chat-form button:active:not(:disabled) {
  transform: scale(0.98);
}

.chat-form button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-footer {
  padding: 12px;
  text-align: center;
  color: white;
  font-size: 0.8rem;
  opacity: 0.8;
}

.chat-footer p {
  margin: 0;
}

/* Mobile responsiveness */
@media (max-width: 600px) {
  .chat-container {
    margin: 0;
  }

  .chat-header h1 {
    font-size: 1.5rem;
  }

  .messages-area {
    padding: 16px;
  }

  .message-content {
    max-width: 90%;
  }

  .chat-form {
    flex-direction: column;
  }

  .chat-form button {
    width: 100%;
  }
}
</style>
