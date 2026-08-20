import type { Metadata } from 'next'
import { Suspense } from 'react'
import { NextNavProvider } from '@/app/next-nav'
import { pageMeta } from '@/lib/meta'
import { AppShell } from '@/app/app'
import { ProductScreen } from '@/screens/product'
import { products } from '@/lib/catalog'

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  return pageMeta(`/products/${slug}`)
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <Suspense>
      <NextNavProvider path={`/products/${slug}`}>
        <AppShell><ProductScreen slug={slug} /></AppShell>
      </NextNavProvider>
    </Suspense>
  )
}
