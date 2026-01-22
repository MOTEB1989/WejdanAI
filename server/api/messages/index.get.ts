import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

async function createMessagesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES profiles(id),
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      message_type VARCHAR(50) DEFAULT 'text'
    );
  `
  console.log('Created "messages" table')
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = parseInt(query.limit as string) || 50
  const offset = parseInt(query.offset as string) || 0

  try {
    const messages = await sql`
      SELECT 
        m.id,
        m.content,
        m.created_at,
        m.message_type,
        p.id as user_id,
        p.name as user_name,
        p.email as user_email,
        p.image as user_image
      FROM messages m
      LEFT JOIN profiles p ON m.user_id = p.id
      ORDER BY m.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `
    
    return {
      messages: messages.reverse(), // Return oldest first for chat display
      count: messages.length,
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('relation "messages" does not exist')
    ) {
      console.log('Messages table does not exist, creating it now...')
      await createMessagesTable()
      return {
        messages: [],
        count: 0,
      }
    } else {
      throw error
    }
  }
})
