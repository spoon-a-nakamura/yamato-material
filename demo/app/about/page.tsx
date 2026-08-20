import type { Metadata } from 'next'
import { Suspense } from 'react'
import { NextNavProvider } from '@/app/next-nav'
import { pageMeta } from '@/lib/meta'
import { AppShell } from '@/app/app'
import { AboutScreen } from '@/screens/about'

export const metadata: Metadata = pageMeta('/about')

export default function Page() {
  return (
    <Suspense>
      <NextNavProvider path="/about">
        <AppShell><AboutScreen /></AppShell>
      </NextNavProvider>
    </Suspense>
  )
}
