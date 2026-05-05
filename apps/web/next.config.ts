import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@local/types'],
}

export default nextConfig
