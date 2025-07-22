const nextConfig = {
  async rewrites() {
    return [
      { source: '/complete_flow', destination: 'http://localhost:5000/complete_flow' },
      { source: '/process', destination: 'http://localhost:5000/process' },
      { source: '/health', destination: 'http://localhost:5000/health' }
    ]
  },
  experimental: {
    proxyTimeout: 600000, // 10 minutes
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
