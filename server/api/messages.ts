import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

async function createMessagesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      user_name VARCHAR(255) NOT NULL,
      user_image VARCHAR(255),
      content TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'text',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `
  console.log('Created "messages" table')
}

export default defineEventHandler(async (event) => {
  const method = event.node.req.method

  try {
    // GET: Retrieve messages
    if (method === 'GET') {
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
          total: messages.length,
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error?.message?.includes('relation "messages" does not exist')
        ) {
          console.log('Messages table does not exist, creating it now...')
          await createMessagesTable()
          return {
            messages: [],
            total: 0,
          }
        }
        throw error
      }
    }

    // POST: Create new message
    if (method === 'POST') {
      const body = await readBody(event)
      const { user_id, user_name, user_image, content, type = 'text' } = body

      if (!user_id || !user_name || !content) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Missing required fields: user_id, user_name, content',
        })
      }

      try {
        const result = await sql`
          INSERT INTO messages (user_id, user_name, user_image, content, type)
          VALUES (${user_id}, ${user_name}, ${user_image || null}, ${content}, ${type})
          RETURNING *
        `
        return result[0]
      } catch (error) {
        if (
          error instanceof Error &&
          error?.message?.includes('relation "messages" does not exist')
        ) {
          console.log('Messages table does not exist, creating it now...')
          await createMessagesTable()
          const result = await sql`
            INSERT INTO messages (user_id, user_name, user_image, content, type)
            VALUES (${user_id}, ${user_name}, ${user_image || null}, ${content}, ${type})
            RETURNING *
          `
          return result[0]
        }
        throw error
      }
    }

    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed',
    })
  } catch (error) {
    console.error('Error in messages API:', error)
    throw error
  }
})
