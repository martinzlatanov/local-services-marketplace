import Link from 'next/link'
import { JOB_CATEGORIES } from '@/lib/types'
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
    <>
      {/* Sticky Nav */}
      <nav className="nav-sticky flex items-center justify-between px-16">
        <a href="/" className="flex items-center gap-1.5 font-extrabold text-base tracking-[-0.5px] text-surface-900 no-underline">
          <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
          LocalPro
        </a>
        <div className="flex gap-2">
          <Link href="/login" className="text-[13px] font-medium text-surface-600 px-3 py-[7px] rounded-md hover:bg-surface-100 transition-colors">
            Log in
          </Link>
          <Link href="/register" className="text-[13px] font-semibold text-white bg-surface-900 px-3.5 py-[7px] rounded-md hover:opacity-[0.88] transition-opacity">
            Get started
          </Link>
        </div>
      </nav>

      <main className="bg-surface-0">
        {/* Announcement bar */}
        <div className="bg-surface-100 border-b border-surface-200 px-16 py-2.5 flex items-center gap-2 text-[13px] text-surface-600">
          <span className="pulse-dot" />
          <span className="font-medium text-surface-900">Now live</span>
          <span>— LocalPro connects clients with trusted local professionals in real-time.</span>
        </div>

        {/* Hero section */}
        <section className="border-b border-surface-200">
          <div className="grid grid-cols-[1fr_1px_1fr] min-h-[calc(100vh-56px-40px)]">
            {/* Left: headline + CTAs */}
            <div className="flex flex-col justify-center px-16 py-20">
              <p className="eyebrow mb-5">Local Services Marketplace</p>
              <h1 className="text-[clamp(40px,5vw,64px)] font-extrabold tracking-[-2.5px] text-surface-900 leading-[1.05] mb-5">
                Find trusted<br />help, fast.
              </h1>
              <p className="text-[17px] text-surface-500 leading-relaxed max-w-sm mb-10">
                Post a job in 60 seconds. Local professionals respond within the hour.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/register?role=CLIENT"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-surface-900 text-white text-[14px] font-semibold rounded-[var(--radius-btn)] hover:opacity-[0.88] transition-opacity"
                >
                  Post a Job
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/register?role=PROVIDER"
                  className="inline-flex items-center gap-2 px-6 py-3 border border-surface-200 text-surface-700 text-[14px] font-semibold rounded-[var(--radius-btn)] hover:bg-surface-50 transition-colors"
                >
                  Find Work
                </Link>
              </div>
            </div>
            {/* Divider */}
            <div className="bg-surface-200" />
            {/* Right: metrics + live activity */}
            <div className="flex flex-col justify-center px-16 py-20 bg-surface-50">
              <div className="grid grid-cols-3 border border-surface-200 rounded-[var(--radius-card)] overflow-hidden mb-8">
                {[
                  { num: '10', label: 'City areas' },
                  { num: '8',  label: 'Categories' },
                  { num: '<1h', label: 'Response' },
                ].map((stat, i) => (
                  <div key={i} className={`p-6 ${i < 2 ? 'border-r border-surface-200' : ''}`}>
                    <p className="text-[28px] font-extrabold tracking-[-1px] text-surface-900 font-mono">{stat.num}</p>
                    <p className="text-[12px] text-surface-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="border border-surface-200 rounded-[var(--radius-card)] overflow-hidden">
                <div className="px-4 py-3 border-b border-surface-200 flex items-center gap-2 text-[12px] font-semibold text-surface-600 uppercase tracking-[0.06em]">
                  <span className="pulse-dot" />
                  Live activity
                </div>
                {[
                  { area: 'City Centre', cat: 'Plumbing', time: '2m ago' },
                  { area: 'Southside',   cat: 'Cleaning', time: '5m ago' },
                  { area: 'Northside',   cat: 'Electrical', time: '9m ago' },
                ].map((item, i) => (
                  <div key={i} className={`px-4 py-3 flex items-center justify-between text-[13px] ${i < 2 ? 'border-b border-surface-200' : ''}`}>
                    <span className="font-medium text-surface-800">{item.cat}</span>
                    <span className="text-surface-500">{item.area} · {item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Feature strip */}
        <section className="border-b border-surface-200 py-20 px-16">
          <p className="eyebrow mb-10">How it works</p>
          <div className="grid grid-cols-3 gap-0 border border-surface-200 rounded-[var(--radius-card)] overflow-hidden">
            {[
              { num: '01', title: 'Describe your job', desc: 'Pick a category, set your location and timeframe.' },
              { num: '02', title: 'Get matched instantly', desc: 'Professionals in your area see your job in real-time.' },
              { num: '03', title: 'Track to completion', desc: 'Accept a provider and follow the job through to done.' },
            ].map((step, i) => (
              <div key={i} className={`p-8 ${i < 2 ? 'border-r border-surface-200' : ''}`}>
                <p className="text-[11px] font-bold tracking-[0.06em] text-surface-400 mb-4">{step.num} /</p>
                <h3 className="text-[18px] font-bold tracking-[-0.4px] text-surface-900 mb-3">{step.title}</h3>
                <p className="text-[14px] text-surface-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Categories table */}
        <section className="border-b border-surface-200 py-20 px-16">
          <p className="eyebrow mb-10">Service categories</p>
          <div className="border border-surface-200 rounded-[var(--radius-card)] overflow-hidden">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50">
                  <th className="text-left px-4 py-3 text-[11px] font-bold tracking-[0.06em] text-surface-500 uppercase">Category</th>
                  <th className="text-right px-4 py-3 text-[11px] font-bold tracking-[0.06em] text-surface-500 uppercase w-32">Action</th>
                </tr>
              </thead>
              <tbody>
                {JOB_CATEGORIES.map((category, i) => {
                  const Icon = categoryIcons[category]
                  return (
                    <tr key={category} className={`${i < JOB_CATEGORIES.length - 1 ? 'border-b border-surface-200' : ''} hover:bg-surface-50 transition-colors`}>
                      <td className="px-4 py-3.5 flex items-center gap-3">
                        <Icon className="w-4 h-4 text-surface-400" aria-hidden="true" />
                        <span className="font-medium text-surface-800">{category.charAt(0) + category.slice(1).toLowerCase()}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link href={`/browse?category=${category}`} className="text-[13px] text-surface-500 hover:text-surface-900 transition-colors">
                          Browse →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-surface-900 text-surface-400 py-14 px-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-extrabold text-base text-white">
              <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
              LocalPro
            </div>
            <div className="flex gap-6 text-[13px]">
              <Link href="/login" className="hover:text-white transition-colors">Log in</Link>
              <Link href="/register" className="hover:text-white transition-colors">Get started</Link>
            </div>
          </div>
          <div className="border-t border-surface-800 mt-10 pt-8 text-[12px] text-surface-500">
            &copy; {new Date().getFullYear()} LocalPro. All rights reserved.
          </div>
        </footer>

        {/* Debug status (kept for any existing tests) */}
        <span className="sr-only" data-testid="status">Page loaded</span>
      </main>
    </>
  )
}
