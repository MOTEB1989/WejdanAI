# دليل الوصول إلى واجهة WejdanAI / WejdanAI Access Guide

## 📸 لقطة شاشة للواجهة / Interface Screenshot

![WejdanAI Interface](https://github.com/user-attachments/assets/fe62ecdd-2a4d-41de-bc8d-873eebae3de4)

**الواجهة الرئيسية تعرض / Main Interface Shows:**
- لوحة تحكم العمليات المصرفية / Banking Operations Dashboard
- 6 أقسام رئيسية منظمة / 6 Organized Main Sections
- تصميم حديث ومتجاوب / Modern and Responsive Design
- نظام الأولويات (P1, P2, P3) / Priority System (P1, P2, P3)
- واجهة مظلمة احترافية / Professional Dark Theme

---

## 🌐 روابط الوصول / Access Links

### الإنتاج / Production
- **الرابط الرئيسي / Main URL**: https://wejdanai.vercel.app
- **واجهة الويب / Web Interface**: https://wejdanai.vercel.app
- **API للسجلات / Logs API**: https://wejdanai.vercel.app/api/logs
- **API للمستخدمين / Users API**: https://wejdanai.vercel.app/api/get-users

### التطوير المحلي / Local Development
- **الرابط المحلي / Local URL**: http://localhost:3000
- **API محلي / Local API**: http://localhost:3000/api/logs

---

## 📖 كيفية الوصول إلى التطبيق / How to Access the Application

### الوصول السريع / Quick Access

1. **للمستخدمين النهائيين / For End Users**:
   - افتح المتصفح / Open your browser
   - انتقل إلى / Go to: https://wejdanai.vercel.app
   - ستظهر لك واجهة المستخدم مباشرة / The user interface will appear directly

2. **للمطورين / For Developers**:
   ```bash
   # استنساخ المشروع / Clone the project
   git clone https://github.com/MOTEB1989/WejdanAI.git
   cd WejdanAI
   
   # تثبيت التبعيات / Install dependencies
   pnpm install
   
   # التحقق من الإعداد / Verify setup
   ./scripts/verify.sh
   
   # تشغيل خادم التطوير / Run development server
   pnpm dev
   
   # الوصول على / Access at: http://localhost:3000
   ```

3. **سكريبت التحقق السريع / Quick Verification Script**:
   ```bash
   # تشغيل سكريبت التحقق / Run verification script
   ./scripts/verify.sh
   
   # This will check / سيتحقق من:
   # ✅ Node.js installation
   # ✅ pnpm installation  
   # ✅ Python installation (optional)
   # ✅ Dependencies
   # ✅ Build status
   # ✅ Key files
   ```

---

## 💬 واجهة الدردشة و API السجلات / Chat Interface & Logs API

### نظام السجلات / Logging System

التطبيق يحتوي على نظام سجلات متكامل لتسجيل المحادثات مع الذكاء الاصطناعي:
The application has an integrated logging system for recording AI conversations:

#### إضافة سجل جديد / Add New Log

```bash
# مثال باستخدام cURL / Example using cURL
curl -X POST https://wejdanai.vercel.app/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "query": "ما هو الطقس اليوم؟",
    "response": "الجو مشمس في الرياض"
  }'
```

#### الحصول على جميع السجلات / Get All Logs

```bash
# جلب جميع السجلات / Fetch all logs
curl https://wejdanai.vercel.app/api/logs
```

### مثال بايثون / Python Example

```python
import requests

BASE_URL = "https://wejdanai.vercel.app/api/logs"

# إضافة سجل / Add log
response = requests.post(BASE_URL, json={
    "user_id": 1,
    "query": "ما هو الذكاء الاصطناعي؟",
    "response": "الذكاء الاصطناعي هو محاكاة الذكاء البشري في الآلات"
})
print(response.json())

# جلب السجلات / Fetch logs
logs = requests.get(BASE_URL).json()
print(f"عدد السجلات: {len(logs)}")
```

### مثال JavaScript / JavaScript Example

```javascript
// إضافة سجل / Add log
const response = await fetch('https://wejdanai.vercel.app/api/logs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 1,
    query: "كيف أتعلم البرمجة؟",
    response: "ابدأ بتعلم لغة Python أو JavaScript"
  })
});

const result = await response.json();
console.log(result);

// جلب السجلات / Fetch logs
const logsResponse = await fetch('https://wejdanai.vercel.app/api/logs');
const logs = await logsResponse.json();
console.log(logs);
```

---

## 👥 API المستخدمين / Users API

### نظام المستخدمين / Users System

التطبيق يحتوي على API لإدارة ملفات المستخدمين:
The application has an API for managing user profiles:

#### الحصول على المستخدمين / Get Users

```bash
# جلب جميع المستخدمين / Fetch all users
curl https://wejdanai.vercel.app/api/get-users
```

#### الاستجابة / Response

```json
{
  "users": [
    {
      "id": 1,
      "name": "User Name",
      "email": "user@example.com",
      "image": "https://example.com/image.jpg",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "duration": 45
}
```

### مثال بايثون / Python Example

```python
import requests

# جلب المستخدمين / Fetch users
response = requests.get("https://wejdanai.vercel.app/api/get-users")
data = response.json()

print(f"عدد المستخدمين: {len(data['users'])}")
print(f"المدة: {data['duration']}ms")

for user in data['users']:
    print(f"- {user['name']} ({user['email']})")
```

### مثال JavaScript / JavaScript Example

```javascript
// جلب المستخدمين / Fetch users
const response = await fetch('https://wejdanai.vercel.app/api/get-users');
const data = await response.json();

console.log(`Number of users: ${data.users.length}`);
console.log(`Duration: ${data.duration}ms`);

data.users.forEach(user => {
  console.log(`- ${user.name} (${user.email})`);
});
```

---

## 📋 النماذج والمكونات / Forms and Components

### واجهة المستخدم الرئيسية / Main User Interface

التطبيق يعرض لوحة تحكم للعمليات المصرفية تحتوي على:
The application displays an operations dashboard that includes:

1. **إدارة الطلبات / Demand Management**
   - تسجيل الطلبات / Request logging
   - تصنيف الطلبات / Request classification
   - تحديد الأولويات / Priority setting

2. **زيارات الفروع / Branch Visits**
   - جدول الزيارات / Visit schedule
   - المراقبة والمتابعة / Monitoring and follow-up

3. **إدارة الأداء / Performance Management**
   - مراقبة الآلات الذاتية / Self-service machine monitoring
   - إدارة المطالبات / Claims management

4. **الاجتماعات الإدارية / Management Meetings**
   - التحديثات الأسبوعية / Weekly updates
   - مؤشرات الأداء / Performance indicators

5. **الحوكمة والامتثال / Governance and Compliance**
   - جلسات التوعية / Awareness sessions
   - تقارير البنك المركزي / Central Bank reports

6. **إدارة المخاطر / Risk Management**
   - تقارير الاتجاهات / Trend reports
   - إدارة الحوادث / Incident management

### مكونات الواجهة / UI Components

- **جداول البيانات / Data Tables**: مكون `Table.vue` لعرض البيانات
  - Component `Table.vue` for displaying data
- **التنسيق / Styling**: Tailwind CSS للتصميم الحديث
  - Tailwind CSS for modern design
- **الاستجابة / Responsive**: تصميم متجاوب لجميع الأجهزة
  - Responsive design for all devices

---

## 🔧 إعداد البيئة / Environment Setup

### المتطلبات / Requirements

```bash
Node.js >= 18
pnpm
Python >= 3.8
PostgreSQL (للإنتاج / for production)
```

### المتغيرات البيئية / Environment Variables

قم بإنشاء ملف `.env` / Create a `.env` file:

```env
# قاعدة البيانات / Database
POSTGRES_URL=your_postgres_connection_string

# Notion (اختياري / optional)
NOTION_TOKEN=your_notion_token
DATABASE_ID=your_database_id

# Anthropic AI (اختياري / optional)
ANTHROPIC_API_KEY=your_anthropic_key
```

---

## 🚀 النشر / Deployment

### النشر على Vercel / Deploy to Vercel

1. **ربط المستودع / Connect Repository**:
   - اذهب إلى / Go to: https://vercel.com
   - انقر على "New Project" / Click "New Project"
   - اختر مستودع WejdanAI / Select WejdanAI repository

2. **إعداد المتغيرات البيئية / Setup Environment Variables**:
   - أضف `POSTGRES_URL` في لوحة Vercel
   - Add `POSTGRES_URL` in Vercel dashboard
   - أضف أي مفاتيح API أخرى مطلوبة
   - Add any other required API keys

3. **النشر / Deploy**:
   - انقر على "Deploy" / Click "Deploy"
   - انتظر حتى يكتمل البناء / Wait for build to complete
   - الوصول إلى التطبيق على / Access app at: `https://your-app.vercel.app`

---

## 📚 وثائق إضافية / Additional Documentation

- **API السجلات / Logs API**: راجع [LOGGING_API.md](LOGGING_API.md)
- **إعداد Anthropic**: راجع [docs/ANTHROPIC_SETUP.md](docs/ANTHROPIC_SETUP.md)
- **مزامنة Codex**: راجع [README_CODEX.md](README_CODEX.md)
- **الملف التمهيدي / Main README**: راجع [README.md](README.md)

---

## 🆘 المساعدة / Help

### مشاكل شائعة / Common Issues

1. **لا يمكن الوصول إلى التطبيق / Cannot Access Application**
   - تأكد من أن التطبيق قيد التشغيل / Ensure app is running
   - تحقق من الرابط الصحيح / Check the correct URL
   - امسح ذاكرة التخزين المؤقت للمتصفح / Clear browser cache

2. **API لا يعمل / API Not Working**
   - تحقق من اتصال قاعدة البيانات / Check database connection
   - تأكد من المتغيرات البيئية / Verify environment variables
   - راجع سجلات الخادم / Check server logs

3. **مشاكل في البناء / Build Issues**
   ```bash
   # إعادة تثبيت التبعيات / Reinstall dependencies
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   
   # إعادة البناء / Rebuild
   pnpm build
   ```

---

## 📞 الاتصال / Contact

للحصول على المساعدة أو الإبلاغ عن المشكلات:
For help or to report issues:

- **GitHub Issues**: https://github.com/MOTEB1989/WejdanAI/issues
- **Repository**: https://github.com/MOTEB1989/WejdanAI

---

## 📝 ملاحظات مهمة / Important Notes

- ✅ التطبيق متاح على الإنترنت على / App is available online at: https://wejdanai.vercel.app
- ✅ API السجلات يعمل بشكل كامل / Logs API is fully functional
- ✅ الواجهة تستجيب لجميع أحجام الشاشات / Interface is responsive to all screen sizes
- ✅ يدعم اللغة العربية والإنجليزية / Supports Arabic and English
- ⚠️ قاعدة البيانات مطلوبة للإنتاج / Database required for production
- ⚠️ المتغيرات البيئية يجب إعدادها بشكل صحيح / Environment variables must be set correctly

---

## 🎯 ملخص سريع / Quick Summary

### للوصول السريع / For Quick Access:
1. افتح / Open: https://wejdanai.vercel.app
2. استخدم API / Use API: https://wejdanai.vercel.app/api/logs
3. راجع الوثائق / Review docs: [README.md](README.md) و [LOGGING_API.md](LOGGING_API.md)

### للتطوير المحلي / For Local Development:
```bash
pnpm install
pnpm dev
# Open: http://localhost:3000
```

---

✨ **WejdanAI** - تطبيق ذكاء اصطناعي شامل / Comprehensive AI Application
