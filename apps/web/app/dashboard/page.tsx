'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

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

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <h1 className="text-2xl font-semibold leading-tight">Dashboard</h1>
        {user && <p className="text-base font-normal leading-relaxed text-gray-700">Signed in as {user.email}</p>}
        <button onClick={handleLogout} className="self-start bg-indigo-600 text-white rounded py-3 px-6 text-sm font-semibold">
          Log out
        </button>
      </div>
    </div>
  )
}
