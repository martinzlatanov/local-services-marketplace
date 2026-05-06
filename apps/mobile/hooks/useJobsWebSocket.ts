import { useEffect, useState } from 'react'
import type { JobDto, WsEvent } from '@local/types'
import { API_BASE } from '../contexts/AuthContext'

interface UseJobsWebSocketOptions {
  token: string
  onJobUpdated: (job: JobDto) => void
  onReconnect?: () => void
}

type WebSocketStatus = 'connecting' | 'connected' | 'disconnected'

export function useJobsWebSocket({ token, onJobUpdated, onReconnect }: UseJobsWebSocketOptions) {
  const [status, setStatus] = useState<WebSocketStatus>('connecting')

  useEffect(() => {
    if (!token) {
      return
    }

    let ws: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null

    const connect = () => {
      setStatus('connecting')

      const wsBase = API_BASE.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:')
      ws = new WebSocket(`${wsBase}?token=${token}`)

      ws.onopen = () => {
        setStatus('connected')
      }

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data) as WsEvent
          if (data.type === 'JOB_UPDATED') {
            onJobUpdated(data.payload)
          }
        } catch {
          // ignore malformed messages
        }
      }

      ws.onclose = () => {
        setStatus('disconnected')
        reconnectTimer = setTimeout(() => {
          connect()
          if (onReconnect) {
            onReconnect()
          }
        }, 3000)
      }
    }

    connect()

    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
      }
      if (ws) {
        ws.close()
      }
    }
  }, [onJobUpdated, onReconnect, token])

  return { status }
}
