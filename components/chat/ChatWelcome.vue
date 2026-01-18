<template>
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="text-center max-w-2xl px-6">
      <!-- Logo/Icon -->
      <div class="mb-8">
        <div class="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
          <span class="text-5xl">🤖</span>
        </div>
      </div>

      <!-- Welcome Text -->
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        مرحباً بك في وجدان AI
      </h1>

      <p class="text-lg text-gray-600 dark:text-gray-400 mb-12">
        مساعدك الذكي المدعوم بالذكاء الاصطناعي للبرمجة والإبداع والتعلم
      </p>

      <!-- Features -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div class="text-4xl mb-3">💻</div>
          <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
            مساعد البرمجة
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            كتابة وتصحيح الأكواد البرمجية بجميع اللغات
          </p>
        </div>

        <div class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div class="text-4xl mb-3">📚</div>
          <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
            التعلم والشرح
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            شرح المفاهيم البرمجية والتقنية بطريقة مبسطة
          </p>
        </div>

        <div class="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div class="text-4xl mb-3">🚀</div>
          <h3 class="font-semibold text-gray-900 dark:text-white mb-2">
            حلول إبداعية
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            أفكار مبتكرة ومساعدة في حل المشكلات التقنية
          </p>
        </div>
      </div>

      <!-- Quick Examples -->
      <div class="text-right">
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          جرّب أحد هذه الأمثلة:
        </p>
        <div class="space-y-3">
          <div class="inline-block bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
            "اكتب لي كود Python لقراءة ملف CSV"
          </div>
          <div class="inline-block bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 mr-2">
            "اشرح لي مفهوم async/await في JavaScript"
          </div>
          <div class="inline-block bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
            "ساعدني في تصميم قاعدة بيانات لنظام مدرسي"
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
