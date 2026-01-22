import { WebSocketServer } from 'ws'
import type { Server } from 'http'
import type WebSocket from 'ws'

export default defineNitroPlugin((nitroApp) => {
  // WebSocket server will be initialized when the HTTP server is ready
  let wss: WebSocketServer | null = null
  const clients = new Set<WebSocket>()

  nitroApp.hooks.hook('request', (event) => {
    if (!wss && event.node.res.socket?.server) {
      const server = event.node.res.socket.server as Server
      
      // Only initialize once
      if (!(server as any).__wsInitialized) {
        wss = new WebSocketServer({ 
          noServer: true,
          path: '/api/chat/ws'
        })

        server.on('upgrade', (request, socket, head) => {
          if (request.url === '/api/chat/ws') {
            wss!.handleUpgrade(request, socket, head, (ws) => {
              wss!.emit('connection', ws, request)
            })
          }
        })

        wss.on('connection', (ws) => {
          console.log('WebSocket client connected')
          clients.add(ws)

          ws.on('message', (data) => {
            try {
              const message = JSON.parse(data.toString())
              console.log('Received message:', message)

              // Broadcast to all connected clients
              clients.forEach((client) => {
                if (client.readyState === client.OPEN) {
                  client.send(JSON.stringify(message))
                }
              })
            } catch (error) {
              console.error('Error processing message:', error)
            }
          })

          ws.on('close', () => {
            console.log('WebSocket client disconnected')
            clients.delete(ws)
          })

          ws.on('error', (error) => {
            console.error('WebSocket error:', error)
            clients.delete(ws)
          })
        })

        ;(server as any).__wsInitialized = true
        console.log('WebSocket server initialized')
      }
    }
  })
})
