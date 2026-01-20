#!/bin/bash
# Quick verification script for WejdanAI
# سكريبت التحقق السريع لـ WejdanAI

echo "=================================================="
echo "WejdanAI Verification Script"
echo "سكريبت التحقق من WejdanAI"
echo "=================================================="
echo ""

# Check Node.js
echo "1. Checking Node.js installation..."
echo "1. التحقق من تثبيت Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "   ✅ Node.js is installed: $NODE_VERSION"
    echo "   ✅ Node.js مثبت: $NODE_VERSION"
else
    echo "   ❌ Node.js is not installed"
    echo "   ❌ Node.js غير مثبت"
    exit 1
fi
echo ""

# Check pnpm
echo "2. Checking pnpm installation..."
echo "2. التحقق من تثبيت pnpm..."
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    echo "   ✅ pnpm is installed: $PNPM_VERSION"
    echo "   ✅ pnpm مثبت: $PNPM_VERSION"
else
    echo "   ❌ pnpm is not installed. Installing..."
    echo "   ❌ pnpm غير مثبت. جاري التثبيت..."
    npm install -g pnpm
fi
echo ""

# Check Python
echo "3. Checking Python installation..."
echo "3. التحقق من تثبيت Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo "   ✅ Python is installed: $PYTHON_VERSION"
    echo "   ✅ Python مثبت: $PYTHON_VERSION"
else
    echo "   ⚠️  Python is not installed (optional for some features)"
    echo "   ⚠️  Python غير مثبت (اختياري لبعض المميزات)"
fi
echo ""

# Check if node_modules exists
echo "4. Checking dependencies..."
echo "4. التحقق من التبعيات..."
if [ -d "node_modules" ]; then
    echo "   ✅ Dependencies are installed"
    echo "   ✅ التبعيات مثبتة"
else
    echo "   ⚠️  Dependencies not installed. Run: pnpm install"
    echo "   ⚠️  التبعيات غير مثبتة. قم بتشغيل: pnpm install"
fi
echo ""

# Check if build output exists
echo "5. Checking build status..."
echo "5. التحقق من حالة البناء..."
if [ -d ".output" ]; then
    echo "   ✅ Project has been built"
    echo "   ✅ المشروع تم بناؤه"
else
    echo "   ℹ️  Project not built yet. Run: pnpm build"
    echo "   ℹ️  المشروع لم يُبنى بعد. قم بتشغيل: pnpm build"
fi
echo ""

# Show key files
echo "6. Verifying key files..."
echo "6. التحقق من الملفات الأساسية..."
FILES=(
    "app.vue"
    "pages/index.vue"
    "server/api/logs.ts"
    "server/api/get-users.ts"
    "ACCESS_GUIDE.md"
    "LOGGING_API.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file (missing / مفقود)"
    fi
done
echo ""

# Display access information
echo "=================================================="
echo "Access Information / معلومات الوصول"
echo "=================================================="
echo ""
echo "Production URL / رابط الإنتاج:"
echo "  🌐 https://wejdanai.vercel.app"
echo ""
echo "Local Development / التطوير المحلي:"
echo "  1. Run / قم بتشغيل: pnpm dev"
echo "  2. Open / افتح: http://localhost:3000"
echo ""
echo "API Endpoints / نقاط API:"
echo "  📝 Logs API: /api/logs"
echo "  👥 Users API: /api/get-users"
echo ""
echo "Documentation / الوثائق:"
echo "  📖 ACCESS_GUIDE.md - Full access guide / دليل الوصول الكامل"
echo "  📚 LOGGING_API.md - API documentation / وثائق API"
echo "  📘 README.md - Main documentation / الوثائق الرئيسية"
echo ""
echo "=================================================="
echo "✨ Verification complete / اكتمل التحقق"
echo "=================================================="
