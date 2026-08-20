'use client'
import * as React from 'react'
import { AlertTriangle, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { CATEGORY_LABEL, catClasses } from '@/lib/catalog'
import { ICON_LABEL, RECYCLE_LABEL } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { CategoryId, Product } from '@/lib/types'

/** カテゴリー識別バッジ（紙カタログの章タブ色を継承） */
export function CategoryBadge({ id, className }: { id: CategoryId; className?: string }) {
  const label = CATEGORY_LABEL[id]
  const c = catClasses(id)
  if (!label) return null
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[0.6875rem] font-medium', c.text, className)}>
      <span className={cn('inline-block h-2.5 w-1 rounded-sm', c.bar)} aria-hidden />
      {label}
    </span>
  )
}

/** カテゴリー色の縦帯（一覧のグルーピング見出し等） */
export function CategoryBar({ id, className }: { id: CategoryId; className?: string }) {
  return <span className={cn('block w-1 rounded-full', catClasses(id).bar, className)} aria-hidden />
}

export function IconChips({ icons, className }: { icons: string[]; className?: string }) {
  if (!icons.length) return null
  return (
    <span className={cn('inline-flex flex-wrap gap-1', className)}>
      {icons.map((i) => (
        <Badge key={i} variant="outline" className="border-border/80">
          {ICON_LABEL[i] ?? i}
        </Badge>
      ))}
    </span>
  )
}

export function RecycleChip({ p }: { p: Product }) {
  const v = p.recycleMark
  const cls =
    v === 'yes' ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
    : v === 'no' ? 'border-border text-muted-foreground'
    : v === 'option' ? 'border-sky-300 bg-sky-50 text-sky-800'
    : 'border-dashed border-border text-muted-foreground'
  return (
    <Badge
      className={cls}
      title={v === 'unknown' ? '現行マスターに専用項目が無いため、データ再収集時に確定します' : undefined}
    >
      {RECYCLE_LABEL[v]}
    </Badge>
  )
}

/** デモ用に生成した架空データであることの明示 */
export function DemoBadge({ className }: { className?: string }) {
  return (
    <Badge variant="demo" className={className} title="このSKUはデモ用に生成した架空データです">
      デモデータ
    </Badge>
  )
}

/** 社内限定情報の枠。既定では描画されない（呼び出し側で internal を判定する） */
export function InternalPanel({
  title = '社内限定情報', children, className,
}: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section
      className={cn('rounded-md border border-internal-border bg-internal-bg p-3', className)}
      aria-label={title}
    >
      <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-internal-fg">
        <Lock className="size-3.5" />
        {title}
        <span className="ml-auto font-normal text-internal-fg/70">お客さまの画面には表示されません</span>
      </h3>
      {children}
    </section>
  )
}

export function Notice({
  children, tone = 'muted', className,
}: { children: React.ReactNode; tone?: 'muted' | 'warn'; className?: string }) {
  return (
    <p
      className={cn(
        'flex items-start gap-1.5 rounded-md px-2.5 py-2 text-xs leading-relaxed',
        tone === 'warn' ? 'bg-orange-50 text-orange-900' : 'bg-muted text-muted-foreground',
        className
      )}
    >
      {tone === 'warn' && <AlertTriangle className="mt-px size-3.5 shrink-0" />}
      <span>{children}</span>
    </p>
  )
}

export function SectionTitle({
  children, sub, action, className,
}: { children: React.ReactNode; sub?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-3 flex flex-wrap items-end justify-between gap-2', className)}>
      <div>
        <h2 className="text-base font-semibold tracking-tight">{children}</h2>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  )
}
