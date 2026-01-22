import { WebSocketServer } from 'ws'

const clients = new Map()
let wss: WebSocketServer | null = null

export default defineEventHandler((event) => {
  // Only initialize WebSocket server once
  if (!wss && event.node.req.socket.server) {
    wss = new WebSocketServer({ noServer: true })
    
    event.node.req.socket.server.on('upgrade', (request: any, socket: any, head: any) => {
      if (request.url === '/api/websocket') {
        wss!.handleUpgrade(request, socket, head, (ws) => {
          wss!.emit('connection', ws, request)
        })
      }
    })

    wss.on('connection', (ws) => {
      const clientId = Math.random().toString(36).substr(2, 9)
      let userName = 'Anonymous'
      
      clients.set(clientId, { ws, userName })
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

      ws.on('message', (data) => {
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
                  userName = message.userName
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

      ws.on('error', (error) => {
        console.error('WebSocket error:', error)
      })
    })
  }

  return { ok: true }
})

function broadcastToAll(message: any) {
  const data = JSON.stringify(message)
  clients.forEach(({ ws }) => {
    if (ws.readyState === 1) { // OPEN
      ws.send(data)
    }
  })
}

function broadcastToOthers(excludeClientId: string, message: any) {
  const data = JSON.stringify(message)
  clients.forEach(({ ws }, clientId) => {
    if (clientId !== excludeClientId && ws.readyState === 1) {
      ws.send(data)
    }
  })
}
