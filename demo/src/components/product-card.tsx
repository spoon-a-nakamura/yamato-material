'use client'
import * as React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ContainerSilhouette } from '@/components/container-drawing'
import { DemoBadge, IconChips, RecycleChip } from '@/components/bits'
import { Link } from '@/app/nav'
import { useInternalMode } from '@/app/internal-mode'
import { useShortlist } from '@/app/shortlist'
import { DASH, capacity, heatBadge, n, perCase, weight } from '@/lib/format'
import { catClasses } from '@/lib/catalog'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/types'

/** カード表示（スマートフォン既定）。仕様は2列グリッドで、表と同じ項目を保つ */
export function ProductCard({ p }: { p: Product }) {
  const { internal } = useInternalMode()
  const { has, toggle } = useShortlist()
  const picked = has(p.slug)
  const cc = catClasses(p.category)

  const specs: { k: string; v: React.ReactNode; wide?: boolean }[] = [
    { k: '容量', v: <span className="num font-medium">{capacity(p)}㎖</span> },
    { k: '重量', v: <span className="num">{weight(p)}g</span> },
    { k: '入数', v: <span className="num">{perCase(p)}</span> },
    { k: '材質', v: p.material },
    { k: '耐熱', v: <span className="num">{heatBadge(p)}</span> },
    { k: '全高', v: <span className="num">{n(p.heightMm, 'mm')}</span> },
    { k: '胴サイズ', v: <span className="num">{p.bodySizeLabel ?? DASH}</span> },
    { k: 'ラベル面', v: <span className="num">{n(p.labelHeightMm, 'mm')}</span> },
    { k: '口部', v: p.mouthLabel ?? DASH, wide: true },
    { k: 'リサイクル刻印', v: <RecycleChip p={p} />, wide: true },
  ]

  return (
    <article
      className={cn(
        'relative flex gap-3 rounded-md border bg-card p-3 shadow-card transition-colors',
        picked && 'border-primary/40 bg-primary/[0.03]'
      )}
    >
      <span className={cn('absolute inset-y-0 left-0 w-[3px] rounded-l', cc.bar)} aria-hidden />

      <Link href={`/products/${p.slug}`} className="ml-1 flex w-16 shrink-0 items-center justify-center">
        <ContainerSilhouette product={p} className="h-24 w-16" />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <h3 className="min-w-0 flex-1 text-sm font-semibold leading-snug">
            <Link href={`/products/${p.slug}`} className="num hover:underline">{p.sku}</Link>
          </h3>
          <Checkbox checked={picked} onCheckedChange={() => toggle(p.slug)} aria-label={`${p.sku} を検討リストに追加`} className="mt-0.5" />
        </div>

        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[0.6875rem] text-muted-foreground">
          <span className={cc.text}>{p.group}</span>
          {p.series && <><span aria-hidden>·</span>{p.series}</>}
          {p.isOriginal && <Badge variant="outline">自社オリジナル</Badge>}
          {p.isDemo && <DemoBadge />}
        </p>

        <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-spec-sm">
          {specs.map(({ k, v, wide }) => (
            <div
              key={k}
              className={cn(
                'flex items-baseline justify-between gap-2 border-b border-border/50 pb-0.5',
                wide && 'col-span-2'
              )}
            >
              <dt className="shrink-0 text-muted-foreground">{k}</dt>
              <dd className="min-w-0 truncate text-right">{v}</dd>
            </div>
          ))}
        </dl>

        <IconChips icons={p.icons} className="mt-2" />

        <p className="mt-2 text-[0.6875rem] text-muted-foreground">
          {p.catalogPages.length ? (
            <>誌面 {p.catalogPages.map((pg, i) => (
              <React.Fragment key={pg}>{i > 0 && '・'}
                <Link href={`/page/${pg}`} className="font-medium hover:underline">{pg}</Link>
              </React.Fragment>
            ))} ページ</>
          ) : (
            <span className="text-orange-700">誌面ページ 要確認</span>
          )}
        </p>

        {internal && (
          <p className="mt-2 rounded border border-internal-border bg-internal-bg px-2 py-1 text-[0.6875rem] text-internal-fg">
            メーカー：{p.maker ?? '未登録'}
          </p>
        )}
      </div>
    </article>
  )
}
