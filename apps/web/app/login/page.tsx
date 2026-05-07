'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import type { ApiErrorResponse } from '@/lib/types'

const TOP_LEVEL_ERROR = 'Something went wrong. Please check your details and try again.'
const NETWORK_ERROR = 'Unable to connect. Check your connection and try again.'

export default function LoginPage() {
  const { login, isLoading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [topError, setTopError] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFieldErrors({})
    setTopError('')
    setSubmitting(true)

    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (error) {
      const apiError = error as ApiErrorResponse
      const errors = apiError?.errors ?? {}
      const recognizedKeys = ['email', 'password', 'credentials']
      const hasRecognizedFieldError = recognizedKeys.some((key) => Boolean(errors[key]))

      if (hasRecognizedFieldError) {
        setFieldErrors(errors)
      } else if (Object.keys(errors).length > 0) {
        setTopError(TOP_LEVEL_ERROR)
      } else {
        setTopError(NETWORK_ERROR)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const emailError = fieldErrors.email
  const passwordError = fieldErrors.password || fieldErrors.credentials

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4">
      <div className="w-full max-w-sm bg-gray-100 rounded p-6 flex flex-col gap-4">
        <h1 className="text-2xl font-semibold leading-tight">Sign in to your account</h1>

        {topError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-base">{topError}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold leading-tight" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className={emailError ? 'border border-red-400 rounded p-2 w-full text-base' : 'border border-gray-200 rounded p-2 w-full text-base'}
            />
            {emailError && <span className="text-red-600 text-sm">{emailError}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold leading-tight" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className={passwordError ? 'border border-red-400 rounded p-2 w-full text-base' : 'border border-gray-200 rounded p-2 w-full text-base'}
            />
            {passwordError && <span className="text-red-600 text-sm">{passwordError}</span>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`bg-indigo-600 text-white rounded py-3 w-full text-sm font-semibold${submitting ? ' opacity-50 cursor-not-allowed' : ''}`}
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-base font-normal leading-relaxed text-center">
          <Link href="/register" className="text-indigo-600">
            Don&apos;t have an account? Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
