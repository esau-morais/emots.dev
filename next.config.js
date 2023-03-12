/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    typedRoutes: true,
  },
  images: {
    domains: ['localhost', 'emots.dev', 's3.us-west-2.amazonaws.com'],
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
