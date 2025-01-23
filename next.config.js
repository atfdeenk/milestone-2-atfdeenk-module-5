/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com'
      },
      {
        protocol: 'https',
        hostname: 'api.escuelajs.co'
      },
      {
        protocol: 'https',
        hostname: 'api.lorem.space'
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com'
      }
    ]
  }
};

module.exports = nextConfig;
