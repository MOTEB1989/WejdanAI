/**
 * نظام المراقبة الذكي للكود المُولد
 * AI Code Monitoring System for WejdanAI
 */

import fs from 'fs'
import path from 'path'

/**
 * فئة مراقبة الكود الذكي
 */
export class AICodeMonitor {
  constructor() {
    this.metrics = {
      totalGenerations: 0,
      successfulGenerations: 0,
      failedGenerations: 0,
      averageResponseTime: 0,
      qualityScores: [],
      errorRate: 0,
      totalResponseTime: 0
    }

    this.history = []
    this.alerts = []
  }

  /**
   * مراقبة عملية توليد الكود
   */
  async monitorGeneration(prompt, generatedCode, responseTime = 0) {
    console.log('🔍 مراقبة توليد الكود...')

    try {
      // تحديث المقاييس
      this.metrics.totalGenerations++
      this.metrics.totalResponseTime += responseTime

      // تقييم الجودة
      const qualityScore = await this.assessCodeQuality(generatedCode)
      const securityScore = await this.assessSecurity(generatedCode)
      const performanceScore = await this.assessPerformance(generatedCode)

      // حساب الدرجة الإجمالية
      const overallScore = (qualityScore + securityScore + performanceScore) / 3

      // حفظ النتائج
      this.metrics.qualityScores.push(overallScore)

      if (overallScore >= 7) {
        this.metrics.successfulGenerations++
      } else {
        this.metrics.failedGenerations++
      }

      // حساب متوسط وقت الاستجابة
      this.metrics.averageResponseTime =
        this.metrics.totalResponseTime / this.metrics.totalGenerations

      // حساب معدل الخطأ
      this.metrics.errorRate =
        this.metrics.failedGenerations / this.metrics.totalGenerations

      // حفظ في السجل
      const record = {
        timestamp: new Date().toISOString(),
        prompt: prompt.substring(0, 100) + '...',
        qualityScore,
        securityScore,
        performanceScore,
        overallScore,
        responseTime,
        codeLength: generatedCode.length
      }

      this.history.push(record)

      // إرسال تنبيه إذا كانت الجودة منخفضة
      if (overallScore < 6) {
        await this.sendAlert('⚠️ جودة كود منخفضة', {
          prompt: prompt.substring(0, 100),
          score: overallScore,
          timestamp: new Date().toISOString()
        })
      }

      return {
        qualityScore,
        securityScore,
        performanceScore,
        overallScore
      }
    } catch (error) {
      console.error('❌ خطأ في المراقبة:', error)
      this.metrics.failedGenerations++
      return null
    }
  }

  /**
   * تقييم جودة الكود
   */
  async assessCodeQuality(code) {
    let score = 10

    // التحقق من طول الكود
    const lines = code.split('\n').length
    if (lines < 5) {
      score -= 1 // كود قصير جداً
    } else if (lines > 500) {
      score -= 2 // كود طويل جداً
    }

    // التحقق من التعليقات
    const commentLines = code.split('\n').filter(line =>
      line.trim().startsWith('//') || line.trim().startsWith('/*')
    ).length

    if (commentLines === 0 && lines > 50) {
      score -= 1 // لا توجد تعليقات في كود طويل
    }

    // التحقق من التنسيق
    const hasProperIndentation = this.checkIndentation(code)
    if (!hasProperIndentation) {
      score -= 1
    }

    // التحقق من تسمية المتغيرات
    const hasGoodNaming = this.checkNamingConventions(code)
    if (!hasGoodNaming) {
      score -= 1
    }

    return Math.max(0, Math.min(10, score))
  }

  /**
   * تقييم الأمان
   */
  async assessSecurity(code) {
    let score = 10

    // الأنماط الخطيرة
    const dangerousPatterns = [
      { pattern: /eval\s*\(/gi, severity: 3, name: 'eval()' },
      { pattern: /exec\s*\(/gi, severity: 3, name: 'exec()' },
      { pattern: /innerHTML\s*=/gi, severity: 2, name: 'innerHTML' },
      { pattern: /document\.write/gi, severity: 2, name: 'document.write' },
      { pattern: /dangerouslySetInnerHTML/gi, severity: 2, name: 'dangerouslySetInnerHTML' },
      { pattern: /localStorage\.setItem/gi, severity: 1, name: 'localStorage' }
    ]

    for (const { pattern, severity, name } of dangerousPatterns) {
      if (pattern.test(code)) {
        score -= severity
        console.log(`⚠️  نمط خطير مكتشف: ${name}`)
      }
    }

    // التحقق من التحقق من صحة المدخلات
    const hasInputValidation = /validate|sanitize|escape/i.test(code)
    if (!hasInputValidation && code.length > 200) {
      score -= 1
    }

    return Math.max(0, Math.min(10, score))
  }

  /**
   * تقييم الأداء
   */
  async assessPerformance(code) {
    let score = 10

    // الأنماط السيئة للأداء
    const performanceIssues = [
      { pattern: /for\s*\([^)]*\)\s*{[^}]*for\s*\(/gi, severity: 2, name: 'Nested loops' },
      { pattern: /querySelector(?!All)\s*\(/gi, severity: 1, name: 'querySelector in loop' },
      { pattern: /\+\s*=\s*["'`]/gi, severity: 1, name: 'String concatenation in loop' }
    ]

    for (const { pattern, severity, name } of performanceIssues) {
      const matches = code.match(pattern)
      if (matches && matches.length > 0) {
        score -= severity
        console.log(`⚠️  مشكلة أداء: ${name}`)
      }
    }

    // التحقق من استخدام const/let بدلاً من var
    const varUsage = (code.match(/\bvar\s+/g) || []).length
    if (varUsage > 0) {
      score -= 0.5
    }

    return Math.max(0, Math.min(10, score))
  }

  /**
   * التحقق من التنسيق
   */
  checkIndentation(code) {
    const lines = code.split('\n')
    let hasConsistentIndentation = true

    // فحص بسيط للتنسيق
    const indentations = lines
      .filter(line => line.trim().length > 0)
      .map(line => {
        const match = line.match(/^(\s*)/)
        return match ? match[1].length : 0
      })

    // التحقق من وجود تنسيق
    const hasIndentation = indentations.some(indent => indent > 0)

    return hasIndentation
  }

  /**
   * التحقق من تسمية المتغيرات
   */
  checkNamingConventions(code) {
    // البحث عن أسماء متغيرات سيئة
    const badNames = /\b(a|b|c|x|y|z|temp|tmp|foo|bar)\b/gi
    const matches = code.match(badNames)

    // إذا كان هناك أكثر من 3 أسماء سيئة، اعتبرها مشكلة
    return !matches || matches.length < 3
  }

  /**
   * إرسال تنبيه
   */
  async sendAlert(title, data) {
    const alert = {
      title,
      data,
      timestamp: new Date().toISOString(),
      level: data.score < 5 ? 'critical' : 'warning'
    }

    this.alerts.push(alert)

    console.log(`🔔 ${title}`)
    console.log('   البيانات:', JSON.stringify(data, null, 2))

    // يمكن إضافة إرسال إلى خدمات خارجية (Discord, Slack, etc.)
  }

  /**
   * توليد تقرير
   */
  generateReport() {
    const avgQuality = this.metrics.qualityScores.length > 0
      ? this.metrics.qualityScores.reduce((a, b) => a + b, 0) / this.metrics.qualityScores.length
      : 0

    const report = {
      metrics: {
        ...this.metrics,
        averageQuality: avgQuality.toFixed(2),
        successRate: (this.metrics.successfulGenerations / this.metrics.totalGenerations * 100).toFixed(2) + '%',
        errorRate: (this.metrics.errorRate * 100).toFixed(2) + '%'
      },
      recentHistory: this.history.slice(-10),
      alerts: this.alerts,
      recommendations: this.generateRecommendations(),
      trends: this.analyzeTrends()
    }

    return report
  }

  /**
   * توليد توصيات
   */
  generateRecommendations() {
    const recommendations = []

    const avgQuality = this.metrics.qualityScores.length > 0
      ? this.metrics.qualityScores.reduce((a, b) => a + b, 0) / this.metrics.qualityScores.length
      : 0

    if (avgQuality < 7) {
      recommendations.push('📉 متوسط الجودة منخفض - راجع معايير توليد الكود')
    }

    if (this.metrics.errorRate > 0.2) {
      recommendations.push('⚠️  معدل الخطأ مرتفع - فحص المدخلات والنماذج')
    }

    if (this.metrics.averageResponseTime > 5000) {
      recommendations.push('🐢 وقت الاستجابة بطيء - فكر في تحسين الأداء')
    }

    if (this.alerts.filter(a => a.level === 'critical').length > 0) {
      recommendations.push('🚨 تنبيهات حرجة - يتطلب إجراء فوري')
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ الأداء ممتاز - استمر!')
    }

    return recommendations
  }

  /**
   * تحليل الاتجاهات
   */
  analyzeTrends() {
    const recentScores = this.metrics.qualityScores.slice(-10)

    if (recentScores.length < 2) {
      return { trend: 'insufficient_data' }
    }

    const firstHalf = recentScores.slice(0, Math.floor(recentScores.length / 2))
    const secondHalf = recentScores.slice(Math.floor(recentScores.length / 2))

    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length

    const difference = avgSecond - avgFirst

    return {
      trend: difference > 0.5 ? 'improving' : difference < -0.5 ? 'declining' : 'stable',
      change: difference.toFixed(2),
      message: difference > 0.5
        ? '📈 الجودة تتحسن'
        : difference < -0.5
          ? '📉 الجودة تتراجع'
          : '➡️  الجودة مستقرة'
    }
  }

  /**
   * حفظ التقرير
   */
  async saveReport(filename = 'monitoring-report.json') {
    const report = this.generateReport()
    const reportsDir = path.join(process.cwd(), 'reports')

    // إنشاء المجلد إذا لم يكن موجوداً
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }

    const filepath = path.join(reportsDir, filename)

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2), 'utf-8')

    console.log(`✅ تم حفظ التقرير في: ${filepath}`)

    return filepath
  }

  /**
   * إعادة تعيين المقاييس
   */
  reset() {
    this.metrics = {
      totalGenerations: 0,
      successfulGenerations: 0,
      failedGenerations: 0,
      averageResponseTime: 0,
      qualityScores: [],
      errorRate: 0,
      totalResponseTime: 0
    }
    this.history = []
    this.alerts = []

    console.log('🔄 تم إعادة تعيين المقاييس')
  }
}

// تصدير instance واحد للاستخدام العام
export const codeMonitor = new AICodeMonitor()

export default AICodeMonitor
