/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        output: 'export',
        trailingSlash: true,
        exportPathMap: function () {
          return {
            '/': { page: '/' },
            '/dex': { page: '/dex' },
            '/nfts': { page: '/nfts' },
            '/dao': { page: '/dao' },
          }
        },
      },
    ],
  },
}

module.exports = nextConfig
