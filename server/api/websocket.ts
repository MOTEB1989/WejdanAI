import { Server as WebSocketServer } from 'ws'
import type { ServerResponse } from 'http'

interface WSClient {
  ws: any
  userId?: number
  userName?: string
  userImage?: string
  isAlive: boolean
}

const clients = new Map<string, WSClient>()
let wss: WebSocketServer | null = null

export default defineEventHandler((event) => {
  // Only handle WebSocket upgrade requests
  if (!event.node.req.headers.upgrade?.toLowerCase().includes('websocket')) {
    return { message: 'WebSocket endpoint - use ws:// or wss:// protocol' }
  }

  // Initialize WebSocket server if not already created
  if (!wss) {
    wss = new WebSocketServer({ noServer: true })

    wss.on('connection', (ws: any, request: any) => {
      const clientId = Math.random().toString(36).substring(7)
      const client: WSClient = {
        ws,
        isAlive: true
      }
      clients.set(clientId, client)

      console.log(`Client ${clientId} connected. Total clients: ${clients.size}`)

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        clientId,
        timestamp: new Date().toISOString()
      }))

      // Handle incoming messages
      ws.on('message', (data: any) => {
        try {
          const message = JSON.parse(data.toString())
          
          switch (message.type) {
            case 'identify':
              // Store user information
              client.userId = message.userId
              client.userName = message.userName
              client.userImage = message.userImage
              console.log(`Client ${clientId} identified as ${message.userName}`)
              
              // Broadcast user joined
              broadcast({
                type: 'user_joined',
                userName: message.userName,
                userId: message.userId,
                timestamp: new Date().toISOString()
              }, clientId)
              break

            case 'message':
              // Broadcast message to all clients
              broadcast({
                type: 'message',
                id: message.id,
                userId: message.userId,
                userName: message.userName,
                userImage: message.userImage,
                content: message.content,
                messageType: message.messageType || 'text',
                timestamp: message.timestamp || new Date().toISOString()
              })
              break

            case 'typing':
              // Broadcast typing indicator to others
              broadcast({
                type: 'typing',
                userId: message.userId,
                userName: message.userName,
                isTyping: message.isTyping,
                timestamp: new Date().toISOString()
              }, clientId)
              break

            case 'ping':
              // Respond with pong
              ws.send(JSON.stringify({
                type: 'pong',
                timestamp: new Date().toISOString()
              }))
              break

            default:
              console.log('Unknown message type:', message.type)
          }
        } catch (error) {
          console.error('Error handling message:', error)
        }
      })

      // Handle pong responses for heartbeat
      ws.on('pong', () => {
        client.isAlive = true
      })

      // Handle client disconnection
      ws.on('close', () => {
        console.log(`Client ${clientId} disconnected`)
        
        if (client.userName) {
          // Broadcast user left
          broadcast({
            type: 'user_left',
            userName: client.userName,
            userId: client.userId,
            timestamp: new Date().toISOString()
          })
        }
        
        clients.delete(clientId)
      })

      // Handle errors
      ws.on('error', (error: any) => {
        console.error(`WebSocket error for client ${clientId}:`, error)
      })
    })

    // Heartbeat to detect broken connections
    const heartbeatInterval = setInterval(() => {
      clients.forEach((client, clientId) => {
        if (!client.isAlive) {
          console.log(`Terminating inactive client ${clientId}`)
          client.ws.terminate()
          clients.delete(clientId)
          return
        }
        
        client.isAlive = false
        client.ws.ping()
      })
    }, 30000) // Check every 30 seconds

    // Clean up on server close
    wss.on('close', () => {
      clearInterval(heartbeatInterval)
    })
  }

  // Upgrade the connection
  wss.handleUpgrade(event.node.req, event.node.req.socket, Buffer.alloc(0), (ws) => {
    wss!.emit('connection', ws, event.node.req)
  })

  // Return a dummy response
  event.node.res.statusCode = 101
  return null
})

// Helper function to broadcast messages
function broadcast(message: any, excludeClientId?: string) {
  const messageStr = JSON.stringify(message)
  clients.forEach((client, clientId) => {
    if (clientId !== excludeClientId && client.ws.readyState === 1) {
      try {
        client.ws.send(messageStr)
      } catch (error) {
        console.error(`Error sending to client ${clientId}:`, error)
      }
    }
  })
}
