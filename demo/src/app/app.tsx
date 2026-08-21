'use client'
import * as React from 'react'
import { ArrowUpRight } from 'lucide-react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SiteHeader } from '@/components/site-header'
import { Link, useNav } from '@/app/nav'
import { InternalModeProvider } from '@/app/internal-mode'
import { ShortlistProvider } from '@/app/shortlist'
import { HomeScreen } from '@/screens/home'
import { ProductsScreen } from '@/screens/products'
import { ProductScreen } from '@/screens/product'
import { PageScreen } from '@/screens/page'
import { ContentsScreen } from '@/screens/contents'
import { ShortlistScreen } from '@/screens/shortlist'
import { AboutScreen } from '@/screens/about'

/**
 * 状態を持つプロバイダ群。
 * Next.js 版ではページ遷移で page.tsx のツリーごと差し替わるため、
 * これを画面の枠（AppShell）側に置くと検討リストと社内モードが遷移のたびに失われる。
 * そのため app/layout.tsx（遷移をまたいで保持される階層）に置き、
 * 単一HTML版では App() が直接ラップする。
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <InternalModeProvider>
      <ShortlistProvider>
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
      </ShortlistProvider>
    </InternalModeProvider>
  )
}

/** 画面の外枠（ヘッダー・フッター） */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  )
}

/**
 * 外部・別アプリへのリンク。
 * <Link> は内部ルーティング用（nav.href() を通してハッシュURLに変換する）ため、
 * ここでは素の <a> を使う。別タブで開き、rel で参照元情報の受け渡しを止める。
 */
function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 underline decoration-border underline-offset-2 transition-colors hover:text-foreground hover:decoration-foreground"
    >
      {children}
      <ArrowUpRight className="size-3 shrink-0" aria-hidden />
    </a>
  )
}

/**
 * 提案スライドの場所。
 * 公開構成ではドメイン直下に
 *   /proposal/  提案スライド
 *   /demo/      このデモ（next.config.mjs の basePath）
 * が並ぶ。
 *
 * 相対（../proposal/）にはできない。trailingSlash: true で全ページが
 * ディレクトリ形式になるため、階層によって解決先がずれる：
 *   /demo/                    → /proposal/           正しい
 *   /demo/about/              → /demo/proposal/      ずれる
 *   /demo/products/xxx/       → /demo/products/...   ずれる
 * そのためドメイン直下からの絶対パスで持つ。
 * basePath は素の <a href> には前置されないので、この値がそのまま使われる。
 * 単一HTML版（file:// の1ファイル配布）からは解決できない。
 */
const PROPOSAL_URL = '/proposal/'

function SiteFooter() {
  return (
    <footer className="mt-12 border-t bg-muted/40 no-print">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-1 px-4 py-5 text-xs text-muted-foreground">
        <p>
          ヤマトマテリアル株式会社 Webカタログ（デモ）
        </p>
        <Link href="/about" className="hover:text-foreground hover:underline">このデモについて</Link>
        <ExternalLink href={PROPOSAL_URL}>ご提案スライド</ExternalLink>
        <p className="ml-auto">
          制作：
          <ExternalLink href="https://studio-spoon.co.jp/about/">スタジオスプーン株式会社</ExternalLink>
        </p>
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
    if (path === '/contents') return <ContentsScreen />
    if (path === '/shortlist') return <ShortlistScreen />
    if (path === '/about') return <AboutScreen />
    const prod = path.match(/^\/products\/(.+)$/)
    if (prod) return <ProductScreen slug={prod[1]} />
    const pg = path.match(/^\/page\/(\d+)$/)
    if (pg) return <PageScreen pageNumber={Number(pg[1])} />
    return <NotFound path={path} />
  }, [path])

  return (
    <AppProviders>
      <AppShell>{body}</AppShell>
    </AppProviders>
  )
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
