import type { Product, Shape } from './types'

/**
 * 支給データ（胴サイズ・全高・ラベル面・口部）から容器形状を組み立てる。
 * 実測値が無い箇所は「一般的な比率」で補うが、寸法線として数値を表示するのは
 * データに存在する項目（全高・胴サイズ・ラベル面・口部呼び径）だけに限る。
 */
export interface ContainerGeom {
  /** 胴の幅（mm） */
  w: number
  /** 胴の奥行（mm） */
  d: number
  /** 全高（mm） */
  h: number
  /** ラベル面の高さ（mm）。null = 該当なし */
  labelH: number | null
  /** 口部呼び径（mm）。データから読めない場合は null */
  neckD: number | null
  /** 描画に使う首の幅（mm） */
  neckW: number
  /** 首の高さ（mm） */
  neckH: number
  /** 肩の高さ（mm） */
  shoulderH: number
  shape: Shape
  /** 縦長のボトルか、平たい容器（ジャー）か */
  form: 'bottle' | 'jar' | 'cap'
  /** 側面の輪郭 SVG パス（原点は上端中央、y は下向き） */
  path: string
  /** 上面図の SVG 要素データ */
  top: { kind: 'circle' | 'ellipse' | 'rect' | 'hex'; w: number; d: number }
  /** データが欠けているため比率で補った項目 */
  estimated: string[]
}

const NECK_FROM_MOUTH: [RegExp, number][] = [
  [/26\.3/, 26.3],
  [/アルコア/, 28],
  [/\b38\b/, 38],
  [/\b33\b/, 33],
  [/\b28\b/, 28],
  [/\b23\b/, 23],
  [/\b18\b/, 18],
]

function neckDiameter(p: Product, w: number): { neckD: number | null; neckW: number } {
  const label = p.mouthLabel ?? ''
  for (const [re, v] of NECK_FROM_MOUTH) if (re.test(label)) return { neckD: v, neckW: Math.min(v, w * 0.9) }
  if (/専用キャップ|専用ネジ/.test(label)) return { neckD: null, neckW: w * (p.heightMm && p.heightMm < w ? 0.82 : 0.5) }
  return { neckD: null, neckW: Math.max(Math.min(w * 0.42, 40), 14) }
}

const r2 = (v: number) => Math.round(v * 100) / 100

export function buildGeom(p: Product): ContainerGeom | null {
  const estimated: string[] = []
  let w = p.bodyW
  let h = p.heightMm
  if (w === null && h === null) return null
  if (w === null) { w = (h as number) * 0.45; estimated.push('胴サイズ') }
  if (h === null) { h = w * 2.2; estimated.push('全高') }
  const d = p.bodyD ?? w

  if (p.category === 'cap') {
    const rr = w / 2
    return {
      w, d, h, labelH: null, neckD: w, neckW: w, neckH: 0, shoulderH: 0,
      shape: 'round', form: 'cap',
      path: `M ${-rr} ${h} L ${-rr} ${h * 0.18} Q ${-rr} 0 ${-rr * 0.72} 0 L ${rr * 0.72} 0 Q ${rr} 0 ${rr} ${h * 0.18} L ${rr} ${h} Z`,
      top: { kind: 'circle', w, d },
      estimated,
    }
  }

  const form: 'bottle' | 'jar' = h >= w * 1.35 ? 'bottle' : 'jar'
  const { neckD, neckW } = neckDiameter(p, w)
  const neckH = form === 'bottle' ? Math.min(h * 0.13, 24) : h * 0.16
  const shoulderH = form === 'bottle' ? h * 0.14 : h * 0.14
  const hw = w / 2
  const nw = neckW / 2
  const baseR = Math.min(w * 0.09, 6)
  const sy = neckH + shoulderH

  // 側面輪郭：口→肩→胴→底（左右対称）
  const path = [
    `M ${r2(-nw)} 0`,
    `L ${r2(nw)} 0`,
    `L ${r2(nw)} ${r2(neckH)}`,
    // 肩：首元はいったん絞り、胴に向かって膨らむS字（実物のボトル形状に近づける）
    `C ${r2(nw)} ${r2(neckH + shoulderH * 0.52)} ${r2(hw)} ${r2(sy - shoulderH * 0.72)} ${r2(hw)} ${r2(sy)}`,
    `L ${r2(hw)} ${r2(h - baseR)}`,
    `Q ${r2(hw)} ${r2(h)} ${r2(hw - baseR)} ${r2(h)}`,
    `L ${r2(-hw + baseR)} ${r2(h)}`,
    `Q ${r2(-hw)} ${r2(h)} ${r2(-hw)} ${r2(h - baseR)}`,
    `L ${r2(-hw)} ${r2(sy)}`,
    `C ${r2(-hw)} ${r2(sy - shoulderH * 0.72)} ${r2(-nw)} ${r2(neckH + shoulderH * 0.52)} ${r2(-nw)} ${r2(neckH)}`,
    'Z',
  ].join(' ')

  const topKind =
    p.shape === 'square' ? 'rect' : p.shape === 'hex' ? 'hex' : p.shape === 'oval' ? 'ellipse' : 'circle'

  return {
    w, d, h, labelH: p.labelHeightMm, neckD, neckW, neckH, shoulderH,
    shape: p.shape, form, path, top: { kind: topKind, w, d }, estimated,
  }
}

/** 上面図のパス（六角形） */
export function hexPath(w: number, d: number) {
  const rx = w / 2, ry = d / 2
  const pts: string[] = []
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6
    pts.push(`${r2(Math.cos(a) * rx)},${r2(Math.sin(a) * ry)}`)
  }
  return `M ${pts.join(' L ')} Z`
}
