import type { Metadata, Viewport } from 'next'
import { AppProviders } from '@/app/app'
import './globals.css'

export const metadata: Metadata = {
  title: 'ヤマトマテリアル Webカタログ（デモ）',
  description:
    '紙カタログのページ数から商品を引ける Webカタログのフロントエンド・デモ。容量・口の形・材質での絞り込み、簡易図面の表示、検討リストの保存に対応。',
  // 本Webカタログは既存コーポレートサイトからの遷移先という位置づけ（提案書 3-2）
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#33415c',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {/* 検討リスト・社内モードの状態は、ページ遷移をまたいで保持される必要があるため
            ここ（layout）に置く。page.tsx 側に置くと遷移のたびにリセットされる */}
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
