import type { WebSocket } from 'ws'
import { WebSocketServer } from 'ws'

interface Client {
  ws: WebSocket
  userId?: number
  userName?: string
}

const clients = new Set<Client>()

let wss: WebSocketServer | null = null

function initWebSocketServer() {
  if (wss) return wss

  // Create WebSocket server
  wss = new WebSocketServer({ noServer: true })

  wss.on('connection', (ws: WebSocket, request: any) => {
    const client: Client = { ws }
    clients.add(client)
    
    console.log('New WebSocket connection. Total clients:', clients.size)

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString())
        
        switch (message.type) {
          case 'identify':
            // Client identifies themselves
            client.userId = message.userId
            client.userName = message.userName
            
            // Broadcast user joined
            broadcast({
              type: 'user_joined',
              data: {
                userId: client.userId,
                userName: client.userName,
              },
              timestamp: new Date(),
            }, client)
            break

          case 'message':
            // Broadcast message to all clients
            broadcast({
              type: 'message',
              data: message.data,
              timestamp: new Date(),
            })
            break

          case 'typing':
            // Broadcast typing indicator
            broadcast({
              type: 'typing',
              data: {
                userId: client.userId,
                userName: client.userName,
                isTyping: message.isTyping,
              },
              timestamp: new Date(),
            }, client)
            break

          default:
            console.log('Unknown message type:', message.type)
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error)
      }
    })

    ws.on('close', () => {
      clients.delete(client)
      console.log('WebSocket connection closed. Total clients:', clients.size)
      
      // Broadcast user left
      if (client.userId) {
        broadcast({
          type: 'user_left',
          data: {
            userId: client.userId,
            userName: client.userName,
          },
          timestamp: new Date(),
        })
      }
    })

    ws.on('error', (error) => {
      console.error('WebSocket error:', error)
      clients.delete(client)
    })

    // Send initial connection success message
    ws.send(JSON.stringify({
      type: 'connected',
      data: { message: 'Connected to WebSocket server' },
      timestamp: new Date(),
    }))
  })

  return wss
}

function broadcast(message: any, exclude?: Client) {
  const messageStr = JSON.stringify(message)
  
  clients.forEach((client) => {
    if (client !== exclude && client.ws.readyState === 1) { // 1 = OPEN
      try {
        client.ws.send(messageStr)
      } catch (error) {
        console.error('Error broadcasting message:', error)
      }
    }
  })
}

export default defineEventHandler((event) => {
  // Initialize WebSocket server
  const wss = initWebSocketServer()
  
  // Check if this is a WebSocket upgrade request
  if (event.node.req.headers.upgrade === 'websocket') {
    // Handle WebSocket upgrade
    wss.handleUpgrade(event.node.req, event.node.req.socket, Buffer.alloc(0), (ws) => {
      wss.emit('connection', ws, event.node.req)
    })
    
    return
  }
  
  // Return info for regular HTTP requests
  return {
    status: 'WebSocket server is running',
    clients: clients.size,
  }
})
