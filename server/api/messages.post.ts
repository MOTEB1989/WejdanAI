import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const { content, user_name, user_image, user_id, message_type = 'text' } = body

  if (!content || !user_name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Content and user_name are required'
    })
  }

  try {
    const result = await sql`
      INSERT INTO messages (content, user_name, user_image, user_id, message_type)
      VALUES (${content}, ${user_name}, ${user_image || null}, ${user_id || null}, ${message_type})
      RETURNING *
    `
    
    return result[0]
  } catch (error) {
    console.error('Error creating message:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create message'
    })
  }
})
