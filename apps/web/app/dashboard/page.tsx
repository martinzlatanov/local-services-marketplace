'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import { JobDto, JobStatus } from '@local/types'

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<JobDto[]>([])
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')

  // Fetch jobs from API
  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setJobs(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err)
    }
  }, [])

  // Set up WebSocket connection
  useEffect(() => {
    if (!user) return

    let ws: WebSocket | null = null
    let reconnectTimer: NodeJS.Timeout | null = null

    const connectWebSocket = () => {
      setWsStatus('connecting')
      // Get token from cookie
      const cookies = document.cookie.split(';').map(c => c.trim())
      const tokenCookie = cookies.find(c => c.startsWith('token='))
      const token = tokenCookie ? tokenCookie.substring(6) : ''

      ws = new WebSocket(`ws://${window.location.host}?token=${token}`)

      ws.onopen = () => {
        setWsStatus('connected')
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'JOB_UPDATED') {
            const updatedJob: JobDto = data.payload
            setJobs(prevJobs => 
              prevJobs.map(job => job.id === updatedJob.id ? updatedJob : job)
            )
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
        }
      }

      ws.onclose = () => {
        setWsStatus('disconnected')
        // Attempt to reconnect after 3 seconds
        reconnectTimer = setTimeout(() => {
          connectWebSocket()
        }, 3000)
      }

      ws.onerror = (err) => {
        console.error('WebSocket error:', err)
      }
    }

    connectWebSocket()

    // Initial fetch
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <svg className="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="none" aria-label="Loading">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold leading-tight">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className={`text-sm ${wsStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
              {wsStatus === 'connected' ? '● Live' : wsStatus === 'connecting' ? '◌ Connecting...' : '○ Disconnected'}
            </span>
            <button onClick={handleLogout} className="bg-indigo-600 text-white rounded py-3 px-6 text-sm font-semibold">
              Log out
            </button>
          </div>
        </div>
        {user && <p className="text-base font-normal leading-relaxed text-gray-700">Signed in as {user.email}</p>}
        
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Your Jobs</h2>
          {jobs.length === 0 ? (
            <p className="text-gray-500">No jobs found.</p>
          ) : (
            <div className="space-y-4">
              {jobs.map(job => (
                <div key={job.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{job.category}</h3>
                      <p className="text-sm text-gray-600 mt-1">{job.description}</p>
                      <p className="text-xs text-gray-500 mt-2">{job.cityArea} • {job.timeframe}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      job.status === JobStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                      job.status === JobStatus.ACCEPTED ? 'bg-blue-100 text-blue-800' :
                      job.status === JobStatus.IN_PROGRESS ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
