'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Role, type ApiErrorResponse } from '@/lib/types'
import { Loader2, XCircle } from 'lucide-react'

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

  const strengthPercent = Math.min(100, password.length * 8 + ((/[^a-zA-Z0-9]/.test(password)) ? 20 : 0))
  const strengthLabel = strengthPercent < 40 ? 'Weak' : strengthPercent < 70 ? 'Fair' : strengthPercent < 90 ? 'Good' : 'Strong'
  const strengthColor = strengthPercent < 40 ? '#ef4444' : strengthPercent < 70 ? '#f59e0b' : strengthPercent < 90 ? '#14b8a6' : '#22c55e'

  return (
    <div className="min-h-screen flex items-stretch">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-900 text-white flex-col justify-between px-16 py-20">
        <div className="flex items-center gap-1.5 font-extrabold text-lg tracking-[-0.4px]">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block" />
          LocalPro
        </div>
        <div>
          <p className="eyebrow eyebrow-brand mb-4 text-surface-500">Create account</p>
          <h2 className="text-[clamp(32px,3.5vw,48px)] font-extrabold tracking-[-1.5px] leading-[1.1] mb-4">
            Join the community.
          </h2>
          <p className="text-[16px] text-surface-400 leading-relaxed max-w-[360px] mb-10">
            Get started in minutes. Post jobs or find local work opportunities.
          </p>
          <div className="flex flex-col gap-4">
            {[
              { icon: '🚀', title: 'Quick setup', desc: 'Get started in just a few seconds.' },
              { icon: '💼', title: 'Manage everything', desc: 'Track your profile and activity in one place.' },
              { icon: '🔒', title: 'Secure by default', desc: 'Encrypted passwords and protected routes.' },
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
          <h1 className="text-[30px] font-extrabold tracking-[-0.8px] text-surface-900 mb-1.5">Create your account</h1>
          <p className="text-[14px] text-surface-500 mb-7">Choose your role to get started.</p>

          {topError && (
            <div role="alert" className="mb-6 flex gap-3 bg-red-50 border border-red-200 text-red-800 rounded-[var(--radius-btn)] p-4">
              <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>{topError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Picker */}
            <div>
              <p className="text-[12px] font-bold tracking-[0.06em] uppercase text-surface-600 mb-2.5">I want to…</p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {([
                  { value: Role.CLIENT,   icon: '🏠', title: 'Post jobs',  desc: 'I need local help with tasks around my home or business.' },
                  { value: Role.PROVIDER, icon: '🔧', title: 'Find work',  desc: 'I offer a skill and want to find jobs in my area.' },
                ] as const).map((opt) => (
                  <label
                    key={opt.value}
                    className={`relative p-4 border rounded-[10px] cursor-pointer flex flex-col gap-1.5 transition-all ${
                      role === opt.value
                        ? 'border-surface-900 shadow-[0_0_0_1px_#0f172a] bg-surface-0'
                        : 'border-surface-200 bg-surface-0 hover:border-surface-300'
                    }`}
                  >
                    <input type="radio" name="role" value={opt.value} checked={role === opt.value} onChange={(e) => setRole(e.target.value as Role)} className="sr-only" />
                    {/* Radio check dot */}
                    <span className={`absolute top-2.5 right-2.5 w-[18px] h-[18px] rounded-full border flex items-center justify-center ${
                      role === opt.value ? 'bg-surface-900 border-surface-900' : 'border-surface-200 bg-surface-0'
                    }`}>
                      {role === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />}
                    </span>
                    <span className="text-xl mb-0.5">{opt.icon}</span>
                    <span className={`text-[14px] font-bold ${role === opt.value ? 'text-surface-900' : 'text-surface-800'}`}>{opt.title}</span>
                    <span className="text-[12px] text-surface-400 leading-snug">{opt.desc}</span>
                  </label>
                ))}
              </div>
              {roleError && <span className="text-red-600 text-sm mb-3 block">{roleError}</span>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-[12px] font-bold tracking-[0.04em] uppercase text-surface-600 mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!emailError}
                aria-describedby={emailError ? 'email-error' : undefined}
                className="w-full bg-surface-0 border border-surface-200 text-surface-900 rounded-[var(--radius-input)] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/10 transition-all"
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
              <label className="block text-[12px] font-bold tracking-[0.04em] uppercase text-surface-600 mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Choose a password"
                aria-invalid={!!passwordError}
                aria-describedby={passwordError ? 'password-error' : undefined}
                className="w-full bg-surface-0 border border-surface-200 text-surface-900 rounded-[var(--radius-input)] px-3.5 py-2.5 text-[14px] focus:outline-none focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/10 transition-all"
                required
              />
              {passwordError && (
                <span id="password-error" className="text-red-600 text-sm mt-1 block">
                  {passwordError}
                </span>
              )}
              <div className="mt-1.5 h-[3px] rounded-sm bg-surface-100 overflow-hidden">
                <div style={{ width: `${strengthPercent}%`, background: strengthColor }} className="h-full rounded-sm transition-all duration-300" />
              </div>
              <p className="text-[11px] text-surface-400 mt-1">{strengthLabel}{strengthPercent >= 70 ? ' — add a symbol to make it stronger' : ''}</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-surface-900 text-white py-3 px-4 rounded-[var(--radius-btn)] hover:opacity-[0.88] disabled:opacity-50 font-bold text-[15px] tracking-[-0.2px] transition-opacity flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Creating account…
                </>
              ) : (
                'Create account →'
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-[14px] text-surface-500">
            Already have an account?{' '}
            <Link href="/login" className="text-surface-900 font-bold hover:underline">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
