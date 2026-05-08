import Link from 'next/link'
import { JOB_CATEGORIES, CITY_AREAS } from '@/lib/types'
import { Droplets, Zap, Sparkles, Leaf, Truck, Hammer, Paintbrush2, MoreHorizontal, ArrowRight } from 'lucide-react'

const categoryIcons: Record<string, any> = {
  PLUMBING: Droplets,
  ELECTRICAL: Zap,
  CLEANING: Sparkles,
  GARDENING: Leaf,
  MOVING: Truck,
  HANDYMAN: Hammer,
  PAINTING: Paintbrush2,
  OTHER: MoreHorizontal,
}

export default function Home() {
  return (
    <main className="bg-surface-50">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 flex items-center justify-center overflow-hidden">
        {/* Gradient orb background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-96 h-96 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-600 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Find trusted help, fast
          </h1>
          <p className="text-xl sm:text-2xl text-brand-100 mb-12 max-w-2xl mx-auto">
            Post a job in 60 seconds. Local professionals respond within the hour.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/register?role=CLIENT"
              className="inline-flex items-center justify-center px-8 py-4 bg-accent-500 text-white font-semibold rounded-[var(--radius-btn)] hover:bg-accent-600 transition-colors shadow-lg"
            >
              Post a Job
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href="/register?role=PROVIDER"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white font-semibold rounded-[var(--radius-btn)] hover:bg-white/20 border border-white/30 transition-colors"
            >
              Find Work
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Link>
          </div>

          <div className="text-sm text-brand-200 flex flex-col sm:flex-row justify-center gap-6">
            <span>10 City Areas</span>
            <span>•</span>
            <span>8 Service Categories</span>
            <span>•</span>
            <span>Real-time job updates</span>
          </div>
        </div>
      </section>

      {/* Service Categories Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-surface-900 mb-4">What can we help you with?</h2>
            <p className="text-lg text-surface-600">Browse popular service categories</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {JOB_CATEGORIES.map((category) => {
              const Icon = categoryIcons[category]
              return (
                <div
                  key={category}
                  className="bg-surface-0 border border-surface-200 rounded-[var(--radius-card)] p-6 text-center hover:shadow-[var(--shadow-card-hover)] hover:scale-105 transition-all duration-200 cursor-pointer"
                >
                  <Icon className="h-10 w-10 text-brand-600 mx-auto mb-3" aria-hidden="true" />
                  <p className="font-medium text-surface-900">{category}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-0">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-surface-900 mb-4">How it works</h2>
            <p className="text-lg text-surface-600">Three simple steps to get things done</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-2xl font-bold">
                  1
                </div>
              </div>
              <h3 className="text-xl font-semibold text-surface-900 mb-3">Describe your job</h3>
              <p className="text-surface-600">Tell us what you need done. Pick a category, location, and timeframe.</p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-2xl font-bold">
                  2
                </div>
              </div>
              <h3 className="text-xl font-semibold text-surface-900 mb-3">Get matched instantly</h3>
              <p className="text-surface-600">Local professionals see your job in real-time and start bidding.</p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-2xl font-bold">
                  3
                </div>
              </div>
              <h3 className="text-xl font-semibold text-surface-900 mb-3">Get to work</h3>
              <p className="text-surface-600">Accept a professional and start your project right away.</p>
            </div>
          </div>
        </div>
      </section>

      {/* City Coverage */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-surface-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-surface-900 mb-8 text-center">Available in</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {CITY_AREAS.map((area) => (
              <span
                key={area}
                className="inline-flex px-4 py-2 bg-surface-100 text-surface-700 rounded-[var(--radius-badge)] text-sm font-medium"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-950 text-brand-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 mb-12">
          {/* Left side - Logo and tagline */}
          <div>
            <div className="flex items-center gap-2 font-bold text-2xl text-white mb-4">
              <Truck className="h-7 w-7" aria-hidden="true" />
              <span>LocalPro</span>
            </div>
            <p className="text-brand-200">Connecting locals with trusted professionals in every neighborhood.</p>
          </div>

          {/* Right side - Links */}
          <div className="md:text-right space-y-3">
            <Link href="/" className="block hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/login" className="block hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/register" className="block hover:text-white transition-colors">
              Get started
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-brand-800 pt-8 text-center text-brand-200 text-sm">
          <p>&copy; 2025 LocalPro. All rights reserved.</p>
        </div>
      </footer>

      {/* Debug status (kept for any existing tests) */}
      <span className="sr-only" data-testid="status">Page loaded</span>
    </main>
  )
}
