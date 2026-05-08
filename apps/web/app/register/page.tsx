'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Role, type ApiErrorResponse } from '@/lib/types'
import { Wrench, User, Loader2, XCircle } from 'lucide-react'

const TOP_LEVEL_ERROR = 'Something went wrong. Please check your details and try again.'
const NETWORK_ERROR = 'Unable to connect. Check your connection and try again.'

export default function RegisterPage() {
  const { setUser, isLoading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>(Role.CLIENT)
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      })

      if (!response.ok) {
        const error = (await response.json()) as ApiErrorResponse
        const errors = error?.errors ?? {}
        const recognizedKeys = ['email', 'password', 'role']
        const hasRecognizedFieldError = recognizedKeys.some((key) => Boolean(errors[key]))

        if (hasRecognizedFieldError) {
          setFieldErrors(errors)
        } else if (Object.keys(errors).length > 0) {
          setTopError(TOP_LEVEL_ERROR)
        } else {
          setTopError(NETWORK_ERROR)
        }

        return
      }

      const registerResponse = await response.json() as { user?: any }
      if (registerResponse.user) {
        setUser(registerResponse.user)
      }
      router.push('/dashboard')
    } catch (error) {
      setTopError(NETWORK_ERROR)
    } finally {
      setSubmitting(false)
    }
  }

  const emailError = fieldErrors.email
  const passwordError = fieldErrors.password
  const roleError = fieldErrors.role

  return (
    <div className="min-h-screen flex items-stretch">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-700 to-brand-900 text-white flex-col justify-center px-12">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <Wrench className="h-8 w-8" aria-hidden="true" />
            <span className="text-3xl font-bold">LocalPro</span>
          </div>
          <h2 className="text-4xl font-bold mb-6">Join the community</h2>
          <p className="text-brand-100 text-lg mb-8">
            Get started in minutes. Post jobs or find local work opportunities.
          </p>
          <div className="space-y-4 text-brand-100">
            <p className="flex items-start gap-3">
              <span className="text-2xl mt-1">🚀</span>
              <span>Get started in just a few seconds</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-2xl mt-1">💼</span>
              <span>Manage your profile and track your activity</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-2xl mt-1">🔒</span>
              <span>Secure account with encrypted passwords</span>
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center py-12 px-4 bg-surface-50">
        <div className="w-full max-w-md">
          <div className="bg-surface-0 border border-surface-200 rounded-[var(--radius-card)] p-8 shadow-[var(--shadow-auth)]">
            {/* Header */}
            <div className="flex lg:hidden items-center gap-2 mb-8">
              <Wrench className="h-6 w-6 text-brand-600" aria-hidden="true" />
              <span className="text-2xl font-bold text-brand-700">LocalPro</span>
            </div>

            <h1 className="text-3xl font-bold text-surface-900 mb-2">Create your account</h1>
            <p className="text-surface-600 mb-6">Choose your role to get started</p>

            {topError && (
              <div role="alert" className="mb-6 flex gap-3 bg-red-50 border border-red-200 text-red-800 rounded-[var(--radius-btn)] p-4">
                <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>{topError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selector Cards */}
              <fieldset>
                <legend className="block text-sm font-medium text-surface-700 mb-3">What are you?</legend>
                <div className="space-y-3">
                  <label className={`flex items-center p-4 border-2 rounded-[var(--radius-card)] cursor-pointer transition-all ${
                    role === Role.CLIENT
                      ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500'
                      : 'border-surface-200 bg-surface-0 hover:border-surface-300'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value={Role.CLIENT}
                      checked={role === Role.CLIENT}
                      onChange={(e) => setRole(e.target.value as Role)}
                      className="sr-only"
                    />
                    <User className="h-6 w-6 text-surface-600 mr-3 flex-shrink-0" aria-hidden="true" />
                    <div className="flex-1">
                      <p className="font-semibold text-surface-900">I need help</p>
                      <p className="text-sm text-surface-600">Post jobs and find local professionals</p>
                    </div>
                  </label>

                  <label className={`flex items-center p-4 border-2 rounded-[var(--radius-card)] cursor-pointer transition-all ${
                    role === Role.PROVIDER
                      ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500'
                      : 'border-surface-200 bg-surface-0 hover:border-surface-300'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value={Role.PROVIDER}
                      checked={role === Role.PROVIDER}
                      onChange={(e) => setRole(e.target.value as Role)}
                      className="sr-only"
                    />
                    <Wrench className="h-6 w-6 text-surface-600 mr-3 flex-shrink-0" aria-hidden="true" />
                    <div className="flex-1">
                      <p className="font-semibold text-surface-900">I provide services</p>
                      <p className="text-sm text-surface-600">Offer your skills and find work</p>
                    </div>
                  </label>
                </div>
                {roleError && <span className="text-red-600 text-sm mt-2 block">{roleError}</span>}
              </fieldset>

              {/* Email */}
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
                  required
                />
                {emailError && (
                  <span id="email-error" className="text-red-600 text-sm mt-1 block">
                    {emailError}
                  </span>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  aria-invalid={!!passwordError}
                  aria-describedby={passwordError ? 'password-error' : undefined}
                  className="w-full border border-surface-300 bg-surface-0 text-surface-900 rounded-[var(--radius-input)] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
                {passwordError && (
                  <span id="password-error" className="text-red-600 text-sm mt-1 block">
                    {passwordError}
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-600 text-white py-2.5 px-4 rounded-[var(--radius-btn)] hover:bg-brand-700 disabled:bg-brand-300 font-medium transition-colors flex items-center justify-center gap-2 mt-6"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-surface-600">
              Already have an account?{' '}
              <Link href="/login" className="text-brand-600 hover:text-brand-700 font-semibold">
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
