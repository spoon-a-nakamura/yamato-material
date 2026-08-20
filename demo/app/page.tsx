import { Suspense } from 'react'
import { NextNavProvider } from '@/app/next-nav'
import { AppShell } from '@/app/app'
import { HomeScreen } from '@/screens/home'

export default function Page() {
  return (
    <Suspense>
      <NextNavProvider path="/">
        <AppShell><HomeScreen /></AppShell>
      </NextNavProvider>
    </Suspense>
  )
}
