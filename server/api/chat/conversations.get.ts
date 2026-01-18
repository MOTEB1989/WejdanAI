/**
 * GET /api/chat/conversations
 * Get all conversations from database
 */

import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL || '', { ssl: 'require' })

export default defineEventHandler(async (event) => {
  try {
    // Get query parameters
    const query = getQuery(event)
    const limit = Number(query.limit) || 50
    const offset = Number(query.offset) || 0

    // Fetch conversations from logs table
    const conversations = await sql`
      SELECT
        id,
        user_id,
        query as title,
        response,
        created_at as timestamp
      FROM logs
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    // Group by user_id or session
    const grouped = conversations.map((conv) => ({
      id: conv.id.toString(),
      title: conv.title?.substring(0, 100) || 'محادثة بدون عنوان',
      messages: [
        {
          id: `${conv.id}-user`,
          role: 'user',
          content: conv.title || '',
          timestamp: conv.timestamp
        },
        {
          id: `${conv.id}-assistant`,
          role: 'assistant',
          content: conv.response || '',
          timestamp: conv.timestamp
        }
      ],
      timestamp: conv.timestamp,
      metadata: {
        userId: conv.user_id
      }
    }))

    return {
      success: true,
      conversations: grouped,
      total: conversations.length
    }
  } catch (error: any) {
    console.error('Error fetching conversations:', error)

    return {
      success: false,
      error: error.message || 'Failed to fetch conversations',
      conversations: []
    }
  }
})
