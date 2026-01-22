import WebSocket from 'ws'
import type { WebSocketMessage } from '../../types/chat'

const WebSocketServer = WebSocket.Server || WebSocket.WebSocketServer

export default defineNitroPlugin((nitroApp) => {
  // Skip WebSocket server in production on Vercel (serverless) or in dev mode
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
    console.log('WebSocket server disabled - using fallback to HTTP API')
    return
  }

  const clients = new Map<any, { userId?: number; userName?: string }>()

  // Create WebSocket server
  const wss = new WebSocketServer({ 
    noServer: true,
    perMessageDeflate: false 
  })

  wss.on('connection', (ws: any) => {
    console.log('Client connected to WebSocket')
    clients.set(ws, {})

    // Send connection confirmation
    ws.send(
      JSON.stringify({
        type: 'connection',
        payload: { status: 'connected' },
        timestamp: new Date().toISOString(),
      } as WebSocketMessage)
    )

    ws.on('message', (data: any) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString())
        const clientInfo = clients.get(ws)

        switch (message.type) {
          case 'presence':
            // Store user info
            if (message.userId && message.userName) {
              clients.set(ws, {
                userId: message.userId,
                userName: message.userName,
              })
              // Broadcast user joined
              broadcast({
                type: 'presence',
                payload: {
                  userId: message.userId,
                  userName: message.userName,
                  status: 'online',
                },
                timestamp: new Date().toISOString(),
              })
            }
            break

          case 'message':
            // Broadcast message to all clients
            broadcast({
              type: 'message',
              payload: message.payload,
              userId: clientInfo?.userId,
              userName: clientInfo?.userName,
              timestamp: new Date().toISOString(),
            })
            break

          case 'typing':
            // Broadcast typing indicator (exclude sender)
            broadcast(
              {
                type: 'typing',
                payload: message.payload,
                userId: clientInfo?.userId,
                userName: clientInfo?.userName,
                timestamp: new Date().toISOString(),
              },
              ws
            )
            break

          default:
            console.log('Unknown message type:', message.type)
        }
      } catch (error) {
        console.error('WebSocket message error:', error)
        ws.send(
          JSON.stringify({
            type: 'error',
            payload: { message: 'Invalid message format' },
            timestamp: new Date().toISOString(),
          } as WebSocketMessage)
        )
      }
    })

    ws.on('close', () => {
      const clientInfo = clients.get(ws)
      if (clientInfo?.userId) {
        // Broadcast user left
        broadcast({
          type: 'presence',
          payload: {
            userId: clientInfo.userId,
            userName: clientInfo.userName,
            status: 'offline',
          },
          timestamp: new Date().toISOString(),
        })
      }
      clients.delete(ws)
      console.log('Client disconnected from WebSocket')
    })

    ws.on('error', (error: any) => {
      console.error('WebSocket error:', error)
    })
  })

  // Broadcast function
  function broadcast(message: WebSocketMessage, excludeClient?: any) {
    const messageStr = JSON.stringify(message)
    clients.forEach((clientInfo, client) => {
      if (client !== excludeClient && client.readyState === 1) {
        // 1 = OPEN
        client.send(messageStr)
      }
    })
  }

  // Attach to Nuxt's server (this won't work in serverless, but will in dev)
  if (process.server) {
    console.log('WebSocket server initialized')
    
    // Store reference for potential HTTP upgrade
    nitroApp.hooks.hook('request', (event) => {
      // @ts-ignore
      if (!event.node.req.__wsServer) {
        // @ts-ignore
        event.node.req.__wsServer = wss
      }
    })
  }
})
