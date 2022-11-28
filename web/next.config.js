module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["sbleaping.s3.us-east-1.amazonaws.com", "replicate.delivery", "i.imgur.com"],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/feed',
        permanent: true
      }
    ]
  }
}
