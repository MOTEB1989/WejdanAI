import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

// Initialize messages table
async function initMessagesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      message_type VARCHAR(50) DEFAULT 'text',
      is_read BOOLEAN DEFAULT FALSE
    );
  `
  console.log('Messages table initialized')
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, content, messageType = 'text' } = body

    if (!userId || !content) {
      throw createError({
        statusCode: 400,
        statusMessage: 'userId and content are required',
      })
    }

    // Try to insert message
    try {
      const result = await sql`
        INSERT INTO messages (user_id, content, message_type)
        VALUES (${userId}, ${content}, ${messageType})
        RETURNING id, user_id as "userId", content, created_at as "createdAt", message_type as "messageType", is_read as "isRead"
      `
      
      return result[0]
    } catch (error) {
      // If table doesn't exist, create it and retry
      if (
        error instanceof Error &&
        error.message.includes('relation "messages" does not exist')
      ) {
        console.log('Messages table does not exist, creating it now...')
        await initMessagesTable()
        
        // Retry insert
        const result = await sql`
          INSERT INTO messages (user_id, content, message_type)
          VALUES (${userId}, ${content}, ${messageType})
          RETURNING id, user_id as "userId", content, created_at as "createdAt", message_type as "messageType", is_read as "isRead"
        `
        
        return result[0]
      }
      throw error
    }
  } catch (error) {
    console.error('Error creating message:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create message',
    })
  }
})
