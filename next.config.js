/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs', 'net', 'dns' module on the client side
      config.resolve.fallback = {
        fs: false,
        net: false,
        dns: false,
        path: false,
        tls: false,
      }
    }

    return config
  },
}

module.exports = nextConfig
