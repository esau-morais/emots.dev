/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: '**.s3.us-west-2.amazonaws.com',
      },
    ],
  },
  redirects: async () => {
    return [
      {
        source: '/links',
        destination: 'https://links.emots.dev',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
