// Client-side WebSocket utility for real-time updates
// Connects to the server-side WebSocket endpoint and handles event subscriptions

export interface WebSocketEvent {
  type: string
  payload: any
}

type EventCallback = (payload: any) => void

class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string
  private listeners: Map<string, Set<EventCallback>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  constructor(url: string = getWebSocketUrl()) {
    this.url = url
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Get token from cookie
        const token = this.getTokenFromCookie()
        if (!token) {
          console.warn('WebSocket: No token found, connection skipped')
          reject(new Error('No authentication token'))
          return
        }

        const wsUrl = `${this.url}?token=${encodeURIComponent(token)}`
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log('WebSocket connected')
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onmessage = (event: MessageEvent) => {
          try {
            const message = JSON.parse(event.data) as WebSocketEvent
            this.handleEvent(message)
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err)
          }
        }

        this.ws.onerror = (error: Event) => {
          console.error('WebSocket error:', error)
          reject(error)
        }

        this.ws.onclose = () => {
          console.log('WebSocket disconnected')
          this.attemptReconnect()
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  private getTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null
    const cookies = document.cookie.split(';')
    const tokenCookie = cookies.find((c) => c.trim().startsWith('token='))
    return tokenCookie ? tokenCookie.trim().substring(6) : null
  }

  private handleEvent(event: WebSocketEvent) {
    const callbacks = this.listeners.get(event.type)
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(event.payload)
        } catch (err) {
          console.error(`Error in listener for '${event.type}':`, err)
        }
      })
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('WebSocket: Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    console.log(`WebSocket: Attempting reconnection in ${delay}ms (attempt ${this.reconnectAttempts})`)

    setTimeout(() => {
      this.connect().catch((err) => {
        console.error('WebSocket reconnection failed:', err)
      })
    }, delay)
  }

  addEventListener(eventType: string, callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }

    const callbacks = this.listeners.get(eventType)!
    callbacks.add(callback)

    // Return unsubscribe function
    return () => {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        this.listeners.delete(eventType)
      }
    }
  }

  removeEventListener(eventType: string, callback: EventCallback) {
    const callbacks = this.listeners.get(eventType)
    if (callbacks) {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        this.listeners.delete(eventType)
      }
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// Determine WebSocket URL based on environment
function getWebSocketUrl(): string {
  if (typeof window === 'undefined') {
    return 'ws://localhost:3000'
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}`
}

// Global singleton instance
let wsClient: WebSocketClient | null = null

export function getWebSocketClient(): WebSocketClient {
  if (!wsClient) {
    wsClient = new WebSocketClient()
  }
  return wsClient
}

// Connect to WebSocket server
export async function initWebSocket(): Promise<void> {
  const client = getWebSocketClient()
  if (!client.isConnected()) {
    try {
      await client.connect()
    } catch (err) {
      console.error('Failed to initialize WebSocket:', err)
      // Graceful degradation - continue without WebSocket
    }
  }
}

// Subscribe to review_approved events
export function onReviewApproved(callback: (payload: { reviewId: number; revieweeId: number; reviewerName?: string }) => void): () => void {
  const client = getWebSocketClient()
  return client.addEventListener('review_approved', callback)
}

// Subscribe to job updates (existing pattern)
export function onJobUpdated(callback: (payload: any) => void): () => void {
  const client = getWebSocketClient()
  return client.addEventListener('JOB_UPDATED', callback)
}

// Export client for advanced use cases
export { WebSocketClient }
