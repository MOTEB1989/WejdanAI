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
      message_type VARCHAR(20) DEFAULT 'text',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `
  console.log('Created "messages" table')
}

export default defineEventHandler(async (event) => {
  const method = event.method
  const startTime = Date.now()

  try {
    if (method === 'GET') {
      // Get query parameters for pagination
      const query = getQuery(event)
      const limit = query.limit ? parseInt(query.limit as string) : 50
      const offset = query.offset ? parseInt(query.offset as string) : 0

      const messages = await sql`
        SELECT * FROM messages 
        ORDER BY created_at DESC 
        LIMIT ${limit} 
        OFFSET ${offset}
      `
      
      const duration = Date.now() - startTime
      return {
        messages: messages.reverse(), // Reverse to show oldest first
        duration,
        count: messages.length
      }
    } else if (method === 'POST') {
      // Create new message
      const body = await readBody(event)
      
      if (!body.content || !body.user_id || !body.user_name) {
        throw createError({
          statusCode: 400,
          message: 'Missing required fields: content, user_id, user_name'
        })
      }

      const result = await sql`
        INSERT INTO messages (user_id, user_name, user_image, content, message_type)
        VALUES (
          ${body.user_id},
          ${body.user_name},
          ${body.user_image || ''},
          ${body.content},
          ${body.message_type || 'text'}
        )
        RETURNING *
      `

      const duration = Date.now() - startTime
      return {
        message: result[0],
        duration
      }
    } else {
      throw createError({
        statusCode: 405,
        message: 'Method not allowed'
      })
    }
  } catch (error) {
    // If table doesn't exist, create it
    if (
      error instanceof Error &&
      error?.message?.includes('relation "messages" does not exist')
    ) {
      console.log('Messages table does not exist, creating it now...')
      await createMessagesTable()
      
      // Retry the operation
      if (method === 'GET') {
        const query = getQuery(event)
        const limit = query.limit ? parseInt(query.limit as string) : 50
        const offset = query.offset ? parseInt(query.offset as string) : 0
        
        const messages = await sql`
          SELECT * FROM messages 
          ORDER BY created_at DESC 
          LIMIT ${limit} 
          OFFSET ${offset}
        `
        
        const duration = Date.now() - startTime
        return {
          messages: messages.reverse(),
          duration,
          count: messages.length
        }
      } else if (method === 'POST') {
        const body = await readBody(event)
        const result = await sql`
          INSERT INTO messages (user_id, user_name, user_image, content, message_type)
          VALUES (
            ${body.user_id},
            ${body.user_name},
            ${body.user_image || ''},
            ${body.content},
            ${body.message_type || 'text'}
          )
          RETURNING *
        `
        
        const duration = Date.now() - startTime
        return {
          message: result[0],
          duration
        }
      }
    }
    throw error
  }
})
