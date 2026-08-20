import { Suspense } from 'react'
import { NextNavProvider } from '@/app/next-nav'
import { AppShell } from '@/app/app'
import { ProductsScreen } from '@/screens/products'

export default function Page() {
  return (
    <Suspense>
      <NextNavProvider path="/products">
        <AppShell><ProductsScreen /></AppShell>
      </NextNavProvider>
    </Suspense>
  )
}
