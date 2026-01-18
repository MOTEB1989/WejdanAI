# Reasoning Orchestrator API

نظام متخصص لإدارة وتوجيه المهام المعقدة إلى نماذج الذكاء الاصطناعي المتخصصة في الاستدلال المتقدم والتفكير المنطقي.

## 🎯 Overview

**Reasoning Orchestrator** هو نظام منفصل عن **LLM Orchestrator** العادي، مصمم خصيصاً للمهام التي تتطلب:

- 🧮 استدلال رياضي متقدم
- 🧠 تفكير منطقي عميق
- 📊 تحليل معقد
- 💻 حل مسائل برمجية متقدمة
- 🔬 استدلال علمي

## 🤖 النماذج المدعومة

| Provider | Model | التخصص | Complexity Score |
|----------|-------|--------|------------------|
| **OpenAI o1** | o1-preview, o1-mini | استدلال شامل، رياضيات، علوم | 10/10 |
| **Gemini Deep Thinking** | gemini-2.0-flash-thinking-exp | تفكير عميق، متعدد الوسائط | 9/10 |
| **DeepSeek R1-0528** | deepseek-r1-0528 | استدلال متقدم، برمجة | 10/10 |
| **DeepSeek R1** | deepseek-reasoner | سلسلة التفكير، منطق | 9/10 |
| **Llama 3.1 405B** | Meta-Llama-3.1-405B-Instruct | متعدد اللغات، استدلال عام | 8/10 |

## 🚀 Quick Start

### 1. تشغيل الخادم

```bash
# تشغيل Reasoning Orchestrator على المنفذ 8001
python3 ReasoningOrchestrator

# أو باستخدام uvicorn مباشرة
uvicorn ReasoningOrchestrator:app --host 0.0.0.0 --port 8001
```

### 2. إعداد الاتصالات

```bash
# نسخ ملف الإعدادات المثالي
cp data/reasoning_connections.example.json data/reasoning_connections.json

# تعديل الملف وإضافة مفاتيح API الخاصة بك
nano data/reasoning_connections.json
```

### 3. مثال على الاستخدام

```bash
curl -X POST http://localhost:8001/api/reasoning/reason \
  -H "Content-Type: application/json" \
  -d '{
    "query": "إذا كان x^2 + 5x + 6 = 0، فما قيم x؟",
    "task_type": "mathematical",
    "preference": "accuracy",
    "enable_chain_tracking": true
  }'
```

## 📡 API Endpoints

### 1. GET `/`
معلومات عامة عن الخدمة

**Response:**
```json
{
  "service": "Reasoning Orchestrator",
  "version": "1.0.0",
  "description": "Advanced reasoning models orchestration for complex tasks"
}
```

### 2. GET `/api/reasoning/config`
الحصول على إعدادات النماذج

**Response:**
```json
{
  "connections": {
    "openai_o1": { ... },
    "gemini_thinking": { ... }
  },
  "supported_providers": { ... },
  "settings": {
    "default_preference": "accuracy",
    "enable_chain_tracking": true,
    "max_reasoning_time": 60
  }
}
```

### 3. POST `/api/reasoning/connections`
حفظ إعدادات الاتصالات

**Request Body:**
```json
{
  "openai_o1": {
    "provider": "openai_o1",
    "enabled": true,
    "api_key": "sk-...",
    "default_model": "o1-preview",
    "capabilities": ["math", "logic", "code"],
    "complexity_score": 10
  }
}
```

### 4. POST `/api/reasoning/reason` ⭐
تنفيذ مهمة استدلال

**Request Body:**
```json
{
  "query": "السؤال أو المهمة المطلوبة",
  "task_type": "mathematical",
  "preference": "accuracy",
  "context": {},
  "enable_chain_tracking": true,
  "max_iterations": 1
}
```

**Parameters:**

| Field | Type | Options | Description |
|-------|------|---------|-------------|
| `query` | string | - | السؤال أو المهمة |
| `task_type` | string | general, mathematical, logical, analytical, coding | نوع المهمة |
| `preference` | string | accuracy, complexity, speed, cost | أولوية التوجيه |
| `enable_chain_tracking` | boolean | true/false | تتبع خطوات التفكير |
| `max_iterations` | int | 1-10 | عدد التكرارات للاستدلال |

**Response:**
```json
{
  "answer": "الإجابة النهائية...",
  "provider": "openai_o1",
  "model": "o1-preview",
  "latency_ms": 3500,
  "reasoning_steps": [
    {
      "step_number": 1,
      "thought": "نحتاج لحل المعادلة التربيعية...",
      "conclusion": "باستخدام القانون العام...",
      "confidence": 0.95
    }
  ],
  "complexity_score": 7.5,
  "confidence_score": 0.92,
  "thinking_tokens": 1250
}
```

### 5. GET `/api/reasoning/logs`
الحصول على سجلات الاستدلال

**Query Parameters:**
- `limit`: عدد السجلات (افتراضي: 50)

**Response:**
```json
{
  "logs": [
    {
      "ts": 1737158400.123,
      "provider": "deepseek_r1_0528",
      "model": "deepseek-r1-0528",
      "latency": 4200,
      "task_type": "mathematical",
      "preference": "accuracy",
      "query_len": 150,
      "steps_count": 5,
      "thinking_tokens": 800
    }
  ]
}
```

### 6. GET `/api/reasoning/providers`
قائمة بجميع مقدمي الخدمة المدعومين

## 🎯 Routing Strategies

يختار النظام تلقائياً أفضل نموذج بناءً على:

### 1. Accuracy (الدقة)
أفضل للحصول على إجابات دقيقة ومفصلة

**Mathematical:**
```
DeepSeek R1-0528 → OpenAI o1 → Gemini Thinking → DeepSeek R1 → Llama 405B
```

**Logical:**
```
OpenAI o1 → DeepSeek R1-0528 → DeepSeek R1 → Gemini Thinking → Llama 405B
```

**Coding:**
```
DeepSeek R1-0528 → OpenAI o1 → Llama 405B → DeepSeek R1 → Gemini Thinking
```

### 2. Complexity (التعقيد)
للمهام المعقدة جداً
```
OpenAI o1 → DeepSeek R1-0528 → Llama 405B → DeepSeek R1 → Gemini Thinking
```

### 3. Speed (السرعة)
للحصول على إجابة سريعة
```
Gemini Thinking → DeepSeek R1 → Llama 405B → DeepSeek R1-0528 → OpenAI o1
```

### 4. Cost (التكلفة)
للحلول الاقتصادية
```
Llama 405B → DeepSeek R1 → DeepSeek R1-0528 → Gemini Thinking → OpenAI o1
```

## 📊 Use Cases

### مثال 1: حل معادلة رياضية

```python
import requests

response = requests.post("http://localhost:8001/api/reasoning/reason", json={
    "query": "If f(x) = x^3 - 6x^2 + 11x - 6, find all zeros of f(x)",
    "task_type": "mathematical",
    "preference": "accuracy",
    "enable_chain_tracking": true
})

result = response.json()
print(f"Answer: {result['answer']}")
print(f"Steps: {len(result['reasoning_steps'])}")
```

### مثال 2: تحليل منطقي

```javascript
const response = await fetch('http://localhost:8001/api/reasoning/reason', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "إذا كان كل الأطباء لديهم شهادات، وأحمد طبيب، فماذا يمكننا أن نستنتج عن أحمد؟",
    task_type: "logical",
    preference: "accuracy"
  })
});

const data = await response.json();
console.log(data.answer);
```

### مثال 3: حل مشكلة برمجية

```python
task = {
    "query": """
    Write an efficient algorithm to find the longest palindromic substring in a given string.
    Analyze time and space complexity.
    """,
    "task_type": "coding",
    "preference": "complexity",
    "enable_chain_tracking": true
}

response = requests.post("http://localhost:8001/api/reasoning/reason", json=task)
```

## 🔧 Configuration

### إعداد OpenAI o1

```json
{
  "openai_o1": {
    "provider": "openai_o1",
    "enabled": true,
    "api_key": "sk-proj-...",
    "default_model": "o1-preview",
    "capabilities": ["math", "logic", "code", "analysis", "scientific"],
    "reasoning_mode": "chain_of_thought",
    "max_thinking_time": 60,
    "complexity_score": 10
  }
}
```

### إعداد Gemini Deep Thinking

```json
{
  "gemini_thinking": {
    "provider": "gemini_thinking",
    "enabled": true,
    "api_key": "AIza...",
    "default_model": "gemini-2.0-flash-thinking-exp",
    "capabilities": ["math", "logic", "multimodal", "analysis"],
    "reasoning_mode": "deep_reasoning",
    "max_thinking_time": 45,
    "complexity_score": 9
  }
}
```

### إعداد DeepSeek R1

```json
{
  "deepseek_r1_0528": {
    "provider": "deepseek_r1_0528",
    "enabled": true,
    "api_key": "sk-...",
    "default_model": "deepseek-r1-0528",
    "capabilities": ["math", "logic", "code", "reasoning_chain", "enhanced"],
    "reasoning_mode": "chain_of_thought",
    "max_thinking_time": 50,
    "complexity_score": 10
  }
}
```

### إعداد Llama 3.1 405B (via Together AI)

```json
{
  "llama_405b": {
    "provider": "llama_405b",
    "enabled": true,
    "api_key": "your-together-ai-key",
    "endpoint": "https://api.together.xyz/v1/chat/completions",
    "default_model": "meta-llama/Meta-Llama-3.1-405B-Instruct",
    "capabilities": ["math", "logic", "code", "multilingual"],
    "reasoning_mode": "chain_of_thought",
    "max_thinking_time": 30,
    "complexity_score": 8
  }
}
```

## 📈 Features

### 1. Chain of Thought Tracking
تتبع خطوات التفكير المنطقي للنموذج

### 2. Automatic Provider Fallback
إذا فشل نموذج، ينتقل تلقائياً للنموذج التالي

### 3. Performance Logging
تسجيل تفصيلي لأداء كل نموذج

### 4. Complexity Scoring
تقييم تلقائي لمستوى تعقيد المهمة

### 5. Multi-Provider Support
دعم متعدد لمقدمي الخدمات المختلفين

## 🔐 Security

- جميع مفاتيح API مخزنة في ملفات JSON محلية
- يُنصح بعدم رفع `reasoning_connections.json` إلى Git
- استخدم متغيرات البيئة في الإنتاج

## 🆚 الفرق بين LLM Orchestrator و Reasoning Orchestrator

| Feature | LLM Orchestrator | Reasoning Orchestrator |
|---------|------------------|------------------------|
| **الهدف** | المهام العامة والمحادثات | المهام المعقدة والاستدلال |
| **النماذج** | GPT-4, Claude, Gemini | o1, DeepSeek-R1, Gemini Thinking |
| **Routing** | quality, speed, cost | accuracy, complexity, task-specific |
| **التتبع** | أساسي | Chain of Thought مفصل |
| **المنفذ** | 8000 | 8001 |

## 🚀 Production Deployment

```bash
# تشغيل في الخلفية باستخدام systemd
sudo nano /etc/systemd/system/reasoning-orchestrator.service
```

```ini
[Unit]
Description=Reasoning Orchestrator API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/home/user/WejdanAI
ExecStart=/usr/bin/python3 ReasoningOrchestrator
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable reasoning-orchestrator
sudo systemctl start reasoning-orchestrator
```

## 📝 License

MIT License

## 🤝 Contributing

للمساهمة في تطوير النظام، يُرجى:

1. Fork المشروع
2. إنشاء feature branch
3. Commit التغييرات
4. Push إلى البرانش
5. إنشاء Pull Request

---

**Built with ❤️ for WejdanAI**
