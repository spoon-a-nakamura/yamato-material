import { Suspense } from 'react'
import { NextNavProvider } from '@/app/next-nav'
import { AppShell } from '@/app/app'
import { PageScreen } from '@/screens/page'
import { dataset } from '@/lib/catalog'

export function generateStaticParams() {
  return Array.from({ length: dataset.catalogPageCount }, (_, i) => ({ number: String(i + 1) }))
}

export default async function Page({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params
  return (
    <Suspense>
      <NextNavProvider path={`/page/${number}`}>
        <AppShell><PageScreen pageNumber={Number(number)} /></AppShell>
      </NextNavProvider>
    </Suspense>
  )
}
