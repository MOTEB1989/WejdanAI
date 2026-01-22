import type { IncomingMessage } from 'http'
import { WebSocketServer, WebSocket } from 'ws'

const clients = new Map<string, { ws: WebSocket; userName: string }>()
let wss: WebSocketServer | null = null

export default defineEventHandler((event) => {
  const node = event.node

  // Handle WebSocket upgrade
  if (node.req.headers.upgrade === 'websocket') {
    // Initialize WebSocket server once
    if (!wss) {
      wss = new WebSocketServer({ noServer: true })
      
      wss.on('connection', (ws: WebSocket) => {
        const clientId = Math.random().toString(36).substr(2, 9)
        
        clients.set(clientId, { ws, userName: 'Anonymous' })
        console.log(`Client ${clientId} connected. Total clients: ${clients.size}`)

        // Send welcome message
        ws.send(JSON.stringify({
          type: 'connection',
          clientId,
          message: 'Connected to chat server',
          onlineUsers: clients.size
        }))

        // Broadcast user count update
        broadcastToAll({
          type: 'user:online',
          onlineUsers: clients.size
        })

        ws.on('message', (data: Buffer) => {
          try {
            const message = JSON.parse(data.toString())
            
            switch (message.type) {
              case 'message:send':
                // Broadcast message to all clients
                broadcastToAll({
                  type: 'message:broadcast',
                  data: message.data,
                  clientId,
                  userName: clients.get(clientId)?.userName || 'Anonymous',
                  timestamp: new Date().toISOString()
                })
                break
                
              case 'typing:start':
                // Broadcast typing indicator to all except sender
                broadcastToOthers(clientId, {
                  type: 'typing:broadcast',
                  clientId,
                  userName: clients.get(clientId)?.userName || 'Anonymous',
                  isTyping: true
                })
                break
                
              case 'typing:stop':
                broadcastToOthers(clientId, {
                  type: 'typing:broadcast',
                  clientId,
                  userName: clients.get(clientId)?.userName || 'Anonymous',
                  isTyping: false
                })
                break
                
              case 'user:identify':
                // Update user name
                if (message.userName) {
                  const client = clients.get(clientId)
                  if (client) {
                    client.userName = message.userName
                  }
                }
                break
            }
          } catch (error) {
            console.error('Error processing message:', error)
          }
        })

        ws.on('close', () => {
          clients.delete(clientId)
          console.log(`Client ${clientId} disconnected. Total clients: ${clients.size}`)
          
          // Broadcast user count update
          broadcastToAll({
            type: 'user:online',
            onlineUsers: clients.size
          })
        })

        ws.on('error', (error: Error) => {
          console.error('WebSocket error:', error)
        })
      })
    }

    // Upgrade the connection
    const socket = node.req.socket
    const head = Buffer.alloc(0)
    
    wss.handleUpgrade(node.req as IncomingMessage, socket, head, (ws: WebSocket) => {
      wss!.emit('connection', ws, node.req)
    })
    
    return
  }

  return { 
    message: 'WebSocket endpoint. Use WebSocket protocol to connect.',
    url: '/api/websocket'
  }
})

function broadcastToAll(message: any) {
  const data = JSON.stringify(message)
  clients.forEach(({ ws }) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data)
    }
  })
}

function broadcastToOthers(excludeClientId: string, message: any) {
  const data = JSON.stringify(message)
  clients.forEach(({ ws }, clientId) => {
    if (clientId !== excludeClientId && ws.readyState === WebSocket.OPEN) {
      ws.send(data)
    }
  })
}
