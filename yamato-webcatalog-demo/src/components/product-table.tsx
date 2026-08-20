'use client'
import * as React from 'react'
import { ExternalLink } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ContainerSilhouette } from '@/components/container-drawing'
import { CategoryBar, DemoBadge, RecycleChip } from '@/components/bits'
import { Link } from '@/app/nav'
import { useInternalMode } from '@/app/internal-mode'
import { useShortlist } from '@/app/shortlist'
import { DASH, capacity, heatBadge, n, perCase, weight } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/types'

/* ==================================================================
   提案書 8-1：一覧の段階で仕様の横並び比較ができることを最優先にした表。
   ・グルーピングは「表を分ける」のではなく「見出し行を差し込む」方式。
     表を分けると列幅がグループごとにずれ、横並び比較が成立しなくなる。
   ・行高は --row-h 固定／数値は tabular-nums で桁を揃える
   ・狭い画面では横スクロールし、品番列だけを固定して現在行を見失わせない
   ・社内モードのときだけ「メーカー」列が末尾に増える
   ================================================================== */

export interface TableGroup {
  title: string
  items: Product[]
}

const TH = 'h-8 whitespace-nowrap px-2 text-left align-middle text-[0.6875rem] font-semibold text-muted-foreground'
const TD = 'whitespace-nowrap px-2 align-middle text-spec'

export function ProductTable({
  groups, className,
}: { groups: TableGroup[]; className?: string }) {
  const { internal } = useInternalMode()
  const { has, toggle } = useShortlist()
  const total = groups.reduce((a, g) => a + g.items.length, 0)
  const colSpan = 14 + (internal ? 1 : 0) + 1
  const showGroupRows = groups.length > 1 || Boolean(groups[0]?.title)

  return (
    <div className={cn('scroll-x rounded-md border', className)}>
      <table className="w-full border-collapse text-spec">
        <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
          <tr className="border-b">
            <th className={cn(TH, 'w-8 px-1.5 text-center')}><span className="sr-only">検討</span></th>
            <th className={cn(TH, 'w-9 px-1')}><span className="sr-only">形状</span></th>
            <th className={cn(TH, 'sticky left-0 z-10 min-w-[10rem] bg-muted/95')}>品番</th>
            <th className={cn(TH, 'text-right')}>容量<span className="font-normal">（㎖）</span></th>
            <th className={TH}>口部</th>
            <th className={cn(TH, 'text-right')}>重量<span className="font-normal">（g）</span></th>
            <th className={cn(TH, 'text-right')}>入数</th>
            <th className={TH}>材質</th>
            <th className={cn(TH, 'text-right')}>耐熱</th>
            <th className={TH}>胴サイズ</th>
            <th className={cn(TH, 'text-right')}>全高</th>
            <th className={cn(TH, 'text-right')}>ラベル面</th>
            <th className={TH}>リサイクル刻印</th>
            <th className={cn(TH, 'text-right')}>誌面P</th>
            {internal && <th className={cn(TH, 'bg-internal-bg/80 text-internal-fg')}>メーカー</th>}
            {/* 余白を吸収する空列：実データ列をコンテンツ幅に詰め、視線移動を短くする */}
            <th className="w-full" aria-hidden />
          </tr>
        </thead>

        {groups.map((g) => (
          <tbody key={g.title || '__all'}>
            {showGroupRows && g.title && (
              <tr>
                <th
                  colSpan={colSpan}
                  scope="colgroup"
                  className="border-y bg-secondary/70 px-2 py-1 text-left text-[0.6875rem] font-semibold"
                >
                  <span className="flex items-center gap-2">
                    {g.items[0] && <CategoryBar id={g.items[0].category} className="h-3.5" />}
                    {g.title}
                    <span className="num font-normal text-muted-foreground">{g.items.length}件</span>
                  </span>
                </th>
              </tr>
            )}
            {g.items.map((p) => {
              const picked = has(p.slug)
              return (
                <tr
                  key={p.slug}
                  className={cn(
                    'border-b border-border/60 transition-colors',
                    picked ? 'bg-primary/[0.04]' : 'hover:bg-accent/50'
                  )}
                  style={{ height: 'var(--row-h)' }}
                >
                  <td className="px-1.5 text-center align-middle">
                    <Checkbox
                      checked={picked}
                      onCheckedChange={() => toggle(p.slug)}
                      aria-label={`${p.sku} を検討リストに追加`}
                    />
                  </td>
                  <td className="px-1 align-middle">
                    <ContainerSilhouette product={p} className="h-7 w-7" />
                  </td>
                  <th scope="row" className={cn(TD, 'sticky left-0 z-10 bg-inherit text-left font-medium')}>
                    <span className="flex items-center gap-1.5">
                      <Link href={`/products/${p.slug}`} className="hover:text-primary hover:underline">
                        {p.sku}
                      </Link>
                      {p.isOriginal && <Badge variant="outline" className="hidden sm:inline-flex">自社</Badge>}
                      {p.isDemo && <DemoBadge className="hidden lg:inline-flex" />}
                    </span>
                  </th>
                  <td className={cn(TD, 'num text-right font-medium')}>{capacity(p)}</td>
                  <td className={cn(TD, 'max-w-[10rem] truncate text-muted-foreground')} title={p.mouthLabel ?? ''}>
                    {p.mouthLabel ?? DASH}
                  </td>
                  <td className={cn(TD, 'num text-right')}>{weight(p)}</td>
                  <td className={cn(TD, 'num text-right')}>{perCase(p)}</td>
                  <td className={cn(TD, 'text-muted-foreground')}>{p.material}</td>
                  <td className={cn(TD, 'num text-right')}>{heatBadge(p)}</td>
                  <td className={cn(TD, 'num text-muted-foreground')}>{p.bodySizeLabel ?? DASH}</td>
                  <td className={cn(TD, 'num text-right')}>{n(p.heightMm)}</td>
                  <td className={cn(TD, 'num text-right')}>{n(p.labelHeightMm)}</td>
                  <td className={TD}><RecycleChip p={p} /></td>
                  <td className={cn(TD, 'num text-right')}>
                    {p.catalogPages.length ? (
                      p.catalogPages.map((pg, i) => (
                        <React.Fragment key={pg}>
                          {i > 0 && '・'}
                          <Link href={`/page/${pg}`} className="hover:text-primary hover:underline">{pg}</Link>
                        </React.Fragment>
                      ))
                    ) : (
                      <span className="text-muted-foreground" title="誌面ページとの対応が支給資料から確定できていません">
                        要確認
                      </span>
                    )}
                  </td>
                  {internal && (
                    <td className={cn(TD, 'bg-internal-bg/40 text-internal-fg')}>
                      {p.maker ? (
                        p.makerUrl ? (
                          <a href={p.makerUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
                            {p.maker}<ExternalLink className="size-3" />
                          </a>
                        ) : p.maker
                      ) : (
                        <span className="text-internal-fg/50">未登録</span>
                      )}
                    </td>
                  )}
                  <td aria-hidden />
                </tr>
              )
            })}
          </tbody>
        ))}
      </table>

      {total === 0 && (
        <p className="px-4 py-10 text-center text-sm text-muted-foreground">
          条件に合う商品がありません。絞り込みを緩めてください。
        </p>
      )}
    </div>
  )
}
