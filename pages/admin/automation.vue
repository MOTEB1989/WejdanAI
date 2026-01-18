<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          🤖 لوحة التحكم الآلية
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          مراقبة وإدارة أنظمة التكامل والنشر الآلي
        </p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="عمليات النشر"
          :value="stats.deployments"
          icon="🚀"
          color="blue"
          :trend="stats.deploymentTrend"
        />
        <StatCard
          title="الكود المُولد"
          :value="stats.generatedCode"
          icon="🤖"
          color="green"
          :trend="stats.codeTrend"
        />
        <StatCard
          title="جودة الكود"
          :value="stats.qualityScore + '/10'"
          icon="⭐"
          color="yellow"
          :trend="stats.qualityTrend"
        />
        <StatCard
          title="الاختبارات"
          :value="stats.testsPassed"
          icon="✅"
          color="purple"
          :trend="stats.testsTrend"
        />
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Recent Deployments -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
              آخر النشرات
            </h3>
            <button
              class="text-blue-600 hover:text-blue-700 text-sm font-medium"
              @click="refreshDeployments"
            >
              تحديث
            </button>
          </div>
          <DeploymentList :deployments="recentDeployments" />
        </div>

        <!-- Quality Monitor -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            مراقبة الجودة
          </h3>
          <QualityChart :data="qualityHistory" />
        </div>
      </div>

      <!-- Automation Controls -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Quick Actions -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            إجراءات سريعة
          </h3>
          <div class="space-y-3">
            <ActionButton
              icon="🚀"
              label="نشر جديد"
              description="تشغيل عملية نشر"
              @click="triggerDeployment"
            />
            <ActionButton
              icon="🧪"
              label="تشغيل الاختبارات"
              description="تشغيل جميع الاختبارات"
              @click="runTests"
            />
            <ActionButton
              icon="📊"
              label="توليد تقرير"
              description="إنشاء تقرير جودة"
              @click="generateReport"
            />
            <ActionButton
              icon="🔍"
              label="فحص الأمان"
              description="فحص الثغرات الأمنية"
              @click="runSecurityScan"
            />
          </div>
        </div>

        <!-- System Status -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            حالة النظام
          </h3>
          <div class="space-y-4">
            <StatusItem
              label="CI/CD Pipeline"
              :status="systemStatus.cicd"
            />
            <StatusItem
              label="Auto Deployment"
              :status="systemStatus.deployment"
            />
            <StatusItem
              label="Quality Checks"
              :status="systemStatus.quality"
            />
            <StatusItem
              label="Security Scan"
              :status="systemStatus.security"
            />
          </div>
        </div>

        <!-- Recent Alerts -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            التنبيهات الأخيرة
          </h3>
          <AlertList :alerts="recentAlerts" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Stats
const stats = ref({
  deployments: 24,
  generatedCode: 156,
  qualityScore: 8.5,
  testsPassed: '95%',
  deploymentTrend: '+12%',
  codeTrend: '+23%',
  qualityTrend: '+0.5',
  testsTrend: '+3%'
})

// Recent Deployments
const recentDeployments = ref([
  {
    id: 1,
    branch: 'main',
    status: 'success',
    timestamp: '2024-01-18 14:30',
    duration: '2m 45s',
    environment: 'production'
  },
  {
    id: 2,
    branch: 'develop',
    status: 'success',
    timestamp: '2024-01-18 12:15',
    duration: '2m 30s',
    environment: 'staging'
  },
  {
    id: 3,
    branch: 'feature/ai-review',
    status: 'failed',
    timestamp: '2024-01-18 10:00',
    duration: '1m 15s',
    environment: 'staging'
  }
])

// Quality History
const qualityHistory = ref([
  { date: '2024-01-14', score: 8.2 },
  { date: '2024-01-15', score: 8.4 },
  { date: '2024-01-16', score: 8.3 },
  { date: '2024-01-17', score: 8.5 },
  { date: '2024-01-18', score: 8.5 }
])

// System Status
const systemStatus = ref({
  cicd: 'operational',
  deployment: 'operational',
  quality: 'operational',
  security: 'operational'
})

// Recent Alerts
const recentAlerts = ref([
  {
    id: 1,
    type: 'warning',
    message: 'جودة كود منخفضة في ملف server/api/test.ts',
    timestamp: '2024-01-18 13:45'
  },
  {
    id: 2,
    type: 'info',
    message: 'تم تحديث الاعتماديات بنجاح',
    timestamp: '2024-01-18 10:30'
  }
])

// Actions
const triggerDeployment = () => {
  console.log('🚀 تشغيل النشر...')
  // Logic here
}

const runTests = () => {
  console.log('🧪 تشغيل الاختبارات...')
  // Logic here
}

const generateReport = () => {
  console.log('📊 توليد التقرير...')
  // Logic here
}

const runSecurityScan = () => {
  console.log('🔍 فحص الأمان...')
  // Logic here
}

const refreshDeployments = () => {
  console.log('🔄 تحديث النشرات...')
  // Logic here
}

onMounted(() => {
  console.log('📊 تحميل لوحة التحكم الآلية...')
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
