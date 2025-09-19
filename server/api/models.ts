import { defineEventHandler, readBody, getHeader, createError } from 'h3'
import postgres from 'postgres'
import { verifyToken } from '../utils/auth'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

async function initModelsTable() {
  // Create models table
  await sql`
    CREATE TABLE IF NOT EXISTS models (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      version TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `
  
  // Create logs table if it doesn't exist and add model_id column
  await sql`
    CREATE TABLE IF NOT EXISTS logs (
      id SERIAL PRIMARY KEY,
      message TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `
  
  // Add model_id column if it doesn't exist
  try {
    await sql`
      ALTER TABLE logs ADD COLUMN model_id INT REFERENCES models(id) ON DELETE SET NULL;
    `
  } catch (error) {
    // Column likely already exists, ignore error
    console.log('model_id column may already exist')
  }
}

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

  // Initialize tables on first access
  try {
    await initModelsTable()
  } catch (error) {
    console.log('Tables initialization:', error)
  }

  if (event.method === 'GET') {
    const models = await sql`SELECT * FROM models ORDER BY created_at DESC`
    return models
  }

  if (event.method === 'POST') {
    const body = await readBody(event)
    const { name, version, description } = body

    if (!name || !version) {
      return { error: "⚠️ 'name' and 'version' are required." }
    }

    const result = await sql`
      INSERT INTO models (name, version, description) 
      VALUES (${name}, ${version}, ${description || null}) 
      RETURNING *
    `
    return { message: "✅ Model added successfully", model: result[0] }
  }

  return { error: "Method not allowed" }
})