import type { Metadata } from 'next'
import { Suspense } from 'react'
import { NextNavProvider } from '@/app/next-nav'
import { pageMeta } from '@/lib/meta'
import { AppShell } from '@/app/app'
import { ContentsScreen } from '@/screens/contents'

export const metadata: Metadata = pageMeta('/contents')

export default function Page() {
  return (
    <Suspense>
      <NextNavProvider path="/contents">
        <AppShell><ContentsScreen /></AppShell>
      </NextNavProvider>
    </Suspense>
  )
}
