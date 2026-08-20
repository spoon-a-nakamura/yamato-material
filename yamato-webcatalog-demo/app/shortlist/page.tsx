import type { Metadata } from 'next'
import { Suspense } from 'react'
import { NextNavProvider } from '@/app/next-nav'
import { pageMeta } from '@/lib/meta'
import { AppShell } from '@/app/app'
import { ShortlistScreen } from '@/screens/shortlist'

export const metadata: Metadata = pageMeta('/shortlist')

export default function Page() {
  return (
    <Suspense>
      <NextNavProvider path="/shortlist">
        <AppShell><ShortlistScreen /></AppShell>
      </NextNavProvider>
    </Suspense>
  )
}
