const nextConfig = {
  async rewrites() {
    return [
      { 
        source: '/complete_flow', 
        destination: 'https://grounds-spam-proof-islamic.trycloudflare.com/complete_flow' 
      },
      { 
        source: '/process', 
        destination: 'https://grounds-spam-proof-islamic.trycloudflare.com/process' 
      },
      { 
        source: '/health', 
        destination: 'https://grounds-spam-proof-islamic.trycloudflare.com/health' 
      }
    ]
  },
  experimental: {
    proxyTimeout: 600000,
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
