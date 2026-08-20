import type { Product, RecycleMark, Shape } from './types'

const nf = new Intl.NumberFormat('ja-JP')

export const DASH = '—'

export function n(v: number | null | undefined, unit = '', digits?: number) {
  if (v === null || v === undefined || Number.isNaN(v)) return DASH
  const s = digits === undefined ? nf.format(v) : nf.format(Number(v.toFixed(digits)))
  return unit ? `${s}${unit}` : s
}

/** 容量。OF＝満量容量は誌面表記に合わせて接頭辞を残す */
export function capacity(p: Product) {
  if (p.capacityMl === null) return p.capacityLabel ?? DASH
  return p.capacityType === 'overflow' ? `OF${nf.format(p.capacityMl)}` : nf.format(p.capacityMl)
}

export function weight(p: Product) {
  return p.weightLabel ?? n(p.weightG)
}

export function perCase(p: Product) {
  return p.perCaseLabel ?? n(p.perCase)
}

export const SHAPE_LABEL: Record<Shape, string> = {
  round: '丸', square: '角', oval: '楕円', hex: '六角', freeform: '変形', unknown: DASH,
}

export const RECYCLE_LABEL: Record<RecycleMark, string> = {
  yes: 'あり', no: 'なし', option: '対応品あり', unknown: '要確認',
}

export const ICON_LABEL: Record<string, string> = {
  original: 'オリジナル',
  barrier: 'バリア',
  overcap: 'オーバーキャップ対応',
  squeeze: 'スクイズ',
  ratchet: 'ラジェット',
  gas: 'ガス対応',
}

/** 容量帯（絞り込みチップ・グルーピングの両方で使う共通定義） */
export const CAPACITY_BANDS: { id: string; label: string; min: number; max: number }[] = [
  { id: 'b1', label: '〜100㎖',        min: 0,    max: 100 },
  { id: 'b2', label: '101〜300㎖',     min: 101,  max: 300 },
  { id: 'b3', label: '301〜600㎖',     min: 301,  max: 600 },
  { id: 'b4', label: '601〜1,000㎖',   min: 601,  max: 1000 },
  { id: 'b5', label: '1,001㎖〜',      min: 1001, max: Infinity },
]

export function bandOf(ml: number | null) {
  if (ml === null) return null
  return CAPACITY_BANDS.find((b) => ml >= b.min && ml <= b.max) ?? null
}

export function heatBadge(p: Product) {
  return p.heatResistC === null ? p.heatResistLabel || DASH : `${p.heatResistC}℃`
}
