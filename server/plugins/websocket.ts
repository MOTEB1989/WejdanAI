import { WebSocketServer, WebSocket } from 'ws'

interface Client {
  ws: WebSocket
  userId?: number
  userName?: string
}

const clients = new Set<Client>()

export default defineNitroPlugin((nitroApp) => {
  if (!import.meta.dev) {
    // Only run WebSocket server in development
    // For production, you'd use a separate WebSocket service
    return
  }

  // @ts-ignore - Nitro types don't include this
  nitroApp.hooks.hook('request', (event) => {
    // Handle WebSocket upgrade
    if (event.node.req.headers.upgrade === 'websocket') {
      handleWebSocketUpgrade(event)
    }
  })
})

function handleWebSocketUpgrade(event: any) {
  const { req, res } = event.node

  // Create WebSocket server for this connection
  const wss = new WebSocketServer({ noServer: true })

  wss.on('connection', (ws: WebSocket) => {
    const client: Client = { ws }
    clients.add(client)

    console.log('Client connected. Total clients:', clients.size)
    broadcastUsersCount()

    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString())

        switch (message.type) {
          case 'user_connected':
            client.userId = message.user?.id
            client.userName = message.user?.name
            broadcastUsersCount()
            break

          case 'send_message':
            // Broadcast message to all clients except sender
            broadcastToOthers(client, {
              type: 'new_message',
              message: message.message,
            })
            break

          case 'typing':
            // Broadcast typing indicator to all clients except sender
            broadcastToOthers(client, {
              type: 'user_typing',
              userId: message.userId,
              userName: message.userName,
            })
            break
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    })

    ws.on('close', () => {
      clients.delete(client)
      console.log('Client disconnected. Total clients:', clients.size)
      broadcastUsersCount()
    })

    ws.on('error', (error) => {
      console.error('WebSocket error:', error)
      clients.delete(client)
    })
  })

  // Perform the upgrade
  wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
    wss.emit('connection', ws, req)
  })
}

function broadcastUsersCount() {
  const count = clients.size
  broadcast({
    type: 'users_count',
    count,
  })
}

function broadcast(data: any) {
  const message = JSON.stringify(data)
  clients.forEach((client) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message)
    }
  })
}

function broadcastToOthers(sender: Client, data: any) {
  const message = JSON.stringify(data)
  clients.forEach((client) => {
    if (client !== sender && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message)
    }
  })
}
