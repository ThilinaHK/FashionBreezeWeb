/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  swcMinify: false,
  experimental: {
    optimizeCss: false,
    esmExternals: false,
  },
  webpack: (config, { dev, isServer }) => {
    // Handle client-side only modules
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
      }
    }
    
    // Define global variables to prevent 'self is not defined' errors
    const webpack = require('webpack')
    config.plugins = config.plugins || []
    config.plugins.push(
      new webpack.DefinePlugin({
        'typeof window': JSON.stringify(isServer ? 'undefined' : 'object'),
        'typeof self': JSON.stringify(isServer ? 'undefined' : 'object'),
        'typeof global': JSON.stringify('object'),
      })
    )
    
    // Simplified chunk splitting
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      }
    }
    
    return config
  },
}

module.exports = nextConfig