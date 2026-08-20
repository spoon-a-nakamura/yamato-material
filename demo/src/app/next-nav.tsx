'use client'
import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { NavProvider, normalizePath, type NavApi } from '@/app/nav'

/* next.config.mjs の basePath と同じ値。
   basePath はアセットと router.push には自動で効くが、
   <a href> の文字列には効かないため、ここで前置する。
   これがないと /demo/ 配下で「新しいタブで開く」やリンクのコピーが
   ドメイン直下を指してしまう。 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/** 表示用のURLを組み立てる。trailingSlash: true に合わせて末尾スラッシュを付ける。 */
function hrefWithBase(to: string): string {
  const [rawPath, query] = to.split('?')
  const path = normalizePath(rawPath)
  const withSlash = path === '/' ? '/' : path + '/'
  return BASE + withSlash + (query ? '?' + query : '')
}

/**
 * Next.js（本番想定）用のルーターアダプタ。
 * 実URLで動くため、SEO・共有・ブックマークが必要になった場合もそのまま使える。
 */
export function NextNavProvider({ path, children }: { path: string; children: React.ReactNode }) {
  const router = useRouter()
  const sp = useSearchParams()

  const api = React.useMemo<NavApi>(
    () => ({
      path: normalizePath(path),
      query: new URLSearchParams(sp?.toString() ?? ''),
      href: (to) => hrefWithBase(to),
      push: (to) => router.push(to),
      replace: (to) => router.replace(to),
    }),
    [path, sp, router]
  )

  return <NavProvider value={api}>{children}</NavProvider>
}
