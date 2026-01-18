<template>
  <div class="flex justify-start">
    <div class="max-w-[80%] rounded-2xl px-6 py-4 bg-gray-100 dark:bg-gray-700">
      <div class="flex items-center space-x-3 rtl:space-x-reverse">
        <div class="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
          <span class="text-lg">🤖</span>
        </div>
        <div class="flex items-center space-x-2 rtl:space-x-reverse">
          <div class="typing-dot"></div>
          <div class="typing-dot" style="animation-delay: 0.2s"></div>
          <div class="typing-dot" style="animation-delay: 0.4s"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #6b7280;
  animation: typing 1.4s infinite;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.dark .typing-dot {
  background-color: #9ca3af;
}
</style>
