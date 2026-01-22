import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

async function ensureMessagesTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES profiles(id),
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `
    console.log('Messages table ready')
  } catch (error) {
    console.error('Error creating messages table:', error)
    throw error
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = parseInt(query.limit as string) || 50
  const offset = parseInt(query.offset as string) || 0

  try {
    const messages = await sql`
      SELECT m.*, p.name, p.email, p.image 
      FROM messages m
      LEFT JOIN profiles p ON m.user_id = p.id
      ORDER BY m.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `
    
    return {
      messages: messages.reverse(), // Return oldest first for chat display
      total: messages.length
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error?.message.includes('relation "messages" does not exist')
    ) {
      console.log('Messages table does not exist, creating it now...')
      await ensureMessagesTable()
      
      // Return empty messages array after creating table
      return {
        messages: [],
        total: 0
      }
    } else {
      console.error('Error fetching messages:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch messages'
      })
    }
  }
})
