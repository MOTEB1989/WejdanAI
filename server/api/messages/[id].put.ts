import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id as string)
  const body = await readBody(event)
  const { content } = body

  if (!id || isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid message ID'
    })
  }

  if (!content || content.trim() === '') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Message content is required'
    })
  }

  try {
    const [message] = await sql`
      UPDATE messages 
      SET content = ${content}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    
    if (!message) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Message not found'
      })
    }
    
    return message
  } catch (error) {
    if (error instanceof Error && error.message.includes('statusCode')) {
      throw error
    }
    console.error('Error updating message:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update message'
    })
  }
})
