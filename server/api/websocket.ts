import { WebSocketServer } from 'ws'

interface WSClient {
  ws: any
  userId?: number
  userName?: string
  userImage?: string
  isAlive: boolean
}

const clients = new Map<string, WSClient>()
let wss: WebSocketServer | null = null

export default defineWebSocketHandler({
  open(peer) {
    const clientId = Math.random().toString(36).substring(7)
    const client: WSClient = {
      ws: peer,
      isAlive: true
    }
    clients.set(clientId, client)

    console.log(`Client ${clientId} connected. Total clients: ${clients.size}`)

    // Send welcome message
    peer.send(JSON.stringify({
      type: 'connected',
      clientId,
      timestamp: new Date().toISOString()
    }))

    // Store clientId on peer for later reference
    ;(peer as any).clientId = clientId
  },

  message(peer, message) {
    const clientId = (peer as any).clientId
    const client = clients.get(clientId)
    if (!client) return

    try {
      const data = JSON.parse(message.text())
      
      switch (data.type) {
        case 'identify':
          // Store user information
          client.userId = data.userId
          client.userName = data.userName
          client.userImage = data.userImage
          console.log(`Client ${clientId} identified as ${data.userName}`)
          
          // Broadcast user joined
          broadcast({
            type: 'user_joined',
            userName: data.userName,
            userId: data.userId,
            timestamp: new Date().toISOString()
          }, clientId)
          break

        case 'message':
          // Broadcast message to all clients
          broadcast({
            type: 'message',
            id: data.id,
            userId: data.userId,
            userName: data.userName,
            userImage: data.userImage,
            content: data.content,
            messageType: data.messageType || 'text',
            timestamp: data.timestamp || new Date().toISOString()
          })
          break

        case 'typing':
          // Broadcast typing indicator to others
          broadcast({
            type: 'typing',
            userId: data.userId,
            userName: data.userName,
            isTyping: data.isTyping,
            timestamp: new Date().toISOString()
          }, clientId)
          break

        case 'ping':
          // Respond with pong
          peer.send(JSON.stringify({
            type: 'pong',
            timestamp: new Date().toISOString()
          }))
          break

        default:
          console.log('Unknown message type:', data.type)
      }
    } catch (error) {
      console.error('Error handling message:', error)
    }
  },

  close(peer, details) {
    const clientId = (peer as any).clientId
    const client = clients.get(clientId)
    
    if (client) {
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
    }
  },

  error(peer, error) {
    const clientId = (peer as any).clientId
    console.error(`WebSocket error for client ${clientId}:`, error)
  }
})

// Helper function to broadcast messages
function broadcast(message: any, excludeClientId?: string) {
  const messageStr = JSON.stringify(message)
  clients.forEach((client, clientId) => {
    if (clientId !== excludeClientId) {
      try {
        client.ws.send(messageStr)
      } catch (error) {
        console.error(`Error sending to client ${clientId}:`, error)
      }
    }
  })
}

