# OpenChatAgent

Open source iOS chat app built with SwiftUI and Agent for repository caretaking.

## تشغيل محلي
1. افتح المشروع في Xcode 14+.
2. ضع مفتاح OpenAI API في مكان آمن مثل Keychain أو استخدم متغير بيئة أثناء التطوير.
3. شغّل التطبيق على المحاكي أو جهاز فعلي.

## إعداد GitHub
- أضف Secrets: `OPENAI_API_KEY`.
- فعّل GitHub Actions.

## ملاحظات أمان
- لا ترفع مفاتيح API إلى المستودع.
- فعّل Secret Scanning وDependabot.
