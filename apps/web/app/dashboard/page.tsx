'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { JobDto, Role } from '@/lib/types'
import LiveIndicator from '@/components/ui/LiveIndicator'
import ClientDashboard from '@/components/dashboard/ClientDashboard'
import ProviderDashboard from '@/components/dashboard/ProviderDashboard'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<JobDto[]>([])
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setJobs(data.data || [])
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (!user) return

    let ws: WebSocket | null = null
    let reconnectTimer: NodeJS.Timeout | null = null

    const connectWebSocket = () => {
      setWsStatus('connecting')
      const cookies = document.cookie.split(';').map(c => c.trim())
      const tokenCookie = cookies.find(c => c.startsWith('token='))
      const token = tokenCookie ? tokenCookie.substring(6) : ''

      ws = new WebSocket(`ws://${window.location.host}?token=${token}`)

      ws.onopen = () => setWsStatus('connected')

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'JOB_UPDATED') {
            const updatedJob: JobDto = data.payload
            setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j))
          }
        } catch {}
      }

      ws.onclose = () => {
        setWsStatus('disconnected')
        reconnectTimer = setTimeout(connectWebSocket, 3000)
      }

      ws.onerror = () => {}
    }

    connectWebSocket()
    fetchJobs()

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer)
      if (ws) ws.close()
    }
  }, [user, fetchJobs])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-brand-600 animate-spin" aria-label="Loading dashboard" />
          <p className="text-surface-600">Loading...</p>
        </div>
      </div>
    )
  }

  const handleJobPosted = (newJob: JobDto) => {
    setJobs(prev => [newJob, ...prev])
  }

  const handleJobUpdate = (updatedJob: JobDto) => {
    setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j))
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
            {user && (
              <div className="flex items-center gap-3 mt-1">
                <p className="text-sm text-surface-600">{user.email}</p>
                <span className="text-xs font-medium text-surface-600 bg-surface-100 px-2.5 py-1 rounded-[var(--radius-badge)]">
                  {user.role === Role.CLIENT ? 'Client' : 'Provider'}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-5">
            <LiveIndicator status={wsStatus} />
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-surface-900 border border-surface-300 rounded-[var(--radius-btn)] hover:bg-surface-100 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Role-split dashboard content */}
        {user?.role === Role.CLIENT ? (
          <ClientDashboard
            jobs={jobs}
            onJobPosted={handleJobPosted}
            onJobUpdate={handleJobUpdate}
            userId={parseInt(user.id, 10)}
          />
        ) : (
          <ProviderDashboard />
        )}
      </div>
    </div>
  )
}
