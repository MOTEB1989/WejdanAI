#!/usr/bin/env python3

"""
Demo script to test JWT authentication and models API
Usage: python3 test-api.py
"""

import requests
import json

BASE_URL = "http://localhost:3000"

def test_api():
    print("🧪 Testing WejdanAI JWT Authentication and Models API")
    print(f"📡 Base URL: {BASE_URL}")
    
    try:
        # Step 1: Generate a JWT token
        print("\n1️⃣ Generating JWT token...")
        
        auth_response = requests.post(f"{BASE_URL}/api/auth", 
            json={"username": "testuser"},
            headers={"Content-Type": "application/json"}
        )
        
        auth_data = auth_response.json()
        print("✅ Auth response:", auth_data)
        
        if "token" not in auth_data:
            raise Exception("Failed to get token")
        
        token = auth_data["token"]
        
        # Step 2: Test accessing models API without token (should fail)
        print("\n2️⃣ Testing models API without token (should fail)...")
        
        try:
            no_auth_response = requests.get(f"{BASE_URL}/api/models-demo")
            print("🚫 Status:", no_auth_response.status_code)
            print("🚫 Response:", no_auth_response.json())
        except Exception as e:
            print("🚫 Request failed as expected:", str(e))
        
        # Step 3: Add a model using JWT token
        print("\n3️⃣ Adding a model with JWT token...")
        
        add_model_response = requests.post(f"{BASE_URL}/api/models-demo",
            json={
                "name": "GPT-4",
                "version": "4.0", 
                "description": "OpenAI model for testing"
            },
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}"
            }
        )
        
        add_model_data = add_model_response.json()
        print("✅ Add model response:", add_model_data)
        
        # Step 4: Fetch all models
        print("\n4️⃣ Fetching all models...")
        
        get_models_response = requests.get(f"{BASE_URL}/api/models-demo",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        models_data = get_models_response.json()
        print("✅ Models list:", models_data)
        
        print("\n🎉 API test completed successfully!")
        
    except Exception as error:
        print(f"❌ Test failed: {error}")
        return False
    
    return True

if __name__ == "__main__":
    test_api()