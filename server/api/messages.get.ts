import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const limit = Number(query.limit) || 50
    const offset = Number(query.offset) || 0

    const messages = await sql`
      SELECT 
        m.id,
        m.user_id as "userId",
        m.content,
        m.created_at as "createdAt",
        m.message_type as "messageType",
        m.is_read as "isRead",
        p.name as "userName",
        p.email as "userEmail",
        p.image as "userImage"
      FROM messages m
      LEFT JOIN profiles p ON m.user_id = p.id
      ORDER BY m.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    // Transform to include user object
    const transformedMessages = messages.map((msg: any) => ({
      id: msg.id,
      userId: msg.userId,
      content: msg.content,
      createdAt: msg.createdAt,
      messageType: msg.messageType,
      isRead: msg.isRead,
      user: {
        id: msg.userId,
        name: msg.userName,
        email: msg.userEmail,
        image: msg.userImage,
      },
    }))

    return {
      messages: transformedMessages.reverse(), // Reverse to show oldest first
      total: transformedMessages.length,
      limit,
      offset,
    }
  } catch (error) {
    console.error('Error fetching messages:', error)
    
    // Return empty array if table doesn't exist yet
    // PostgreSQL error code 42P01 = undefined_table
    if (
      error instanceof Error &&
      (error as any).code === '42P01'
    ) {
      return {
        messages: [],
        total: 0,
        limit: 50,
        offset: 0,
      }
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch messages',
    })
  }
})
