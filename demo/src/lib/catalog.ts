import raw from '@/data/dataset.json'
import type { CatalogPage, CategoryId, Dataset, Product } from './types'

export const dataset = raw as unknown as Dataset
export const products: Product[] = dataset.products
export const pages: CatalogPage[] = dataset.pages
export const keywords: Record<string, number[]> = dataset.keywords
export const dataIssues = dataset.issues

/* ------------------------------------------------------------------ */
/* カテゴリー定義（紙カタログの章立てをそのまま踏襲）                  */
/* ------------------------------------------------------------------ */
export interface CategoryDef {
  id: CategoryId
  label: string
  shortLabel: string
  pageRange: [number, number]
  /** 提案書 4-1 の移行対象ページ */
  scopeNote: string
  token: string      // Tailwind の色接頭辞
}

export const CATEGORIES: CategoryDef[] = [
  { id: 'plastic-bottle', label: '食品プラスチックボトル', shortLabel: 'プラスチック', pageRange: [23, 38], scopeNote: '29〜38ページ', token: 'plastic' },
  { id: 'glass-bottle',   label: '食品ガラスボトル',       shortLabel: 'ガラス',       pageRange: [39, 53], scopeNote: '40〜62ページ', token: 'glass' },
  { id: 'liquor',         label: '酒類プラスチック・ガラス', shortLabel: '酒類',       pageRange: [54, 63], scopeNote: '40〜62ページ', token: 'liquor' },
  { id: 'cap',            label: 'キャップ・その他',        shortLabel: 'キャップ',    pageRange: [64, 72], scopeNote: '65〜68ページ', token: 'cap' },
]

export const categoryById = (id: CategoryId | string): CategoryDef | undefined =>
  CATEGORIES.find((c) => c.id === id)

/**
 * カテゴリー識別色のクラス名。
 * Tailwind は静的解析でクラス名を収集するため、テンプレート文字列で組み立てると
 * ビルド時に破棄される。ここは必ずリテラルで持つ。
 */
const CAT_CLASSES = {
  film: {
    bar: 'bg-cat-film', text: 'text-cat-film-fg', bg: 'bg-cat-film-bg',
    border: 'border-cat-film', ring: 'ring-cat-film',
    hoverBg: 'hover:bg-cat-film-bg',
    shape: 'fill-cat-film/25 stroke-cat-film group-hover:fill-cat-film/50',
  },
  plastic: {
    bar: 'bg-cat-plastic', text: 'text-cat-plastic-fg', bg: 'bg-cat-plastic-bg',
    border: 'border-cat-plastic', ring: 'ring-cat-plastic',
    hoverBg: 'hover:bg-cat-plastic-bg',
    shape: 'fill-cat-plastic/25 stroke-cat-plastic group-hover:fill-cat-plastic/50',
  },
  glass: {
    bar: 'bg-cat-glass', text: 'text-cat-glass-fg', bg: 'bg-cat-glass-bg',
    border: 'border-cat-glass', ring: 'ring-cat-glass',
    hoverBg: 'hover:bg-cat-glass-bg',
    shape: 'fill-cat-glass/25 stroke-cat-glass group-hover:fill-cat-glass/50',
  },
  liquor: {
    bar: 'bg-cat-liquor', text: 'text-cat-liquor-fg', bg: 'bg-cat-liquor-bg',
    border: 'border-cat-liquor', ring: 'ring-cat-liquor',
    hoverBg: 'hover:bg-cat-liquor-bg',
    shape: 'fill-cat-liquor/25 stroke-cat-liquor group-hover:fill-cat-liquor/50',
  },
  cap: {
    bar: 'bg-cat-cap', text: 'text-cat-cap-fg', bg: 'bg-cat-cap-bg',
    border: 'border-cat-cap', ring: 'ring-cat-cap',
    hoverBg: 'hover:bg-cat-cap-bg',
    shape: 'fill-cat-cap/25 stroke-cat-cap group-hover:fill-cat-cap/50',
  },
} as const

/** 一覧に出さない章（食品フィルム等）も誌面色を持つため、対応表は別に持つ */
const TOKEN_BY_CATEGORY: Record<string, keyof typeof CAT_CLASSES> = {
  film: 'film',
  'plastic-bottle': 'plastic',
  'glass-bottle': 'glass',
  liquor: 'liquor',
  cap: 'cap',
  other: 'cap',
}

export function catClasses(id: CategoryId | string) {
  return CAT_CLASSES[TOKEN_BY_CATEGORY[id] ?? 'cap']
}

/** 章の表示名（一覧の対象外カテゴリーを含む） */
export const CATEGORY_LABEL: Record<string, string> = {
  film: '食品フィルム',
  'plastic-bottle': '食品プラスチックボトル',
  'glass-bottle': '食品ガラスボトル',
  liquor: '酒類プラスチック・ガラス',
  cap: 'キャップ・その他',
  other: 'その他',
}

/* ------------------------------------------------------------------ */
/* 索引                                                                */
/* ------------------------------------------------------------------ */
export const productBySlug = new Map(products.map((p) => [p.slug, p]))
export const pageByNumber = new Map(pages.map((p) => [p.page, p]))

export const productsByPage = (() => {
  const m = new Map<number, Product[]>()
  for (const p of products) for (const n of p.catalogPages) {
    const a = m.get(n) ?? []
    a.push(p)
    m.set(n, a)
  }
  return m
})()

export const countByCategory = (() => {
  const m = new Map<CategoryId, number>()
  for (const p of products) m.set(p.category, (m.get(p.category) ?? 0) + 1)
  return m
})()

/* ------------------------------------------------------------------ */
/* 検索（提案書 8-5：ページ数を主導線、品番・キーワードを補助）        */
/* ------------------------------------------------------------------ */
export type SearchHit =
  | { kind: 'page'; page: CatalogPage; count: number }
  | { kind: 'product'; product: Product }
  | { kind: 'keyword'; word: string; pages: number[] }

const norm = (s: string) =>
  s.normalize('NFKC').toLowerCase().replace(/[\s　_・．.-]/g, '')

/** 入力が「ページ数」として解釈できるか */
export function asPageNumber(q: string): number | null {
  const t = q.normalize('NFKC').trim()
  if (!/^\d{1,3}$/.test(t)) return null
  const n = Number(t)
  return n >= 1 && n <= dataset.catalogPageCount ? n : null
}

export function search(q: string, limit = 24): SearchHit[] {
  const t = q.trim()
  if (!t) return []
  const hits: SearchHit[] = []

  const pn = asPageNumber(t)
  if (pn !== null) {
    const page = pageByNumber.get(pn)
    if (page) hits.push({ kind: 'page', page, count: productsByPage.get(pn)?.length ?? 0 })
  }

  const nq = norm(t)
  // 品番の前方一致 → 部分一致
  const starts: Product[] = []
  const includes: Product[] = []
  for (const p of products) {
    const ns = norm(p.sku)
    if (ns.startsWith(nq)) starts.push(p)
    else if (ns.includes(nq)) includes.push(p)
  }
  for (const p of [...starts, ...includes].slice(0, limit)) hits.push({ kind: 'product', product: p })

  // 誌面のカテゴリー名・通称
  for (const [word, ps] of Object.entries(keywords)) {
    if (norm(word).includes(nq) || nq.includes(norm(word))) hits.push({ kind: 'keyword', word, pages: ps })
  }
  for (const pg of pages) {
    if (norm(pg.title).includes(nq)) hits.push({ kind: 'page', page: pg, count: productsByPage.get(pg.page)?.length ?? 0 })
  }

  return hits.slice(0, limit)
}
