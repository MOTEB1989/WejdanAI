#!/usr/bin/env python3
"""
Test script for WejdanAI API endpoints
تطبيق اختبار لنقاط API في WejdanAI

This script demonstrates how to interact with the WejdanAI API.
يوضح هذا السكريبت كيفية التفاعل مع API الخاص بـ WejdanAI.

Usage / الاستخدام:
    python examples/test_api.py

Note: Update BASE_URL to your deployment URL or use localhost for testing.
ملاحظة: قم بتحديث BASE_URL إلى رابط النشر الخاص بك أو استخدم localhost للاختبار.
"""

import requests
import json
from typing import Dict, List

# Configuration / الإعدادات
BASE_URL = "https://wejdanai.vercel.app"  # Change to http://localhost:3000 for local testing
# غير إلى http://localhost:3000 للاختبار المحلي

class WejdanAIClient:
    """Client for interacting with WejdanAI API / عميل للتفاعل مع API الخاص بـ WejdanAI"""
    
    def __init__(self, base_url: str = BASE_URL):
        """
        Initialize the client / تهيئة العميل
        
        Args:
            base_url: Base URL of the API / الرابط الأساسي لـ API
        """
        self.base_url = base_url
        self.logs_endpoint = f"{base_url}/api/logs"
    
    def add_log(self, query: str, response: str, user_id: int = None) -> Dict:
        """
        Add a new log entry / إضافة سجل جديد
        
        Args:
            query: User query / استعلام المستخدم
            response: AI response / رد الذكاء الاصطناعي
            user_id: Optional user ID / معرف المستخدم (اختياري)
        
        Returns:
            API response / رد API
        """
        payload = {
            "query": query,
            "response": response
        }
        
        if user_id is not None:
            payload["user_id"] = user_id
        
        try:
            response = requests.post(
                self.logs_endpoint,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}
    
    def get_logs(self) -> List[Dict]:
        """
        Retrieve all logs / جلب جميع السجلات
        
        Returns:
            List of log entries / قائمة بالسجلات
        """
        try:
            response = requests.get(self.logs_endpoint, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return [{"error": str(e)}]


def main():
    """Main function to demonstrate API usage / الدالة الرئيسية لتوضيح استخدام API"""
    
    print("=" * 60)
    print("WejdanAI API Test Script")
    print("سكريبت اختبار API الخاص بـ WejdanAI")
    print("=" * 60)
    print()
    
    # Initialize client / تهيئة العميل
    client = WejdanAIClient(BASE_URL)
    print(f"📍 API Base URL: {BASE_URL}")
    print(f"📍 رابط API الأساسي: {BASE_URL}")
    print()
    
    # Test 1: Add a log with user_id / اختبار 1: إضافة سجل مع معرف المستخدم
    print("Test 1: Adding a log with user_id")
    print("اختبار 1: إضافة سجل مع معرف المستخدم")
    print("-" * 60)
    
    result = client.add_log(
        user_id=1,
        query="ما هو الذكاء الاصطناعي؟",
        response="الذكاء الاصطناعي هو محاكاة الذكاء البشري في الآلات"
    )
    print(json.dumps(result, indent=2, ensure_ascii=False))
    print()
    
    # Test 2: Add a log without user_id (anonymous) / اختبار 2: إضافة سجل بدون معرف (مجهول)
    print("Test 2: Adding an anonymous log")
    print("اختبار 2: إضافة سجل مجهول")
    print("-" * 60)
    
    result = client.add_log(
        query="What is machine learning?",
        response="Machine learning is a subset of AI that enables systems to learn from data"
    )
    print(json.dumps(result, indent=2, ensure_ascii=False))
    print()
    
    # Test 3: Retrieve all logs / اختبار 3: جلب جميع السجلات
    print("Test 3: Retrieving all logs")
    print("اختبار 3: جلب جميع السجلات")
    print("-" * 60)
    
    logs = client.get_logs()
    if isinstance(logs, list) and len(logs) > 0:
        print(f"✅ Retrieved {len(logs)} log(s)")
        print(f"✅ تم جلب {len(logs)} سجل/سجلات")
        print()
        print("Recent logs / السجلات الحديثة:")
        for i, log in enumerate(logs[:5], 1):  # Show first 5 logs
            if "error" not in log:
                print(f"\n{i}. ID: {log.get('id', 'N/A')}")
                print(f"   Query / الاستعلام: {log.get('query', 'N/A')[:50]}...")
                print(f"   Response / الرد: {log.get('response', 'N/A')[:50]}...")
                print(f"   Created / التاريخ: {log.get('created_at', 'N/A')}")
    else:
        print("❌ Failed to retrieve logs or no logs available")
        print("❌ فشل في جلب السجلات أو لا توجد سجلات")
        if logs:
            print(json.dumps(logs, indent=2, ensure_ascii=False))
    
    print()
    print("=" * 60)
    print("✨ Test completed / اكتمل الاختبار")
    print("=" * 60)


if __name__ == "__main__":
    main()
