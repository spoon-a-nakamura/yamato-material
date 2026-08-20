import { Suspense } from 'react'
import { NextNavProvider } from '@/app/next-nav'
import { AppShell } from '@/app/app'
import { ShortlistScreen } from '@/screens/shortlist'

export default function Page() {
  return (
    <Suspense>
      <NextNavProvider path="/shortlist">
        <AppShell><ShortlistScreen /></AppShell>
      </NextNavProvider>
    </Suspense>
  )
}
