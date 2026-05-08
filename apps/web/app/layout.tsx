import { Inter } from 'next/font/google'
import type { ReactNode } from 'react'
import './globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import Navbar from '../components/layout/Navbar'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata = {
  title: 'LocalPro — Find Trusted Local Services',
  description: 'Connect with vetted local professionals for plumbing, electrical, cleaning, gardening, and more.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-surface-50 text-surface-900 antialiased">
        <AuthProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
        </AuthProvider>
      </body>
    </html>
  )
}
