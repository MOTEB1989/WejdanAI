import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

export default defineEventHandler(async (event) => {
  try {
    const messageId = event.context.params?.id

    if (!messageId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Message ID is required',
      })
    }

    const result = await sql`
      UPDATE messages
      SET is_read = true
      WHERE id = ${messageId}
      RETURNING id, user_id as "userId", content, created_at as "createdAt", message_type as "messageType", is_read as "isRead"
    `

    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Message not found',
      })
    }

    return result[0]
  } catch (error) {
    console.error('Error marking message as read:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to mark message as read',
    })
  }
})
