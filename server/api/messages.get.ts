import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

async function createMessagesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      user_name VARCHAR(255) NOT NULL,
      user_image VARCHAR(255),
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      message_type VARCHAR(50) DEFAULT 'text'
    );
  `
  console.log('Created "messages" table')
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Number(query.limit) || 50
  const offset = Number(query.offset) || 0

  try {
    const messages = await sql`
      SELECT * FROM messages 
      ORDER BY created_at DESC 
      LIMIT ${limit} 
      OFFSET ${offset}
    `
    
    return {
      messages: messages.reverse(), // Reverse to show oldest first
      count: messages.length
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error?.message.includes(`relation "messages" does not exist`)
    ) {
      console.log('Messages table does not exist, creating it now...')
      await createMessagesTable()
      return {
        messages: [],
        count: 0
      }
    } else {
      throw error
    }
  }
})
