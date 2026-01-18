# 💬 دليل واجهة الدردشة - WejdanAI

دليل شامل لاستخدام وتطوير واجهة الدردشة الذكية المدعومة بالذكاء الاصطناعي.

---

## 📋 جدول المحتويات

- [نظرة عامة](#نظرة-عامة)
- [البدء السريع](#البدء-السريع)
- [المكونات](#المكونات)
- [API Endpoints](#api-endpoints)
- [Composables](#composables)
- [التكوين](#التكوين)
- [الميزات](#الميزات)
- [الأمثلة](#الأمثلة)
- [استكشاف الأخطاء](#استكشاف-الأخطاء)

---

## 🎯 نظرة عامة

واجهة دردشة ذكية متكاملة توفر:

- 💬 **دردشة في الوقت الفعلي** مع الذكاء الاصطناعي
- 🔄 **Streaming** للردود الطويلة
- 📚 **حفظ تلقائي** للمحادثات
- 🎨 **تصميم عصري** responsive
- 🌙 **وضع ليلي** كامل
- 📝 **دعم Markdown** و syntax highlighting
- 🔌 **تكامل متعدد** مع OpenAI, DeepSeek, Gemini

---

## 🚀 البدء السريع

### 1. التثبيت

```bash
# تثبيت الاعتماديات
pnpm install

# إعداد المتغيرات البيئية
cp .env.example .env

# أضف API Keys
echo "OPENAI_API_KEY=sk-..." >> .env
echo "DEEPSEEK_API_KEY=sk-..." >> .env
echo "GEMINI_API_KEY=..." >> .env
```

### 2. تشغيل التطبيق

```bash
# تطوير محلي
pnpm dev

# الوصول إلى واجهة الدردشة
# http://localhost:3000/chat
```

### 3. الاستخدام الأساسي

1. افتح `/chat`
2. اكتب رسالتك في حقل الإدخال
3. اضغط Enter أو زر الإرسال 🚀
4. شاهد الرد يظهر تدريجياً

---

## 🧩 المكونات

### البنية الهيكلية

```
pages/
└── chat/
    └── index.vue          # الصفحة الرئيسية للدردشة

components/chat/
├── MessageBubble.vue      # فقاعة الرسالة
├── MessageInput.vue       # حقل الإدخال
├── ChatSidebar.vue        # الشريط الجانبي
├── TypingIndicator.vue    # مؤشر الكتابة
└── ChatWelcome.vue        # شاشة الترحيب

composables/
├── useChat.ts             # منطق الدردشة
└── useChatHistory.ts      # إدارة السجل

server/api/chat/
├── message.post.ts        # إرسال رسالة
├── stream.post.ts         # streaming
└── conversations.get.ts   # جلب المحادثات

server/utils/
└── ai-orchestrator.ts     # تنسيق AI
```

---

## 📡 API Endpoints

### 1. POST `/api/chat/message`

إرسال رسالة والحصول على رد كامل (غير streaming).

**الطلب:**
```typescript
{
  "prompt": "اشرح لي async/await",
  "settings": {
    "model": "gpt-4",
    "temperature": 0.7,
    "maxTokens": 2000,
    "systemPrompt": "أنت مساعد برمجة ذكي"
  }
}
```

**الاستجابة:**
```typescript
{
  "success": true,
  "message": {
    "id": "123456",
    "role": "assistant",
    "content": "async/await هو...",
    "timestamp": "2024-01-18T...",
    "metadata": {
      "model": "gpt-4",
      "tokens": 150,
      "responseTime": 2500
    }
  }
}
```

**مثال:**
```typescript
const response = await $fetch('/api/chat/message', {
  method: 'POST',
  body: {
    prompt: 'اكتب لي كود Python',
    settings: { model: 'gpt-4' }
  }
})
```

---

### 2. POST `/api/chat/stream`

إرسال رسالة والحصول على رد streaming (Server-Sent Events).

**الطلب:**
```typescript
{
  "prompt": "اشرح الذكاء الاصطناعي بالتفصيل",
  "settings": {
    "model": "gpt-4",
    "temperature": 0.7
  }
}
```

**الاستجابة (SSE):**
```
data: {"content":"الذكاء","done":false}

data: {"content":" الاصطناعي","done":false}

data: [DONE]
```

**مثال:**
```typescript
const response = await fetch('/api/chat/stream', {
  method: 'POST',
  body: JSON.stringify({ prompt: '...', settings: {...} })
})

const reader = response.body.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  const chunk = decoder.decode(value)
  // معالجة الـ chunk
}
```

---

### 3. GET `/api/chat/conversations`

جلب المحادثات السابقة من قاعدة البيانات.

**Query Parameters:**
- `limit` (number): عدد المحادثات (افتراضي: 50)
- `offset` (number): offset للـ pagination (افتراضي: 0)

**الاستجابة:**
```typescript
{
  "success": true,
  "conversations": [
    {
      "id": "1",
      "title": "كيف أتعلم البرمجة؟",
      "messages": [...],
      "timestamp": "2024-01-18T..."
    }
  ],
  "total": 25
}
```

---

## 🔧 Composables

### `useChat()`

المنطق الأساسي للدردشة.

**الاستخدام:**
```typescript
const {
  settings,
  sendChatMessage,
  streamMessage,
  stopStream,
  updateSettings
} = useChat()

// إرسال رسالة
const message = await sendChatMessage('اكتب لي كود')

// Streaming
await streamMessage('اشرح...', (chunk) => {
  console.log(chunk)
})

// إيقاف
stopStream()

// تحديث الإعدادات
updateSettings({ temperature: 0.9 })
```

**الدوال:**

#### `sendChatMessage(prompt, options?)`
- **المدخلات:** `prompt: string`, `options?: ChatSettings`
- **المخرجات:** `Promise<Message>`
- **الوصف:** إرسال رسالة والحصول على رد كامل

#### `streamMessage(prompt, onChunk, options?)`
- **المدخلات:**
  - `prompt: string`
  - `onChunk: (chunk: string) => void`
  - `options?: ChatSettings`
- **المخرجات:** `Promise<void>`
- **الوصف:** إرسال رسالة واستقبال streaming

#### `stopStream()`
- **الوصف:** إيقاف الـ streaming الحالي

#### `updateSettings(newSettings)`
- **المدخلات:** `newSettings: Partial<ChatSettings>`
- **الوصف:** تحديث إعدادات الدردشة

---

### `useChatHistory()`

إدارة المحادثات السابقة.

**الاستخدام:**
```typescript
const {
  getConversations,
  saveConversation,
  deleteConversation,
  exportConversations,
  importConversations
} = useChatHistory()

// جلب جميع المحادثات
const convs = await getConversations()

// حفظ محادثة
await saveConversation({
  id: '123',
  title: 'محادثة جديدة',
  messages: [...],
  timestamp: new Date()
})

// حذف
await deleteConversation('123')

// تصدير
const json = await exportConversations()

// استيراد
await importConversations(json)
```

---

## ⚙️ التكوين

### متغيرات البيئة (.env)

```bash
# قاعدة البيانات (مطلوب)
POSTGRES_URL=postgresql://...

# AI Providers (اختياري - حسب الحاجة)
OPENAI_API_KEY=sk-...
DEEPSEEK_API_KEY=sk-...
GEMINI_API_KEY=...

# إعدادات إضافية
NODE_ENV=development
```

### إعدادات الدردشة

```typescript
interface ChatSettings {
  model: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'gemini-pro' | 'deepseek-chat'
  temperature: number       // 0.0 - 2.0 (0.7 افتراضي)
  maxTokens: number         // الحد الأقصى للرموز (2000 افتراضي)
  systemPrompt?: string     // نظام التوجيه
  streaming: boolean        // تفعيل streaming (true افتراضي)
}
```

---

## ✨ الميزات

### 1. Streaming في الوقت الفعلي

الردود تظهر تدريجياً حرفاً بحرف:

```typescript
await streamMessage('اشرح...', (chunk) => {
  messageContent.value += chunk
})
```

### 2. دعم Markdown

الرسائل تدعم:
- **نصوص غامقة** و *مائلة*
- `كود inline`
- ```كتل كود مع syntax highlighting```
- قوائم نقطية ومرقمة
- روابط وصور

### 3. حفظ تلقائي

جميع المحادثات تُحفظ تلقائياً في:
- **localStorage** للوصول السريع
- **قاعدة البيانات** للأرشفة الدائمة

### 4. اختصارات لوحة المفاتيح

- `Enter` - إرسال الرسالة
- `Shift + Enter` - سطر جديد
- `Ctrl/Cmd + K` - محادثة جديدة (قريباً)

### 5. وضع ليلي

تبديل تلقائي بناءً على تفضيلات النظام.

---

## 💡 الأمثلة

### مثال 1: دردشة بسيطة

```vue
<template>
  <div>
    <input v-model="prompt" @keyup.enter="send" />
    <button @click="send">إرسال</button>
    <div v-html="response" />
  </div>
</template>

<script setup>
const { sendChatMessage } = useChat()
const prompt = ref('')
const response = ref('')

const send = async () => {
  const message = await sendChatMessage(prompt.value)
  response.value = message.content
  prompt.value = ''
}
</script>
```

### مثال 2: Streaming

```vue
<template>
  <div>
    <input v-model="prompt" @keyup.enter="stream" />
    <button @click="stream">إرسال</button>
    <button @click="stop">إيقاف</button>
    <div>{{ response }}</div>
  </div>
</template>

<script setup>
const { streamMessage, stopStream } = useChat()
const prompt = ref('')
const response = ref('')

const stream = async () => {
  response.value = ''
  await streamMessage(prompt.value, (chunk) => {
    response.value += chunk
  })
}

const stop = () => {
  stopStream()
}
</script>
```

### مثال 3: السجل

```vue
<template>
  <div>
    <ul>
      <li v-for="conv in conversations" :key="conv.id">
        {{ conv.title }}
      </li>
    </ul>
  </div>
</template>

<script setup>
const { getConversations } = useChatHistory()
const conversations = ref([])

onMounted(async () => {
  conversations.value = await getConversations()
})
</script>
```

---

## 🐛 استكشاف الأخطاء

### الخطأ: "No provider available"

**الحل:**
```bash
# تأكد من إضافة API key واحد على الأقل
echo "OPENAI_API_KEY=sk-..." >> .env
```

### الخطأ: "Stream aborted"

**السبب:** المستخدم أوقف الـ streaming.

**الحل:** هذا سلوك طبيعي، لا يحتاج إجراء.

### الخطأ: "Database connection failed"

**الحل:**
```bash
# تحقق من POSTGRES_URL
echo $POSTGRES_URL
```

### الخطأ: "marked is not defined"

**الحل:**
```bash
# تثبيت marked
pnpm add marked
```

---

## 📊 المقاييس والأداء

### زمن الاستجابة المتوقع

| النموذج | متوسط الاستجابة | Streaming |
|---------|-----------------|-----------|
| GPT-4 | 3-5 ثوانٍ | نعم ✅ |
| GPT-3.5 | 1-2 ثانية | نعم ✅ |
| DeepSeek | 2-4 ثوانٍ | نعم ✅ |
| Gemini | 2-3 ثوانٍ | لا ❌ |

### استهلاك الذاكرة

- **المحادثات المحفوظة:** ~50 MB لكل 1000 محادثة
- **localStorage:** حد أقصى 5-10 MB (يعتمد على المتصفح)

---

## 🔒 الأمان

### حماية API Keys

```typescript
// ✅ صحيح - في server-side
const apiKey = process.env.OPENAI_API_KEY

// ❌ خطأ - لا تضع في client-side
const apiKey = 'sk-...'
```

### تنظيف المدخلات

```typescript
// تجنب XSS
const cleanPrompt = prompt.trim().replace(/<script>/gi, '')
```

---

## 🚀 التحسينات المستقبلية

- [ ] دعم الملفات (صور، PDF)
- [ ] بحث في المحادثات
- [ ] تصدير إلى PDF/Word
- [ ] مشاركة المحادثات
- [ ] أصوات ذكاء اصطناعي
- [ ] تكامل مع Notion
- [ ] أوضاع متخصصة (برمجة، كتابة، ترجمة)

---

## 📞 الدعم

للمشاكل أو الاقتراحات:

- **GitHub Issues:** [WejdanAI/issues](https://github.com/MOTEB1989/WejdanAI/issues)
- **التوثيق:** `/docs/CHAT_INTERFACE.md`
- **الأمثلة:** `/examples/chat`

---

## 📝 الترخيص

MIT License - WejdanAI Project

---

**تم التوليد آلياً بواسطة نظام WejdanAI** 🤖✨
