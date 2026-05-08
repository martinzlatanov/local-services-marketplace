'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Wrench, Menu, X } from 'lucide-react'

export default function Navbar() {
  const { user, isLoading, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setMobileMenuOpen(false)
  }

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-surface-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-brand-700 hover:text-brand-600 transition-colors">
            <Wrench className="h-6 w-6" aria-hidden="true" />
            <span>LocalPro</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {!user && !isLoading && (
              <>
                <Link
                  href="/login"
                  className="text-surface-600 hover:text-surface-900 font-medium transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-4 py-2.5 bg-accent-500 text-white font-medium rounded-[var(--radius-btn)] hover:bg-accent-600 transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
            {user && (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-surface-700 bg-surface-100 px-3 py-1.5 rounded-[var(--radius-badge)]">
                    {user.role === 'CLIENT' ? 'Client' : 'Provider'}
                  </span>
                  <span className="text-sm text-surface-600">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-surface-600 hover:text-surface-900 font-medium transition-colors px-4 py-2 rounded-[var(--radius-btn)] hover:bg-surface-100"
                >
                  Log out
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-[var(--radius-btn)] hover:bg-surface-100 transition-colors"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-surface-200 flex flex-col gap-3">
            {!user && !isLoading && (
              <>
                <Link
                  href="/login"
                  className="text-surface-600 hover:text-surface-900 font-medium transition-colors px-4 py-2"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-4 py-2.5 bg-accent-500 text-white font-medium rounded-[var(--radius-btn)] hover:bg-accent-600 transition-colors w-full"
                >
                  Get started
                </Link>
              </>
            )}
            {user && (
              <>
                <div className="px-4 py-2">
                  <p className="text-sm font-medium text-surface-700">{user.email}</p>
                  <span className="inline-block text-xs font-medium text-surface-600 bg-surface-100 px-2 py-1 rounded-[var(--radius-badge)] mt-1">
                    {user.role === 'CLIENT' ? 'Client' : 'Provider'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-left text-surface-600 hover:text-surface-900 font-medium transition-colors px-4 py-2"
                >
                  Log out
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
