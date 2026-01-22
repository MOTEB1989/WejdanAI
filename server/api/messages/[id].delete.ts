import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id as string)

  if (!id || isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid message ID'
    })
  }

  try {
    const [message] = await sql`
      DELETE FROM messages 
      WHERE id = ${id}
      RETURNING *
    `
    
    if (!message) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Message not found'
      })
    }
    
    return { success: true, message }
  } catch (error) {
    if (error instanceof Error && error.message.includes('statusCode')) {
      throw error
    }
    console.error('Error deleting message:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete message'
    })
  }
})
