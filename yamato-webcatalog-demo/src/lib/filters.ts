import { CAPACITY_BANDS, bandOf } from './format'
import type { CategoryId, Product, RecycleMark } from './types'

export interface FilterState {
  /** 提案書 4-1 の移行対象範囲のみに絞る（既定 ON） */
  scopeOnly: boolean
  categories: CategoryId[]
  bands: string[]
  mouths: string[]
  materials: string[]
  /** 耐熱下限（℃）。null = 指定なし */
  heatMin: number | null
  recycle: RecycleMark[]
  icons: string[]
  shapes: string[]
  q: string
}

export const emptyFilters: FilterState = {
  scopeOnly: true,
  categories: [],
  bands: [],
  mouths: [],
  materials: [],
  heatMin: null,
  recycle: [],
  icons: [],
  shapes: [],
  q: '',
}

export function countActive(f: FilterState) {
  return (
    f.categories.length + f.bands.length + f.mouths.length + f.materials.length +
    f.recycle.length + f.icons.length + f.shapes.length +
    (f.heatMin !== null ? 1 : 0) + (f.q ? 1 : 0)
  )
}

const norm = (s: string) => s.normalize('NFKC').toLowerCase().replace(/[\s　_・．.-]/g, '')

export function applyFilters(list: Product[], f: FilterState): Product[] {
  const nq = f.q ? norm(f.q) : ''
  return list.filter((p) => {
    if (f.scopeOnly && !p.inScope) return false
    if (f.categories.length && !f.categories.includes(p.category)) return false
    if (f.bands.length) {
      const b = bandOf(p.capacityMl)
      if (!b || !f.bands.includes(b.id)) return false
    }
    if (f.mouths.length && !p.mouthTypes.some((m) => f.mouths.includes(m))) return false
    if (f.materials.length && !f.materials.includes(p.material)) return false
    if (f.heatMin !== null && !(p.heatResistC !== null && p.heatResistC >= f.heatMin)) return false
    if (f.recycle.length && !f.recycle.includes(p.recycleMark)) return false
    if (f.icons.length && !p.icons.some((i) => f.icons.includes(i))) return false
    if (f.shapes.length && !f.shapes.includes(p.shape)) return false
    if (nq && !norm(p.sku).includes(nq) && !norm(p.group).includes(nq) && !norm(p.series ?? '').includes(nq)) return false
    return true
  })
}

/** 絞り込み候補は、他の条件を適用した結果から動的に作る（0件の選択肢を出さない） */
export function facetOptions(all: Product[], f: FilterState) {
  const base = applyFilters(all, { ...f, mouths: [], materials: [], shapes: [], icons: [], recycle: [], bands: [] })
  const tally = <T,>(fn: (p: Product) => T[]) => {
    const m = new Map<T, number>()
    for (const p of base) for (const v of fn(p)) m.set(v, (m.get(v) ?? 0) + 1)
    return m
  }
  return {
    mouths: tally((p) => p.mouthTypes),
    materials: tally((p) => [p.material]),
    shapes: tally((p) => [p.shape]),
    icons: tally((p) => p.icons),
    recycle: tally((p) => [p.recycleMark]),
    bands: tally((p) => { const b = bandOf(p.capacityMl); return b ? [b.id] : [] }),
  }
}

/* ---------------- 並び替え ---------------- */
export type SortKey = 'default' | 'capacityAsc' | 'capacityDesc' | 'sku' | 'weightAsc' | 'heightAsc'

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'default', label: '誌面の掲載順' },
  { key: 'capacityAsc', label: '容量が小さい順' },
  { key: 'capacityDesc', label: '容量が大きい順' },
  { key: 'weightAsc', label: '重量が軽い順' },
  { key: 'heightAsc', label: '全高が低い順' },
  { key: 'sku', label: '品番順' },
]

const cmpNum = (a: number | null, b: number | null, dir = 1) => {
  if (a === null && b === null) return 0
  if (a === null) return 1
  if (b === null) return -1
  return (a - b) * dir
}

export function sortProducts(list: Product[], key: SortKey): Product[] {
  const a = [...list]
  switch (key) {
    case 'capacityAsc': return a.sort((x, y) => cmpNum(x.capacityMl, y.capacityMl))
    case 'capacityDesc': return a.sort((x, y) => cmpNum(x.capacityMl, y.capacityMl, -1))
    case 'weightAsc': return a.sort((x, y) => cmpNum(x.weightG, y.weightG))
    case 'heightAsc': return a.sort((x, y) => cmpNum(x.heightMm, y.heightMm))
    case 'sku': return a.sort((x, y) => x.sku.localeCompare(y.sku, 'ja'))
    default: return a
  }
}

/* ---------------- グルーピング（提案書 8-1） ---------------- */
export type GroupKey = 'group' | 'series' | 'band' | 'none'

export const GROUP_OPTIONS: { key: GroupKey; label: string }[] = [
  { key: 'group', label: '誌面の項目でまとめる' },
  { key: 'series', label: 'シリーズでまとめる' },
  { key: 'band', label: '容量帯でまとめる' },
  { key: 'none', label: 'まとめない' },
]

export function groupProducts(list: Product[], key: GroupKey): { title: string; items: Product[] }[] {
  if (key === 'none') return [{ title: '', items: list }]
  const m = new Map<string, Product[]>()
  const order: string[] = []
  for (const p of list) {
    let t: string
    if (key === 'group') t = p.group
    else if (key === 'series') t = p.series ?? p.variantGroup ?? '（シリーズ指定なし）'
    else t = bandOf(p.capacityMl)?.label ?? '（容量未確認）'
    if (!m.has(t)) { m.set(t, []); order.push(t) }
    m.get(t)!.push(p)
  }
  if (key === 'band') {
    const rank = new Map(CAPACITY_BANDS.map((b, i) => [b.label, i]))
    order.sort((a, b) => (rank.get(a) ?? 99) - (rank.get(b) ?? 99))
  }
  return order.map((t) => ({ title: t, items: m.get(t)! }))
}
