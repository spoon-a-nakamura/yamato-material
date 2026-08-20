import type { Metadata, Viewport } from 'next'
import { AppProviders } from '@/app/app'
import { SITE_NAME, pageMeta } from '@/lib/meta'
import './globals.css'

const { title, description } = pageMeta('/')

export const metadata: Metadata = {
  title,
  description,
  applicationName: SITE_NAME,
  // 本Webカタログは既存コーポレートサイトからの遷移先という位置づけ（提案書 3-2）。
  // 加えて本デモは実データ（ご提供の仕様リスト）を含むため、検索エンジンには載せない。
  robots: { index: false, follow: false },
  // 社内やお客さまと Slack・Teams・メールで共有したときのリンクプレビュー用。
  // noindex でも SNS/チャットのカード表示には効く。
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: SITE_NAME,
    title,
    description,
  },
  twitter: { card: 'summary', title, description },
  // 数字だけの品番や寸法が電話番号として自動リンクされるのを防ぐ
  formatDetection: { telephone: false, address: false, email: false },
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
