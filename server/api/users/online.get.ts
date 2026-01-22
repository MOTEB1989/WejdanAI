import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

export default defineEventHandler(async () => {
  try {
    // Get all users from profiles table
    const users = await sql`
      SELECT id, name, email, image, "createdAt"
      FROM profiles
      ORDER BY "createdAt" DESC
    `

    // In a real implementation, this would check actual WebSocket connections
    // For now, we'll return all users with a mock online status
    const onlineUsers = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      image: user.image,
      lastSeen: new Date(),
    }))

    return {
      users: onlineUsers,
      total: onlineUsers.length,
    }
  } catch (error) {
    console.error('Error fetching online users:', error)
    
    // Return empty array if error occurs
    return {
      users: [],
      total: 0,
    }
  }
})
