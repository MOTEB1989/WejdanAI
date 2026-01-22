import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

async function createMessagesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      message TEXT NOT NULL,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      sender_name VARCHAR(255) NOT NULL,
      sender_image VARCHAR(255)
    );
  `
  console.log('Created "messages" table')
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = query.limit ? parseInt(query.limit as string) : 50

  try {
    const messages = await sql`
      SELECT * FROM messages 
      ORDER BY timestamp DESC 
      LIMIT ${limit}
    `
    return {
      messages: messages.reverse(), // Return in chronological order
      count: messages.length
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error?.message.includes(`relation "messages" does not exist`)
    ) {
      console.log('Messages table does not exist, creating it now...')
      await createMessagesTable()
      const messages = await sql`SELECT * FROM messages ORDER BY timestamp DESC LIMIT ${limit}`
      return {
        messages: messages.reverse(),
        count: messages.length
      }
    } else {
      throw error
    }
  }
})
