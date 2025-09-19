import { defineEventHandler, readBody } from 'h3'
import { generateToken } from '../utils/auth'

export default defineEventHandler(async (event) => {
  if (event.method === 'POST') {
    const body = await readBody(event)
    const { username } = body

    if (!username) {
      return { error: "Username is required" }
    }

    // In a real application, you'd verify credentials here
    // For demo purposes, we'll just create a token for any username
    const token = generateToken({ username, id: Date.now() })
    
    return { 
      message: "Token generated successfully",
      token,
      username
    }
  }

  return { error: "Method not allowed" }
})