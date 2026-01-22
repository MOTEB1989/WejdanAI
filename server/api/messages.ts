import postgres from 'postgres'
import type { Message } from '../../types/chat'

// In-memory message storage for demo mode
let inMemoryMessages: Message[] = []
let messageIdCounter = 1

// Check if database is available
const isDatabaseAvailable = !!process.env.POSTGRES_URL

let sql: any
if (isDatabaseAvailable) {
  sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })
}

async function createMessagesTable() {
  if (!isDatabaseAvailable) return
  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      message_type VARCHAR(50) DEFAULT 'text',
      edited_at TIMESTAMP WITH TIME ZONE,
      deleted_at TIMESTAMP WITH TIME ZONE
    );
  `
  console.log('Created "messages" table')
}

// Demo user data
const demoUser = {
  id: 1,
  name: 'Demo User',
  email: 'demo@wejdanai.com',
  image: 'https://images.ctfassets.net/e5382hct74si/2P1iOve0LZJRZWUzfXpi9r/9d4d27765764fb1ad7379d7cbe5f1043/ucxb4lHy_400x400.jpg',
  createdAt: new Date().toISOString(),
}

export default defineEventHandler(async (event) => {
  const method = event.method
  const query = getQuery(event)

  // Use in-memory storage if database is not available
  if (!isDatabaseAvailable) {
    return await handleInMemoryStorage(event, method, query)
  }

  try {
    // GET - Fetch messages with pagination
    if (method === 'GET') {
      const page = parseInt(query.page as string) || 1
      const limit = parseInt(query.limit as string) || 50
      const offset = (page - 1) * limit

      try {
        const messages = await sql<Message[]>`
          SELECT 
            m.*,
            json_build_object(
              'id', p.id,
              'name', p.name,
              'email', p.email,
              'image', p.image,
              'createdAt', p."createdAt"
            ) as user
          FROM messages m
          LEFT JOIN profiles p ON m.user_id = p.id
          WHERE m.deleted_at IS NULL
          ORDER BY m.timestamp DESC
          LIMIT ${limit}
          OFFSET ${offset}
        `

        return {
          messages: messages.reverse(), // Reverse to show oldest first
          page,
          limit,
          hasMore: messages.length === limit,
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error?.message.includes('relation "messages" does not exist')
        ) {
          await createMessagesTable()
          return {
            messages: [],
            page: 1,
            limit,
            hasMore: false,
          }
        }
        throw error
      }
    }

    // POST - Create new message
    if (method === 'POST') {
      const body = await readBody(event)
      const { user_id, content, message_type = 'text' } = body

      if (!user_id || !content) {
        throw createError({
          statusCode: 400,
          statusMessage: 'user_id and content are required',
        })
      }

      const result = await sql<Message[]>`
        INSERT INTO messages (user_id, content, message_type)
        VALUES (${user_id}, ${content}, ${message_type})
        RETURNING *
      `

      // Fetch the message with user details
      const messageWithUser = await sql<Message[]>`
        SELECT 
          m.*,
          json_build_object(
            'id', p.id,
            'name', p.name,
            'email', p.email,
            'image', p.image,
            'createdAt', p."createdAt"
          ) as user
        FROM messages m
        LEFT JOIN profiles p ON m.user_id = p.id
        WHERE m.id = ${result[0].id}
      `

      return messageWithUser[0]
    }

    // PUT - Update message
    if (method === 'PUT') {
      const body = await readBody(event)
      const { id, content } = body

      if (!id || !content) {
        throw createError({
          statusCode: 400,
          statusMessage: 'id and content are required',
        })
      }

      const result = await sql<Message[]>`
        UPDATE messages
        SET content = ${content}, edited_at = CURRENT_TIMESTAMP
        WHERE id = ${id} AND deleted_at IS NULL
        RETURNING *
      `

      if (result.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Message not found',
        })
      }

      return result[0]
    }

    // DELETE - Soft delete message
    if (method === 'DELETE') {
      const body = await readBody(event)
      const { id } = body

      if (!id) {
        throw createError({
          statusCode: 400,
          statusMessage: 'id is required',
        })
      }

      const result = await sql<Message[]>`
        UPDATE messages
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE id = ${id} AND deleted_at IS NULL
        RETURNING *
      `

      if (result.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Message not found',
        })
      }

      return { success: true, id }
    }

    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed',
    })
  } catch (error) {
    console.error('Messages API error:', error)
    throw error
  }
})

// In-memory storage handler for demo mode
async function handleInMemoryStorage(event: any, method: string, query: any) {
  // GET - Fetch messages
  if (method === 'GET') {
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 50
    const offset = (page - 1) * limit

    const messages = inMemoryMessages
      .slice(offset, offset + limit)
      .map(msg => ({
        ...msg,
        user: demoUser,
      }))

    return {
      messages,
      page,
      limit,
      hasMore: inMemoryMessages.length > offset + limit,
    }
  }

  // POST - Create new message
  if (method === 'POST') {
    const body = await readBody(event)
    const { user_id, content, message_type = 'text' } = body as any

    if (!user_id || !content) {
      throw createError({
        statusCode: 400,
        statusMessage: 'user_id and content are required',
      })
    }

    const newMessage: Message = {
      id: messageIdCounter++,
      user_id,
      content,
      message_type,
      timestamp: new Date().toISOString(),
      edited_at: null,
      deleted_at: null,
      user: demoUser,
    }

    inMemoryMessages.push(newMessage)

    return newMessage
  }

  // PUT - Update message
  if (method === 'PUT') {
    const body = await readBody(event)
    const { id, content } = body as any

    if (!id || !content) {
      throw createError({
        statusCode: 400,
        statusMessage: 'id and content are required',
      })
    }

    const messageIndex = inMemoryMessages.findIndex(m => m.id === id && !m.deleted_at)
    if (messageIndex === -1) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Message not found',
      })
    }

    inMemoryMessages[messageIndex].content = content
    inMemoryMessages[messageIndex].edited_at = new Date().toISOString()

    return inMemoryMessages[messageIndex]
  }

  // DELETE - Soft delete message
  if (method === 'DELETE') {
    const body = await readBody(event)
    const { id } = body as any

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'id is required',
      })
    }

    const messageIndex = inMemoryMessages.findIndex(m => m.id === id && !m.deleted_at)
    if (messageIndex === -1) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Message not found',
      })
    }

    inMemoryMessages[messageIndex].deleted_at = new Date().toISOString()

    return { success: true, id }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed',
  })
}
