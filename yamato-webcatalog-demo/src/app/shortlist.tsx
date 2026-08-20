'use client'
import * as React from 'react'
import type { Product } from '@/lib/types'

/**
 * 検討の保存（提案書 8-6）
 * デモではメモリ内保持。本番は顧客単位のリストをサーバー側に持たせ、
 * 次回の連絡時に同じ一覧を呼び出せるようにする想定。
 */
interface ShortlistApi {
  slugs: string[]
  has: (slug: string) => boolean
  toggle: (slug: string) => void
  add: (slugs: string[]) => void
  remove: (slug: string) => void
  clear: () => void
  /** 顧客名メモ（本番では顧客レコードに紐付く） */
  customer: string
  setCustomer: (v: string) => void
}

const Ctx = React.createContext<ShortlistApi | null>(null)

export function ShortlistProvider({ children }: { children: React.ReactNode }) {
  const [slugs, setSlugs] = React.useState<string[]>([])
  const [customer, setCustomer] = React.useState('')

  const api = React.useMemo<ShortlistApi>(
    () => ({
      slugs,
      customer,
      setCustomer,
      has: (s) => slugs.includes(s),
      toggle: (s) => setSlugs((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s])),
      add: (ss) => setSlugs((p) => [...p, ...ss.filter((s) => !p.includes(s))]),
      remove: (s) => setSlugs((p) => p.filter((x) => x !== s)),
      clear: () => setSlugs([]),
    }),
    [slugs, customer]
  )
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useShortlist() {
  const v = React.useContext(Ctx)
  if (!v) throw new Error('useShortlist must be used inside ShortlistProvider')
  return v
}

export function useShortlistProducts(all: Product[]) {
  const { slugs } = useShortlist()
  return React.useMemo(
    () => slugs.map((s) => all.find((p) => p.slug === s)).filter((p): p is Product => Boolean(p)),
    [slugs, all]
  )
}
