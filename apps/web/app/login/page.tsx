'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Wrench, Loader2, XCircle } from 'lucide-react'
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
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-brand-600 animate-spin" aria-label="Loading" />
          <p className="text-surface-600">Loading...</p>
        </div>
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
    <div className="min-h-screen flex items-stretch">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-700 to-brand-900 text-white flex-col justify-center px-12">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <Wrench className="h-8 w-8" aria-hidden="true" />
            <span className="text-3xl font-bold">LocalPro</span>
          </div>
          <h2 className="text-4xl font-bold mb-6">Welcome back</h2>
          <p className="text-brand-100 text-lg mb-8">
            Access your account to post jobs, find work, or manage your services.
          </p>
          <div className="space-y-4 text-brand-100">
            <p className="flex items-start gap-3">
              <span className="text-2xl mt-1">🎯</span>
              <span>Post jobs and connect with local professionals</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-2xl mt-1">⚡</span>
              <span>Real-time notifications when pros respond</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-2xl mt-1">✨</span>
              <span>Track your jobs from start to finish</span>
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center py-16 px-4 bg-surface-50">
        <div className="w-full max-w-md">
          <div className="bg-surface-0 border border-surface-200 rounded-[var(--radius-card)] p-8 shadow-[var(--shadow-auth)]">
            {/* Header */}
            <div className="flex lg:hidden items-center gap-2 mb-8">
              <Wrench className="h-6 w-6 text-brand-600" aria-hidden="true" />
              <span className="text-2xl font-bold text-brand-700">LocalPro</span>
            </div>

            <h1 className="text-3xl font-bold text-surface-900 mb-2">Welcome back</h1>
            <p className="text-surface-600 mb-6">Sign in to your account to continue</p>

            {topError && (
              <div role="alert" className="mb-6 flex gap-3 bg-red-50 border border-red-200 text-red-800 rounded-[var(--radius-btn)] p-4">
                <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>{topError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? 'email-error' : undefined}
                  className="w-full border border-surface-300 bg-surface-0 text-surface-900 rounded-[var(--radius-input)] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {emailError && (
                  <span id="email-error" className="text-red-600 text-sm mt-1 block">
                    {emailError}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  aria-invalid={!!passwordError}
                  aria-describedby={passwordError ? 'password-error' : undefined}
                  className="w-full border border-surface-300 bg-surface-0 text-surface-900 rounded-[var(--radius-input)] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {passwordError && (
                  <span id="password-error" className="text-red-600 text-sm mt-1 block">
                    {passwordError}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-600 text-white py-2.5 px-4 rounded-[var(--radius-btn)] hover:bg-brand-700 disabled:bg-brand-300 font-medium transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-surface-600">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-brand-600 hover:text-brand-700 font-semibold">
                Create one →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
