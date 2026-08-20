/* 配置先のサブディレクトリ。next-nav.tsx と同じ値を参照する必要があるため、
   環境変数を単一の出所にしている（未指定なら本番の配置先 /demo）。 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/demo'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // バックエンド不要の静的サイトとして書き出す（提案書 11-2 B案 / Vercel 静的配信を想定）
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,

  /* http://yamato-material.checked.jp/demo/ 配下に配置するため、
     basePath を指定する。これがないと _next/ やリンクがドメイン直下
     （/_next/...）を指してしまい、サブディレクトリでは404になる。
     basePath はアセットと router.push には効くが、素の <a href> には
     効かないため、src/app/next-nav.tsx 側でも同じ値を前置している。 */
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
}
export default nextConfig
