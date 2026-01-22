import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const query = getQuery(event)
  const since = query.since as string
  
  try {
    let messages
    
    if (since) {
      // Get messages since a specific timestamp
      messages = await sql`
        SELECT * FROM messages 
        WHERE created_at > ${since}
        ORDER BY created_at ASC
      `
    } else {
      // Get last 20 messages
      messages = await sql`
        SELECT * FROM messages 
        ORDER BY created_at DESC 
        LIMIT 20
      `
      messages = messages.reverse()
    }
    
    const duration = Date.now() - startTime
    return {
      messages,
      duration,
      count: messages.length
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error?.message?.includes('relation "messages" does not exist')
    ) {
      // Table doesn't exist yet, return empty array
      return {
        messages: [],
        duration: Date.now() - startTime,
        count: 0
      }
    }
    throw error
  }
})
