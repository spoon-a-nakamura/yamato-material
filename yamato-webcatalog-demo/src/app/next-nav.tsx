'use client'
import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { NavProvider, normalizePath, type NavApi } from '@/app/nav'

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
      href: (to) => to,
      push: (to) => router.push(to),
      replace: (to) => router.replace(to),
    }),
    [path, sp, router]
  )

  return <NavProvider value={api}>{children}</NavProvider>
}
