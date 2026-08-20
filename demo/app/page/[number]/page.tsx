import type { Metadata } from 'next'
import { Suspense } from 'react'
import { NextNavProvider } from '@/app/next-nav'
import { pageMeta } from '@/lib/meta'
import { AppShell } from '@/app/app'
import { PageScreen } from '@/screens/page'
import { dataset } from '@/lib/catalog'

export function generateStaticParams() {
  return Array.from({ length: dataset.catalogPageCount }, (_, i) => ({ number: String(i + 1) }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ number: string }> }
): Promise<Metadata> {
  const { number } = await params
  return pageMeta(`/page/${number}`)
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
