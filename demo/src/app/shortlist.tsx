'use client'
import * as React from 'react'
import type { Product } from '@/lib/types'

/**
 * 検討の保存（提案書 8-6）
 * デモでは sessionStorage に保持（同じタブの間だけ残る）。
 * 本番は顧客単位のリストをサーバー側に持たせ、
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

/**
 * 保存先は sessionStorage。
 * ・localStorage だと翌日以降も残るため、別のお客さまとの打ち合わせで
 *   前回の候補が画面に出てしまう。タブを閉じれば消えるほうが安全。
 * ・保持しないと、再読み込みやURL直打ち（お客さまに口頭で伝えられた
 *   アドレスを打ち直す等）のたびに選んだ候補が消える。
 * 社内モードは引き続き保存しない（既定を必ず OFF に戻す。判断ログ B10）。
 */
const STORE_KEY = 'yamato-webcatalog:shortlist'

interface Stored {
  slugs: string[]
  customer: string
}

function readStore(): Stored | null {
  try {
    const raw = sessionStorage.getItem(STORE_KEY)
    if (!raw) return null
    const v = JSON.parse(raw) as unknown
    if (typeof v !== 'object' || v === null) return null
    const o = v as Record<string, unknown>
    return {
      slugs: Array.isArray(o.slugs) ? o.slugs.filter((x): x is string => typeof x === 'string') : [],
      customer: typeof o.customer === 'string' ? o.customer : '',
    }
  } catch {
    // 壊れた値やプライベートモードでの参照失敗は、保存が無かったものとして扱う
    return null
  }
}

export function ShortlistProvider({ children }: { children: React.ReactNode }) {
  const [slugs, setSlugs] = React.useState<string[]>([])
  const [customer, setCustomer] = React.useState('')
  /** 復元が終わるまで保存しない。空の初期値で上書きしてしまうため */
  const restored = React.useRef(false)

  // 静的HTMLとの hydration がずれないよう、初期値は空のままにして描画後に復元する
  React.useEffect(() => {
    const saved = readStore()
    if (saved) {
      if (saved.slugs.length) setSlugs(saved.slugs)
      if (saved.customer) setCustomer(saved.customer)
    }
    restored.current = true
  }, [])

  React.useEffect(() => {
    if (!restored.current) return
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify({ slugs, customer }))
    } catch {
      // 保存できない環境でも、その場の操作は続けられるようにする
    }
  }, [slugs, customer])

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
