import { Suspense } from 'react'
import { NextNavProvider } from '@/app/next-nav'
import { AppShell } from '@/app/app'
import { AboutScreen } from '@/screens/about'

export default function Page() {
  return (
    <Suspense>
      <NextNavProvider path="/about">
        <AppShell><AboutScreen /></AppShell>
      </NextNavProvider>
    </Suspense>
  )
}
