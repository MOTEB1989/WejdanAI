import { WebSocketServer, WebSocket } from 'ws'
import type { Server } from 'http'

let wss: WebSocketServer | null = null

interface ChatMessage {
  type: 'message' | 'typing' | 'connected' | 'disconnected'
  id?: number
  content?: string
  user_name?: string
  user_image?: string
  user_id?: number
  created_at?: string
  message_type?: string
}

export function initializeWebSocketServer(server: Server) {
  if (wss) {
    return wss
  }

  wss = new WebSocketServer({ 
    server,
    path: '/api/ws'
  })

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection')

    ws.on('message', (data: Buffer) => {
      try {
        const message: ChatMessage = JSON.parse(data.toString())
        
        // Broadcast message to all connected clients
        wss?.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message))
          }
        })
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    })

    ws.on('close', () => {
      console.log('WebSocket connection closed')
    })

    ws.on('error', (error) => {
      console.error('WebSocket error:', error)
    })

    // Send connection confirmation
    ws.send(JSON.stringify({ 
      type: 'connected',
      message: 'Connected to chat server'
    }))
  })

  console.log('WebSocket server initialized')
  return wss
}

export default defineEventHandler((event) => {
  // This handler is mainly for setup, the actual WebSocket
  // connection happens via the server initialization
  return { status: 'WebSocket endpoint available at /api/ws' }
})
