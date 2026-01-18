#!/usr/bin/env python3
"""
مفحص جودة الكود باستخدام الذكاء الاصطناعي
AI Code Quality Checker for WejdanAI
"""

import os
import json
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime

class AICodeQualityChecker:
    """فاحص جودة الكود الذكي"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("DEEPSEEK_API_KEY")
        self.base_url = "https://api.deepseek.com/v1"
        self.project_root = Path.cwd()

    def analyze_file(self, file_path: str) -> Dict[str, Any]:
        """تحليل ملف واحد"""

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                code = f.read()
        except Exception as e:
            return {
                "file": file_path,
                "error": str(e),
                "status": "failed"
            }

        # تحليل بسيط (يمكن تعزيزه بـ API الذكاء الاصطناعي)
        analysis = {
            "file": file_path,
            "lines": len(code.split('\n')),
            "size": len(code),
            "issues": [],
            "status": "analyzed"
        }

        # فحص الأنماط الخطيرة
        dangerous_patterns = [
            ("eval(", "استخدام eval() خطير"),
            ("exec(", "استخدام exec() خطير"),
            ("innerHTML =", "استخدام innerHTML قد يسبب XSS"),
            ("document.write", "استخدام document.write غير موصى به"),
        ]

        for pattern, message in dangerous_patterns:
            if pattern in code:
                analysis["issues"].append({
                    "type": "security",
                    "pattern": pattern,
                    "message": message
                })

        return analysis

    def check_security(self, code: str) -> List[Dict[str, str]]:
        """فحص الثغرات الأمنية"""

        security_issues = []

        # أنماط خطيرة
        dangerous_patterns = {
            "eval(": "استخدام eval() يمكن أن يسبب تنفيذ كود خطير",
            "exec(": "استخدام exec() خطير",
            "innerHTML =": "قد يسبب XSS",
            "localStorage.setItem": "قد يخزن بيانات حساسة",
            "document.write": "غير آمن ويؤثر على الأداء",
            "setTimeout(eval": "مزيج خطير جداً",
            "sql.concat(": "قد يسبب SQL Injection",
        }

        for pattern, description in dangerous_patterns.items():
            if pattern in code:
                security_issues.append({
                    "pattern": pattern,
                    "severity": "high" if "eval" in pattern else "medium",
                    "description": description
                })

        return security_issues

    def calculate_complexity_score(self, file_path: str) -> int:
        """حساب درجة التعقيد"""

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                code = f.read()

            # حساب بسيط للتعقيد
            lines = len(code.split('\n'))

            # الملفات الأصغر تحصل على درجات أفضل
            if lines < 100:
                return 10
            elif lines < 200:
                return 9
            elif lines < 300:
                return 8
            elif lines < 500:
                return 7
            else:
                return 6

        except Exception:
            return 5

    def calculate_security_score(self, file_path: str) -> int:
        """حساب درجة الأمان"""

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                code = f.read()

            issues = self.check_security(code)

            # البدء بدرجة 10 وخصم نقاط لكل مشكلة
            score = 10
            for issue in issues:
                if issue["severity"] == "high":
                    score -= 2
                elif issue["severity"] == "medium":
                    score -= 1

            return max(0, score)

        except Exception:
            return 5

    def calculate_maintainability_score(self, file_path: str) -> int:
        """حساب درجة قابلية الصيانة"""

        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                code = f.read()

            lines = code.split('\n')

            # عوامل قابلية الصيانة
            score = 10

            # الملفات الطويلة جداً
            if len(lines) > 500:
                score -= 2

            # السطور الطويلة
            long_lines = sum(1 for line in lines if len(line) > 120)
            if long_lines > len(lines) * 0.2:
                score -= 1

            # التعليقات (وجود تعليقات يحسن القابلية للصيانة)
            comments = sum(1 for line in lines if '//' in line or '/*' in line)
            if comments < len(lines) * 0.05:
                score -= 1

            return max(0, score)

        except Exception:
            return 5

    def generate_report(self, directory: str = ".") -> Dict[str, Any]:
        """توليد تقرير شامل"""

        report = {
            "timestamp": datetime.now().isoformat(),
            "files_analyzed": 0,
            "total_issues": 0,
            "issues": [],
            "scores": {},
            "summary": {},
            "recommendations": []
        }

        # البحث عن الملفات
        extensions = ['.js', '.ts', '.vue', '.py']
        files_to_analyze = []

        for root, dirs, files in os.walk(directory):
            # تجاهل مجلدات معينة
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', '.output', '.nuxt']]

            for file in files:
                if any(file.endswith(ext) for ext in extensions):
                    files_to_analyze.append(os.path.join(root, file))

        print(f"📊 تحليل {len(files_to_analyze)} ملف...")

        # تحليل الملفات
        total_security = 0
        total_complexity = 0
        total_maintainability = 0

        for file_path in files_to_analyze:
            try:
                analysis = self.analyze_file(file_path)

                report["files_analyzed"] += 1

                if "issues" in analysis and analysis["issues"]:
                    report["total_issues"] += len(analysis["issues"])
                    report["issues"].extend(analysis["issues"])

                # حساب الدرجات
                security_score = self.calculate_security_score(file_path)
                complexity_score = self.calculate_complexity_score(file_path)
                maintainability_score = self.calculate_maintainability_score(file_path)

                report["scores"][file_path] = {
                    "security": security_score,
                    "complexity": complexity_score,
                    "maintainability": maintainability_score,
                    "overall": (security_score + complexity_score + maintainability_score) / 3
                }

                total_security += security_score
                total_complexity += complexity_score
                total_maintainability += maintainability_score

            except Exception as e:
                print(f"❌ خطأ في تحليل {file_path}: {e}")

        # حساب المتوسطات
        if report["files_analyzed"] > 0:
            report["summary"] = {
                "average_security": total_security / report["files_analyzed"],
                "average_complexity": total_complexity / report["files_analyzed"],
                "average_maintainability": total_maintainability / report["files_analyzed"],
                "overall_score": (total_security + total_complexity + total_maintainability) / (report["files_analyzed"] * 3)
            }

        # توليد توصيات
        report["recommendations"] = self.generate_recommendations(report)

        return report

    def generate_recommendations(self, report: Dict[str, Any]) -> List[str]:
        """توليد توصيات بناءً على التقرير"""

        recommendations = []

        if report["total_issues"] > 0:
            recommendations.append(f"🔍 تم العثور على {report['total_issues']} مشكلة - يُنصح بمراجعتها")

        if report.get("summary", {}).get("average_security", 10) < 7:
            recommendations.append("🔒 درجة الأمان منخفضة - راجع الثغرات الأمنية")

        if report.get("summary", {}).get("average_complexity", 10) < 7:
            recommendations.append("📉 التعقيد مرتفع - فكر في تبسيط الكود")

        if report.get("summary", {}).get("average_maintainability", 10) < 7:
            recommendations.append("🛠️ قابلية الصيانة منخفضة - أضف تعليقات وحسّن التنظيم")

        if not recommendations:
            recommendations.append("✅ الكود بحالة جيدة!")

        return recommendations

    def save_report(self, report: Dict[str, Any], output_file: str = "quality-report.json"):
        """حفظ التقرير"""

        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(report, f, ensure_ascii=False, indent=2)

        print(f"✅ تم حفظ التقرير في: {output_path}")

    def print_summary(self, report: Dict[str, Any]):
        """طباعة ملخص التقرير"""

        print("\n" + "="*50)
        print("📊 ملخص تحليل جودة الكود")
        print("="*50)
        print(f"📁 عدد الملفات المحللة: {report['files_analyzed']}")
        print(f"⚠️  إجمالي المشاكل: {report['total_issues']}")

        if "summary" in report:
            summary = report["summary"]
            print(f"\n🎯 الدرجات:")
            print(f"  🔒 الأمان: {summary.get('average_security', 0):.2f}/10")
            print(f"  📊 التعقيد: {summary.get('average_complexity', 0):.2f}/10")
            print(f"  🛠️  قابلية الصيانة: {summary.get('average_maintainability', 0):.2f}/10")
            print(f"  ⭐ الإجمالي: {summary.get('overall_score', 0):.2f}/10")

        print(f"\n💡 التوصيات:")
        for rec in report.get("recommendations", []):
            print(f"  {rec}")

        print("="*50 + "\n")


def main():
    """الدالة الرئيسية"""

    print("🤖 مفحص جودة الكود الذكي لـ WejdanAI")
    print("="*50)

    checker = AICodeQualityChecker()

    # تشغيل التحليل
    report = checker.generate_report(".")

    # حفظ التقرير
    checker.save_report(report, "reports/quality-report.json")

    # طباعة الملخص
    checker.print_summary(report)

    # رمز الخروج بناءً على الجودة
    overall_score = report.get("summary", {}).get("overall_score", 10)

    if overall_score >= 8:
        print("✅ جودة ممتازة!")
        sys.exit(0)
    elif overall_score >= 6:
        print("⚠️  جودة مقبولة - يُنصح بالتحسين")
        sys.exit(0)
    else:
        print("❌ جودة منخفضة - يتطلب مراجعة عاجلة")
        sys.exit(1)


if __name__ == "__main__":
    main()
