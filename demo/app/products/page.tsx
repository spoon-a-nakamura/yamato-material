import type { Metadata } from 'next'
import { Suspense } from 'react'
import { NextNavProvider } from '@/app/next-nav'
import { pageMeta } from '@/lib/meta'
import { AppShell } from '@/app/app'
import { ProductsScreen } from '@/screens/products'

export const metadata: Metadata = pageMeta('/products')

export default function Page() {
  return (
    <Suspense>
      <NextNavProvider path="/products">
        <AppShell><ProductsScreen /></AppShell>
      </NextNavProvider>
    </Suspense>
  )
}
