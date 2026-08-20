'use client'
import * as React from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SiteHeader } from '@/components/site-header'
import { Link, useNav } from '@/app/nav'
import { InternalModeProvider } from '@/app/internal-mode'
import { ShortlistProvider } from '@/app/shortlist'
import { HomeScreen } from '@/screens/home'
import { ProductsScreen } from '@/screens/products'
import { ProductScreen } from '@/screens/product'
import { PageScreen } from '@/screens/page'
import { ShortlistScreen } from '@/screens/shortlist'
import { AboutScreen } from '@/screens/about'

/** 画面の外枠（ヘッダー・フッター・各プロバイダ） */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <InternalModeProvider>
      <ShortlistProvider>
        <TooltipProvider delayDuration={200}>
          <div className="flex min-h-dvh flex-col">
            <SiteHeader />
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </div>
        </TooltipProvider>
      </ShortlistProvider>
    </InternalModeProvider>
  )
}

function SiteFooter() {
  return (
    <footer className="mt-12 border-t bg-muted/40 no-print">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-1 px-4 py-5 text-xs text-muted-foreground">
        <p>
          ヤマトマテリアル株式会社 Webカタログ（デモ）
        </p>
        <Link href="/about" className="hover:text-foreground hover:underline">このデモについて</Link>
        <p className="ml-auto">制作：スタジオスプーン株式会社</p>
      </div>
    </footer>
  )
}

/** 単一HTML版で使うルーター（Next.js 版は app/ 配下の各ルートが担う） */
export function App() {
  const { path } = useNav()

  const body = React.useMemo(() => {
    if (path === '/') return <HomeScreen />
    if (path === '/products') return <ProductsScreen />
    if (path === '/shortlist') return <ShortlistScreen />
    if (path === '/about') return <AboutScreen />
    const prod = path.match(/^\/products\/(.+)$/)
    if (prod) return <ProductScreen slug={prod[1]} />
    const pg = path.match(/^\/page\/(\d+)$/)
    if (pg) return <PageScreen pageNumber={Number(pg[1])} />
    return <NotFound path={path} />
  }, [path])

  return <AppShell>{body}</AppShell>
}

function NotFound({ path }: { path: string }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-lg font-bold">ページが見つかりませんでした</h1>
      <p className="mt-2 break-all text-sm text-muted-foreground">{path}</p>
      <Link href="/" className="mt-5 inline-block text-sm font-medium text-primary underline">トップへ戻る</Link>
    </div>
  )
}
