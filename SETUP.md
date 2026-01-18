# 🚀 WejdanAI - دليل التشغيل السريع

دليل كامل لتشغيل نظام Reasoning Orchestrator والواجهة.

---

## 📋 المتطلبات الأساسية

### 1. Python 3.8+
```bash
python3 --version
```

### 2. Node.js 16+
```bash
node --version
npm --version
```

---

## ⚙️ خطوات التشغيل

### الخطوة 1: تثبيت المكتبات

#### Python Dependencies
```bash
pip3 install -r requirements.txt
```

سيتم تثبيت:
- `fastapi` - إطار عمل API
- `uvicorn` - خادم ASGI
- `httpx` - عميل HTTP async
- `pydantic` - التحقق من البيانات

#### Node.js Dependencies
```bash
npm install
# أو
pnpm install
```

---

### الخطوة 2: إعداد مفاتيح API

#### نسخ ملف الإعدادات
```bash
cp data/reasoning_connections.example.json data/reasoning_connections.json
```

#### تعديل الملف
```bash
nano data/reasoning_connections.json
# أو
code data/reasoning_connections.json
```

#### إضافة مفاتيحك

**مثال لـ OpenAI o1:**
```json
{
  "openai_o1": {
    "provider": "openai_o1",
    "enabled": true,
    "api_key": "sk-proj-YOUR-KEY-HERE",
    "default_model": "o1-preview"
  }
}
```

**مثال لـ Gemini Deep Thinking:**
```json
{
  "gemini_thinking": {
    "provider": "gemini_thinking",
    "enabled": true,
    "api_key": "AIza-YOUR-KEY-HERE",
    "default_model": "gemini-2.0-flash-thinking-exp"
  }
}
```

**مثال لـ DeepSeek R1:**
```json
{
  "deepseek_r1_0528": {
    "provider": "deepseek_r1_0528",
    "enabled": true,
    "api_key": "sk-YOUR-DEEPSEEK-KEY",
    "default_model": "deepseek-r1-0528"
  }
}
```

**للحصول على المفاتيح:**
- OpenAI: https://platform.openai.com/api-keys
- Google AI Studio: https://makersuite.google.com/app/apikey
- DeepSeek: https://platform.deepseek.com/api_keys

---

### الخطوة 3: تشغيل Reasoning Orchestrator

في نافذة طرفية جديدة:

```bash
python3 ReasoningOrchestrator
```

يجب أن ترى:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
```

#### اختبار الخادم:
```bash
curl http://localhost:8001/
```

يجب أن ترى:
```json
{
  "service": "Reasoning Orchestrator",
  "version": "1.0.0",
  "description": "Advanced reasoning models orchestration for complex tasks"
}
```

---

### الخطوة 4: تشغيل الواجهة (Nuxt)

في نافذة طرفية أخرى:

```bash
npm run dev
# أو
pnpm dev
```

يجب أن ترى:
```
  > Local:    http://localhost:3000/
  > Network:  use --host to expose
```

---

## 🌐 الوصول للواجهات

### 1. الواجهة الرئيسية (Operations)
```
http://localhost:3000/
```

### 2. Reasoning Assistant 🧠
```
http://localhost:3000/reasoning
```

### 3. Reasoning API
```
http://localhost:8001/
```

---

## 🧪 اختبار النظام

### اختبار سريع من المتصفح

1. افتح http://localhost:3000/reasoning
2. اختر **Task Type**: Mathematical
3. اختر **Preference**: Accuracy
4. اكتب: "Solve: x² + 5x + 6 = 0"
5. اضغط Send

### اختبار من Terminal

```bash
curl -X POST http://localhost:8001/api/reasoning/reason \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is 15 factorial?",
    "task_type": "mathematical",
    "preference": "accuracy",
    "enable_chain_tracking": true
  }'
```

---

## 📊 النماذج المتاحة

| Provider | Model | تفعيل |
|----------|-------|-------|
| OpenAI o1 | o1-preview | يتطلب مفتاح OpenAI |
| Gemini DT | gemini-2.0-flash-thinking-exp | يتطلب مفتاح Google |
| DeepSeek R1-0528 | deepseek-r1-0528 | يتطلب مفتاح DeepSeek |
| DeepSeek R1 | deepseek-reasoner | يتطلب مفتاح DeepSeek |
| Llama 405B | Meta-Llama-3.1-405B-Instruct | يتطلب Together AI |

---

## 🔧 إعدادات متقدمة

### تشغيل في الخلفية (Production)

#### باستخدام nohup:
```bash
nohup python3 ReasoningOrchestrator > reasoning.log 2>&1 &
```

#### باستخدام systemd:
```bash
sudo nano /etc/systemd/system/reasoning-orchestrator.service
```

```ini
[Unit]
Description=Reasoning Orchestrator API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/WejdanAI
ExecStart=/usr/bin/python3 ReasoningOrchestrator
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable reasoning-orchestrator
sudo systemctl start reasoning-orchestrator
sudo systemctl status reasoning-orchestrator
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: "No module named 'fastapi'"
**الحل:**
```bash
pip3 install fastapi uvicorn httpx pydantic
```

### المشكلة: "Connection refused" عند الاتصال بـ API
**الحل:**
```bash
# تأكد من تشغيل Reasoning Orchestrator
ps aux | grep ReasoningOrchestrator

# أو أعد تشغيله
python3 ReasoningOrchestrator
```

### المشكلة: "All providers failed"
**الحل:**
1. تحقق من ملف الإعدادات: `data/reasoning_connections.json`
2. تأكد من وجود مفتاح API واحد على الأقل
3. تأكد من أن `enabled: true` لأحد المقدمين
4. تحقق من صحة المفاتيح

### المشكلة: الواجهة لا تعمل
**الحل:**
```bash
# أعد تثبيت dependencies
rm -rf node_modules package-lock.json
npm install

# أعد تشغيل dev server
npm run dev
```

---

## 📈 مثال على الاستخدام الكامل

### 1. تشغيل Backend (طرفية 1)
```bash
cd /home/user/WejdanAI
python3 ReasoningOrchestrator
```

### 2. تشغيل Frontend (طرفية 2)
```bash
cd /home/user/WejdanAI
npm run dev
```

### 3. استخدام الواجهة
1. افتح: http://localhost:3000/reasoning
2. اختر **Preference**: Accuracy
3. اختر **Task Type**: Mathematical
4. اكتب سؤالك
5. شاهد الإجابة مع خطوات التفكير

---

## 🔐 ملاحظات أمنية

- ⚠️ لا تشارك مفاتيح API الخاصة بك
- ⚠️ لا ترفع `data/reasoning_connections.json` إلى Git
- ✅ استخدم `.gitignore` للحماية
- ✅ في الإنتاج، استخدم متغيرات البيئة

---

## 📚 مزيد من المعلومات

للتوثيق الكامل:
```
REASONING_ORCHESTRATOR.md
```

---

## ✅ قائمة التحقق النهائية

- [ ] تم تثبيت Python dependencies
- [ ] تم تثبيت Node.js dependencies
- [ ] تم نسخ وتعديل `reasoning_connections.json`
- [ ] تم إضافة مفتاح API واحد على الأقل
- [ ] Reasoning Orchestrator يعمل على المنفذ 8001
- [ ] Nuxt dev server يعمل على المنفذ 3000
- [ ] تم اختبار الواجهة بنجاح

---

**🎉 الآن أنت جاهز لاستخدام Reasoning Assistant!**
