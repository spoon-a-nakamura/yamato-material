'use client'
import * as React from 'react'
import { buildGeom, hexPath, type ContainerGeom } from '@/lib/geometry'
import { capacity } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/types'

/* ==================================================================
   容器シルエット／図面
   ・支給フォルダにSKU単体の写真・図面が無いため、仕様値からコード描画する
   ・寸法として数値を書き込むのは、マスターに実在する項目のみ。
     具体的には 全高・胴サイズ・ラベル面の高さ・口部呼び径（口部表記から読める場合）・容量。
     肩の位置や板厚などは描画のために比率で補っているだけなので、数値としては出さない。
   ・詳細図面は「社内限定の表示枠」を再現したもの。本番はメーカー支給図面を表示する
   ================================================================== */

const STROKE = { vectorEffect: 'non-scaling-stroke' } as const

interface Pad { l: number; r: number; t: number; b: number }

function Shell({
  geom, pad, children, className, label, align = 'center',
}: {
  geom: ContainerGeom
  pad: Pad
  children: React.ReactNode
  className?: string
  label: string
  /**
   * 枠内での置き方。
   * 'bottom' は下端合わせ。キャップのように横長の形は縦方向に余白ができるため、
   * 中央配置だと枠の中で浮いて、隣のボトルと接地面が揃わない。
   */
  align?: 'center' | 'bottom'
}) {
  return (
    <svg
      viewBox={`${-geom.w / 2 - pad.l} ${-pad.t} ${geom.w + pad.l + pad.r} ${geom.h + pad.t + pad.b}`}
      className={cn('block h-full w-full', className)}
      preserveAspectRatio={align === 'bottom' ? 'xMidYMax meet' : 'xMidYMid meet'}
      role="img"
    >
      <title>{label}</title>
      {children}
    </svg>
  )
}

/* ---------------- 一覧・カード用の小さなシルエット ---------------- */
export function ContainerSilhouette({
  product, className, tone = 'muted', shapeClassName, align = 'center',
}: {
  product: Product
  className?: string
  tone?: 'muted' | 'category'
  /** 塗り・線のクラスを呼び出し側で指定する（誌面カテゴリー色で塗る場合など） */
  shapeClassName?: string
  /** 複数を並べて接地面を揃えたいときは 'bottom' */
  align?: 'center' | 'bottom'
}) {
  const geom = React.useMemo(() => buildGeom(product), [product])
  if (!geom) {
    return <div className={cn('flex items-center justify-center text-[0.625rem] text-muted-foreground/60', className)}>—</div>
  }
  const m = geom.w * 0.1
  return (
    <Shell
      geom={geom}
      pad={{ l: m, r: m, t: geom.h * 0.04, b: geom.h * 0.04 }}
      className={className}
      label={`${product.sku} のシルエット`}
      align={align}
    >
      <path
        d={geom.path}
        className={
          shapeClassName ??
          (tone === 'muted'
            ? 'fill-muted-foreground/25 stroke-muted-foreground/45'
            : 'fill-primary/10 stroke-primary/50')
        }
        strokeWidth={1}
        {...STROKE}
      />
    </Shell>
  )
}

/* ---------------- 寸法線のパーツ ---------------- */
function VDim({
  x, y1, y2, label, unit, side = 'right',
}: { x: number; y1: number; y2: number; label: string; unit: number; side?: 'right' | 'left' }) {
  const tick = unit * 1.5
  return (
    <g className="fill-none stroke-foreground/55">
      <line x1={x} y1={y1} x2={x} y2={y2} strokeWidth={0.8} {...STROKE} />
      <line x1={x - tick} y1={y1} x2={x + tick} y2={y1} strokeWidth={0.8} {...STROKE} />
      <line x1={x - tick} y1={y2} x2={x + tick} y2={y2} strokeWidth={0.8} {...STROKE} />
      <text
        x={side === 'right' ? x + tick * 1.3 : x - tick * 1.3}
        y={(y1 + y2) / 2}
        textAnchor={side === 'right' ? 'start' : 'end'}
        dominantBaseline="middle"
        fontSize={unit * 3.2}
        className="num fill-foreground/80 stroke-none"
      >
        {label}
      </text>
    </g>
  )
}

function HDim({
  y, x1, x2, label, unit, above = true,
}: { y: number; x1: number; x2: number; label: string; unit: number; above?: boolean }) {
  const tick = unit * 1.5
  return (
    <g className="fill-none stroke-foreground/55">
      <line x1={x1} y1={y} x2={x2} y2={y} strokeWidth={0.8} {...STROKE} />
      <line x1={x1} y1={y - tick} x2={x1} y2={y + tick} strokeWidth={0.8} {...STROKE} />
      <line x1={x2} y1={y - tick} x2={x2} y2={y + tick} strokeWidth={0.8} {...STROKE} />
      <text
        x={(x1 + x2) / 2}
        y={above ? y - tick * 1.1 : y + tick * 3.2}
        textAnchor="middle"
        fontSize={unit * 3.2}
        className="num fill-foreground/80 stroke-none"
      >
        {label}
      </text>
    </g>
  )
}

function Ext({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      strokeWidth={0.5} strokeDasharray="2 2"
      className="fill-none stroke-foreground/30" {...STROKE}
    />
  )
}

function LabelBand({ geom }: { geom: ContainerGeom }) {
  if (geom.labelH === null) return null
  const top = geom.h - geom.labelH * 0.55 - geom.labelH
  return (
    <rect
      x={-geom.w / 2} y={top} width={geom.w} height={geom.labelH}
      className="fill-primary/[0.06] stroke-primary/45"
      strokeWidth={0.7} strokeDasharray="3 2" {...STROKE}
    />
  )
}

const labelTopOf = (geom: ContainerGeom) =>
  geom.labelH === null ? null : geom.h - geom.labelH * 0.55 - geom.labelH

function TopView({ geom }: { geom: ContainerGeom }) {
  const cls = 'fill-muted-foreground/20 stroke-muted-foreground/60'
  const { kind, w, d } = geom.top
  if (kind === 'circle') return <circle cx={0} cy={0} r={w / 2} className={cls} strokeWidth={0.9} {...STROKE} />
  if (kind === 'ellipse') return <ellipse cx={0} cy={0} rx={w / 2} ry={d / 2} className={cls} strokeWidth={0.9} {...STROKE} />
  if (kind === 'hex') return <path d={hexPath(w, d)} className={cls} strokeWidth={0.9} {...STROKE} />
  return (
    <rect
      x={-w / 2} y={-d / 2} width={w} height={d} rx={Math.min(w, d) * 0.08}
      className={cls} strokeWidth={0.9} {...STROKE}
    />
  )
}

/* ---------------- 簡易図面（お客さまにも公開） ---------------- */
export function SimpleDrawing({ product, className }: { product: Product; className?: string }) {
  const geom = React.useMemo(() => buildGeom(product), [product])
  if (!geom) return <NoDrawing className={className} />

  const unit = Math.max(geom.w, geom.h) / 100
  const pad: Pad = { l: geom.w * 0.72, r: geom.w * 0.5, t: geom.h * 0.15, b: geom.h * 0.12 }
  const lt = labelTopOf(geom)
  const bodyTop = geom.neckH + geom.shoulderH

  return (
    <Shell geom={geom} pad={pad} className={className} label={`${product.sku} の簡易図面`}>
      {/* 胴サイズ */}
      <Ext x1={-geom.w / 2} y1={bodyTop} x2={-geom.w / 2} y2={-pad.t * 0.42} />
      <Ext x1={geom.w / 2} y1={bodyTop} x2={geom.w / 2} y2={-pad.t * 0.42} />
      <HDim y={-pad.t * 0.48} x1={-geom.w / 2} x2={geom.w / 2} label={product.bodySizeLabel ?? `${geom.w}`} unit={unit} />

      <path d={geom.path} className="fill-muted-foreground/20 stroke-muted-foreground/65" strokeWidth={1.1} {...STROKE} />
      <line
        x1={-geom.neckW / 2} y1={geom.neckH} x2={geom.neckW / 2} y2={geom.neckH}
        strokeWidth={0.7} className="fill-none stroke-muted-foreground/50" {...STROKE}
      />

      {lt !== null && geom.labelH !== null && (
        <>
          <LabelBand geom={geom} />
          <Ext x1={-geom.w / 2} y1={lt} x2={-geom.w / 2 - pad.l * 0.55} y2={lt} />
          <Ext x1={-geom.w / 2} y1={lt + geom.labelH} x2={-geom.w / 2 - pad.l * 0.55} y2={lt + geom.labelH} />
          <VDim x={-geom.w / 2 - pad.l * 0.48} y1={lt} y2={lt + geom.labelH} label={`ラベル面 ${geom.labelH}`} unit={unit} side="left" />
        </>
      )}

      <Ext x1={geom.w / 2} y1={0} x2={geom.w / 2 + pad.r * 0.6} y2={0} />
      <Ext x1={geom.w / 2} y1={geom.h} x2={geom.w / 2 + pad.r * 0.6} y2={geom.h} />
      <VDim x={geom.w / 2 + pad.r * 0.45} y1={0} y2={geom.h} label={`${geom.h}`} unit={unit} />

      <text
        x={0} y={geom.h + pad.b * 0.8} textAnchor="middle"
        fontSize={unit * 3} className="fill-muted-foreground stroke-none"
      >
        単位：mm ／ 容量 {capacity(product)}㎖
      </text>
    </Shell>
  )
}

/* ---------------- 詳細図面（社内限定） ---------------- */
export function DetailDrawing({ product, className }: { product: Product; className?: string }) {
  const geom = React.useMemo(() => buildGeom(product), [product])
  if (!geom) return <NoDrawing className={className} />

  const { w, h, d } = geom
  const unit = Math.max(w, h) / 100

  // 図枠のレイアウト（左：寸法／右：全高／下：胴サイズ・上面図・表題欄）
  const pad: Pad = { l: w * 1.0, r: w * 0.66, t: h * 0.13, b: h * 0.52 }
  const fx = -w / 2 - pad.l * 0.93
  const fy = -pad.t * 0.86
  const fw = w + (pad.l + pad.r) * 0.93
  const fh = h + pad.t * 0.86 + pad.b * 0.94

  const bodyTop = geom.neckH + geom.shoulderH
  const lt = labelTopOf(geom)

  // 下段の配置
  const sizeDimY = h + pad.b * 0.12
  const titleH = pad.b * 0.2
  const titleY = fy + fh - titleH - fh * 0.015
  const tvScale = Math.min(1, (pad.b * 0.24) / Math.max(w, d))
  const tvCx = fx + fw * 0.14
  const tvCy = (h + pad.b * 0.30 + titleY) / 2

  return (
    <Shell geom={geom} pad={pad} className={className} label={`${product.sku} の詳細図面（社内限定）`}>
      <rect x={fx} y={fy} width={fw} height={fh} className="fill-none stroke-internal/40" strokeWidth={1} {...STROKE} />

      {/* 側面図 */}
      <path d={geom.path} className="fill-muted-foreground/15 stroke-foreground/70" strokeWidth={1.1} {...STROKE} />
      <line
        x1={-geom.neckW / 2} y1={geom.neckH} x2={geom.neckW / 2} y2={geom.neckH}
        strokeWidth={0.7} className="fill-none stroke-foreground/45" {...STROKE}
      />
      <Ext x1={-w / 2} y1={bodyTop} x2={w / 2} y2={bodyTop} />
      {/* 中心線 */}
      <line
        x1={0} y1={-pad.t * 0.55} x2={0} y2={h + pad.b * 0.06}
        strokeWidth={0.5} strokeDasharray="7 2 1.5 2"
        className="fill-none stroke-foreground/35" {...STROKE}
      />
      <text x={0} y={h * 0.5} textAnchor="middle" fontSize={unit * 2.6} className="fill-foreground/25 stroke-none" transform={`rotate(-90 0 ${h * 0.5})`}>
        側面図
      </text>

      {/* 口部呼び径（口部表記から読める場合のみ） */}
      {geom.neckD !== null && (
        <HDim y={-pad.t * 0.5} x1={-geom.neckW / 2} x2={geom.neckW / 2} label={`口部 φ${geom.neckD}`} unit={unit} />
      )}

      {/* ラベル面 */}
      {lt !== null && geom.labelH !== null && (
        <>
          <LabelBand geom={geom} />
          <Ext x1={-w / 2} y1={lt} x2={-w / 2 - pad.l * 0.5} y2={lt} />
          <Ext x1={-w / 2} y1={lt + geom.labelH} x2={-w / 2 - pad.l * 0.5} y2={lt + geom.labelH} />
          <VDim x={-w / 2 - pad.l * 0.42} y1={lt} y2={lt + geom.labelH} label={`ラベル面 ${geom.labelH}`} unit={unit} side="left" />
        </>
      )}

      {/* 全高 */}
      <Ext x1={w / 2} y1={0} x2={w / 2 + pad.r * 0.7} y2={0} />
      <Ext x1={w / 2} y1={h} x2={w / 2 + pad.r * 0.7} y2={h} />
      <VDim x={w / 2 + pad.r * 0.42} y1={0} y2={h} label={`全高 ${h}`} unit={unit} />

      {/* 胴サイズ */}
      <Ext x1={-w / 2} y1={h} x2={-w / 2} y2={sizeDimY} />
      <Ext x1={w / 2} y1={h} x2={w / 2} y2={sizeDimY} />
      <HDim y={sizeDimY} x1={-w / 2} x2={w / 2} label={product.bodySizeLabel ?? `${w}`} unit={unit} above={false} />

      {/* 上面図 */}
      <g>
        <g transform={`translate(${tvCx} ${tvCy}) scale(${tvScale})`}>
          <TopView geom={geom} />
        </g>
        <text
          x={tvCx} y={tvCy + (Math.max(w, d) / 2) * tvScale + unit * 4.5}
          textAnchor="middle" fontSize={unit * 2.6} className="fill-muted-foreground stroke-none"
        >
          上面図
        </text>
      </g>

      {/* 表題欄 */}
      <g>
        <rect
          x={fx + fw * 0.3} y={titleY} width={fw * 0.68} height={titleH}
          className="fill-internal-bg/80 stroke-internal/40" strokeWidth={0.8} {...STROKE}
        />
        <text x={fx + fw * 0.32} y={titleY + titleH * 0.38} fontSize={unit * 3.4} className="fill-internal-fg stroke-none" style={{ fontWeight: 600 }}>
          {product.sku}
        </text>
        <text x={fx + fw * 0.32} y={titleY + titleH * 0.68} fontSize={unit * 2.5} className="fill-internal-fg/80 stroke-none">
          {product.maker ?? 'メーカー未登録'}　／　単位 mm　／　社内限定
        </text>
        <text x={fx + fw * 0.32} y={titleY + titleH * 0.93} fontSize={unit * 2.2} className="fill-internal-fg/60 stroke-none">
          ※デモ：仕様値からの生成図
        </text>
      </g>
    </Shell>
  )
}

function NoDrawing({ className }: { className?: string }) {
  return (
    <div className={cn('flex h-full w-full items-center justify-center rounded border border-dashed p-4 text-center text-xs text-muted-foreground', className)}>
      寸法データが未登録のため図面を生成できません
    </div>
  )
}
