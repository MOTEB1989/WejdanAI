import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

export default defineEventHandler(async () => {
  try {
    const users = await sql`SELECT * FROM profiles ORDER BY "createdAt" DESC`
    return {
      users,
      count: users.length,
    }
  } catch (error) {
    console.error('Error fetching chat users:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch users',
    })
  }
})
