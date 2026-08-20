import { Suspense } from 'react'
import { NextNavProvider } from '@/app/next-nav'
import { AppShell } from '@/app/app'
import { ContentsScreen } from '@/screens/contents'

export default function Page() {
  return (
    <Suspense>
      <NextNavProvider path="/contents">
        <AppShell><ContentsScreen /></AppShell>
      </NextNavProvider>
    </Suspense>
  )
}
