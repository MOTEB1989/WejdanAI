import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  if (!body.content || !body.user_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Content and user_id are required',
    })
  }

  try {
    const [message] = await sql`
      INSERT INTO messages (user_id, content, message_type)
      VALUES (${body.user_id}, ${body.content}, ${body.message_type || 'text'})
      RETURNING 
        id,
        user_id,
        content,
        created_at,
        message_type
    `

    // Fetch user details
    const [user] = await sql`
      SELECT id, name, email, image
      FROM profiles
      WHERE id = ${body.user_id}
    `

    return {
      success: true,
      message: {
        ...message,
        user_name: user?.name,
        user_email: user?.email,
        user_image: user?.image,
      },
    }
  } catch (error) {
    console.error('Error creating message:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create message',
    })
  }
})
