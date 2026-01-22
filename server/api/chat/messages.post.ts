import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const { message, sender_name, sender_image, user_id } = body

  if (!message || !sender_name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Message and sender_name are required'
    })
  }

  try {
    const result = await sql`
      INSERT INTO messages (user_id, message, sender_name, sender_image)
      VALUES (${user_id || null}, ${message}, ${sender_name}, ${sender_image || null})
      RETURNING *
    `
    
    return {
      success: true,
      message: result[0]
    }
  } catch (error) {
    console.error('Error inserting message:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save message'
    })
  }
})
