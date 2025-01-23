/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'i.imgur.com',
      'api.escuelajs.co',
      'ui-avatars.com',
      'images.unsplash.com',
      'api.lorem.space',
      'encrypted-tbn0.gstatic.com'
    ],
  },
}

module.exports = nextConfig
