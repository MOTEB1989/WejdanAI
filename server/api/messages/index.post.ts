import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { user_id, content } = body

  if (!content || content.trim() === '') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Message content is required'
    })
  }

  try {
    const [message] = await sql`
      INSERT INTO messages (user_id, content, created_at, updated_at)
      VALUES (${user_id || 1}, ${content}, NOW(), NOW())
      RETURNING *
    `
    
    return message
  } catch (error) {
    console.error('Error creating message:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create message'
    })
  }
})
