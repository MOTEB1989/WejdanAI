#!/usr/bin/env node

// Demo script to test JWT authentication and models API
// Run with: node test-api.js

const BASE_URL = process.env.BASE_URL || "http://localhost:3000"

async function testAPI() {
  console.log("🧪 Testing WejdanAI JWT Authentication and Models API")
  console.log(`📡 Base URL: ${BASE_URL}`)
  
  try {
    // Step 1: Generate a JWT token
    console.log("\n1️⃣ Generating JWT token...")
    
    const authResponse = await fetch(`${BASE_URL}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'testuser' })
    })
    
    const authData = await authResponse.json()
    console.log("✅ Auth response:", authData)
    
    if (!authData.token) {
      throw new Error("Failed to get token")
    }
    
    const token = authData.token
    
    // Step 2: Test accessing models API without token (should fail)
    console.log("\n2️⃣ Testing models API without token (should fail)...")
    
    try {
      const noAuthResponse = await fetch(`${BASE_URL}/api/models`)
      const noAuthData = await noAuthResponse.json()
      console.log("🚫 Expected unauthorized response:", noAuthData)
    } catch (error) {
      console.log("🚫 Request failed as expected:", error.message)
    }
    
    // Step 3: Add a model using JWT token
    console.log("\n3️⃣ Adding a model with JWT token...")
    
    const addModelResponse = await fetch(`${BASE_URL}/api/models`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'GPT-4',
        version: '4.0',
        description: 'OpenAI model for testing'
      })
    })
    
    const addModelData = await addModelResponse.json()
    console.log("✅ Add model response:", addModelData)
    
    // Step 4: Fetch all models
    console.log("\n4️⃣ Fetching all models...")
    
    const getModelsResponse = await fetch(`${BASE_URL}/api/models`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const modelsData = await getModelsResponse.json()
    console.log("✅ Models list:", modelsData)
    
    console.log("\n🎉 API test completed successfully!")
    
  } catch (error) {
    console.error("❌ Test failed:", error.message)
    process.exit(1)
  }
}

// Run the test
testAPI()