import { defineEventHandler, readBody, getHeader, createError } from 'h3'
import { verifyToken } from '../utils/auth'

// In-memory storage for demo purposes (use database in production)
let models: any[] = [
  {
    id: 1,
    name: "GPT-4",
    version: "4.0",
    description: "OpenAI GPT-4 model",
    created_at: new Date().toISOString()
  }
]

export default defineEventHandler(async (event) => {
  // Check for JWT authentication
  const authHeader = getHeader(event, "authorization")
  if (!authHeader) {
    throw createError({ statusCode: 401, statusMessage: "Missing Authorization header" })
  }

  const token = authHeader.replace("Bearer ", "")
  let user
  try {
    user = verifyToken(token)
  } catch {
    throw createError({ statusCode: 401, statusMessage: "Invalid or expired token" })
  }

  if (event.method === 'GET') {
    return models.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  if (event.method === 'POST') {
    const body = await readBody(event)
    const { name, version, description } = body

    if (!name || !version) {
      return { error: "⚠️ 'name' and 'version' are required." }
    }

    const newModel = {
      id: models.length + 1,
      name,
      version,
      description: description || null,
      created_at: new Date().toISOString()
    }
    
    models.push(newModel)
    return { message: "✅ Model added successfully", model: newModel }
  }

  return { error: "Method not allowed" }
})