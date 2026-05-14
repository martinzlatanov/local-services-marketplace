'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Loader2, XCircle } from 'lucide-react'
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
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-900 text-white flex-col justify-between px-16 py-20">
        <div className="flex items-center gap-1.5 font-extrabold text-lg tracking-[-0.4px]">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block" />
          LocalPro
        </div>
        <div>
          <p className="eyebrow eyebrow-brand mb-4 text-surface-500">Sign in</p>
          <h2 className="text-[clamp(32px,3.5vw,48px)] font-extrabold tracking-[-1.5px] leading-[1.1] mb-4">
            Welcome back.
          </h2>
          <p className="text-[16px] text-surface-400 leading-relaxed max-w-[360px] mb-10">
            Access your jobs, track progress, and connect with local professionals.
          </p>
          <div className="flex flex-col gap-4">
            {[
              { icon: '🎯', title: 'Post & track jobs', desc: 'Manage the full lifecycle from one dashboard.' },
              { icon: '⚡', title: 'Real-time updates', desc: 'Live status changes via WebSocket.' },
              { icon: '✨', title: 'Trusted providers', desc: 'Verified local professionals in 10 areas.' },
            ].map((f) => (
              <div key={f.icon} className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-surface-800 border border-surface-700 flex items-center justify-center flex-shrink-0 text-sm">
                  {f.icon}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-white mb-0.5">{f.title}</p>
                  <p className="text-[13px] text-surface-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-8 pt-8 border-t border-surface-800">
          {[{ num: '10', label: 'City areas' }, { num: '8', label: 'Categories' }, { num: '<1h', label: 'Response' }].map((s) => (
            <div key={s.label}>
              <p className="text-[24px] font-extrabold tracking-[-1px] font-mono"><span className="text-brand-500">{s.num}</span></p>
              <p className="text-[12px] text-surface-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center py-16 px-8 bg-surface-50">
        <div className="w-full max-w-[440px]">
          <p className="eyebrow mb-5">Step 1 of 1</p>
          <h1 className="text-[30px] font-extrabold tracking-[-0.8px] text-surface-900 mb-1.5">Sign in</h1>
          <p className="text-[14px] text-surface-500 mb-7">Enter your credentials to continue.</p>

          {topError && (
            <div role="alert" className="mb-6 flex gap-3 bg-red-50 border border-red-200 text-red-800 rounded-[var(--radius-btn)] p-4">
              <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>{topError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-bold tracking-[0.04em] uppercase text-surface-600 mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'email-error' : undefined}
                className="w-full bg-surface-0 border border-surface-200 text-surface-900 rounded-[var(--radius-input)] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/10 transition-all"
              />
              {emailError && <span id="email-error" className="text-red-600 text-sm mt-1 block">{emailError}</span>}
            </div>
            <div>
              <label className="block text-[12px] font-bold tracking-[0.04em] uppercase text-surface-600 mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Your password"
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? 'password-error' : undefined}
                className="w-full bg-surface-0 border border-surface-200 text-surface-900 rounded-[var(--radius-input)] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/10 transition-all"
              />
              {passwordError && <span id="password-error" className="text-red-600 text-sm mt-1 block">{passwordError}</span>}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-surface-900 text-white py-3 px-4 rounded-[var(--radius-btn)] hover:opacity-[0.88] disabled:opacity-50 font-bold text-[15px] tracking-[-0.2px] transition-opacity flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                'Sign in →'
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-[14px] text-surface-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-surface-900 font-bold hover:underline">
              Create one →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
