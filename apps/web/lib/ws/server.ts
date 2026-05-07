import { WebSocketServer, WebSocket } from 'ws'
import { verifyJwt } from '../auth'
import { IncomingMessage } from 'http'
import { JobDto } from '@/lib/types'

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string
}

const clients = new Map<string, Set<AuthenticatedWebSocket>>()

export function initWsServer(server: any) {
  const wss = new WebSocketServer({ noServer: true })

  server.on('upgrade', async (request: IncomingMessage, socket: any, head: Buffer) => {
    // Extract token from cookie or query string
    const url = new URL(request.url || '', `http://${request.headers.host}`)
    let token = url.searchParams.get('token')

    // Try to get token from cookie
    if (!token && request.headers.cookie) {
      const cookies = request.headers.cookie.split(';').map(c => c.trim())
      const tokenCookie = cookies.find(c => c.startsWith('token='))
      if (tokenCookie) {
        token = tokenCookie.substring(6)
      }
    }

    if (!token) {
      socket.destroy()
      return
    }

    const payload = verifyJwt(token)
    if (!payload || !payload.id) {
      socket.destroy()
      return
    }

    // Complete the upgrade
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request)
    })

    // Store user ID on the WebSocket after upgrade
    wss.once('connection', (ws: AuthenticatedWebSocket) => {
      ws.userId = payload.id as string
      if (!clients.has(ws.userId)) {
        clients.set(ws.userId, new Set())
      }
      clients.get(ws.userId)!.add(ws)

      ws.on('close', () => {
        const userClients = clients.get(ws.userId!)
        if (userClients) {
          userClients.delete(ws)
          if (userClients.size === 0) {
            clients.delete(ws.userId!)
          }
        }
      })
    })
  })

  return wss
}

export function broadcastToUser(userId: string, event: { type: string; payload: JobDto }) {
  const userClients = clients.get(userId)
  if (!userClients) return

  const message = JSON.stringify(event)
  userClients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message)
    }
  })
}
