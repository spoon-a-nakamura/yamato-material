/** @type {import('next').NextConfig} */
const nextConfig = {
  // バックエンド不要の静的サイトとして書き出す（提案書 11-2 B案 / Vercel 静的配信を想定）
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
}
export default nextConfig
