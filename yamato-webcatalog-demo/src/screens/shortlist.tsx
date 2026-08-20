'use client'
import * as React from 'react'
import { Printer, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ContainerSilhouette, SimpleDrawing } from '@/components/container-drawing'
import { CategoryBadge, Notice, SectionTitle } from '@/components/bits'
import { Link } from '@/app/nav'
import { useInternalMode } from '@/app/internal-mode'
import { useShortlist, useShortlistProducts } from '@/app/shortlist'
import { products as allProducts } from '@/lib/catalog'
import { DASH, capacity, heatBadge, n, perCase, weight } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/types'

/* ==================================================================
   提案書 8-6：検討の保存。
   ・候補を一覧で横並び比較（仕様を行、SKUを列に転置）
   ・簡易図面をまとめて出力（印刷CSSでA4に流し込む）
   ================================================================== */

const ROWS: { label: string; get: (p: Product) => React.ReactNode }[] = [
  { label: '容量（㎖）', get: (p) => <span className="num font-medium">{capacity(p)}</span> },
  { label: '口部', get: (p) => p.mouthLabel ?? DASH },
  { label: '重量（g）', get: (p) => <span className="num">{weight(p)}</span> },
  { label: '入数', get: (p) => <span className="num">{perCase(p)}</span> },
  { label: '材質', get: (p) => p.material },
  { label: '耐熱温度', get: (p) => <span className="num">{heatBadge(p)}</span> },
  { label: '胴サイズ', get: (p) => <span className="num">{p.bodySizeLabel ?? DASH}</span> },
  { label: '全高（mm）', get: (p) => <span className="num">{n(p.heightMm)}</span> },
  { label: 'ラベル面（mm）', get: (p) => <span className="num">{n(p.labelHeightMm)}</span> },
  { label: '誌面ページ', get: (p) => <span className="num">{p.catalogPages.join('・') || '要確認'}</span> },
]

export function ShortlistScreen() {
  const { remove, clear, customer, setCustomer } = useShortlist()
  const { internal } = useInternalMode()
  const items = useShortlistProducts(allProducts)

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-lg font-bold">検討リストは空です</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          商品一覧のチェックボックス、または商品ページの「検討リストに追加」から候補を入れてください。
          次回のお電話のときに、この一覧をそのまま呼び出して続きから会話できます。
        </p>
        <Button asChild className="mt-5"><Link href="/products">商品一覧へ</Link></Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1400px] px-3 py-5 sm:px-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight">検討リスト</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            <span className="num font-medium text-foreground">{items.length}</span> 件の候補
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 no-print">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            お客さま名
            <Input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="（例）〇〇食品工業 様"
              className="h-8 w-48 text-sm"
            />
          </label>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer />簡易図面をまとめて出力
          </Button>
          <Button variant="ghost" size="sm" onClick={clear}><Trash2 />すべて外す</Button>
        </div>
      </div>

      {customer && (
        <p className="print-only mt-2 text-sm font-medium">{customer} ご検討候補一覧</p>
      )}

      {/* 比較表（仕様を行、SKUを列） */}
      <SectionTitle className="mt-6" sub="仕様を縦、候補を横に並べています">仕様の比較</SectionTitle>
      <div className="scroll-x rounded-md border">
        <table className="w-full border-collapse text-spec">
          <thead>
            <tr className="border-b bg-muted/80">
              <th className="sticky left-0 z-10 w-32 bg-muted/95 px-2 py-2 text-left text-[0.6875rem] font-semibold text-muted-foreground">
                項目
              </th>
              {items.map((p) => (
                <th key={p.slug} className="min-w-[9rem] border-l px-2 py-2 text-left align-top">
                  <span className="flex items-start gap-1">
                    <Link href={`/products/${p.slug}`} className="flex-1 text-spec font-semibold hover:text-primary hover:underline">
                      {p.sku}
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(p.slug)}
                      aria-label={`${p.sku} を外す`}
                      className="text-muted-foreground hover:text-destructive no-print"
                    >
                      <X className="size-3.5" />
                    </button>
                  </span>
                  <CategoryBadge id={p.category} className="mt-0.5" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <th scope="row" className="sticky left-0 z-10 bg-background px-2 py-2 text-left text-[0.6875rem] font-medium text-muted-foreground">
                形状
              </th>
              {items.map((p) => (
                <td key={p.slug} className="border-l px-2 py-2">
                  <ContainerSilhouette product={p} className="h-28" />
                </td>
              ))}
            </tr>
            {ROWS.map((r) => (
              <tr key={r.label} className="border-b border-border/60 last:border-0">
                <th scope="row" className="sticky left-0 z-10 bg-background px-2 py-1.5 text-left text-[0.6875rem] font-medium text-muted-foreground">
                  {r.label}
                </th>
                {items.map((p) => (
                  <td key={p.slug} className="border-l px-2 py-1.5 align-middle">{r.get(p)}</td>
                ))}
              </tr>
            ))}
            {internal && (
              <tr className="bg-internal-bg/50">
                <th scope="row" className="sticky left-0 z-10 bg-internal-bg px-2 py-1.5 text-left text-[0.6875rem] font-medium text-internal-fg">
                  メーカー（社内限定）
                </th>
                {items.map((p) => (
                  <td key={p.slug} className="border-l px-2 py-1.5 text-internal-fg">{p.maker ?? '未登録'}</td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 図面まとめ（印刷用レイアウト） */}
      <SectionTitle className="mt-8" sub="「簡易図面をまとめて出力」を押すと、この並びでA4に印刷されます">
        簡易図面まとめ
      </SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <figure key={p.slug} className={cn('print-sheet rounded-md border bg-card p-3')}>
            <SimpleDrawing product={p} className="h-64" />
            <figcaption className="mt-2 border-t pt-2">
              <p className="text-spec font-semibold">{p.sku}</p>
              <p className="num mt-0.5 text-[0.6875rem] text-muted-foreground">
                容量 {capacity(p)}㎖ ／ 全高 {n(p.heightMm)}mm ／ {p.material}
                {p.mouthLabel && ` ／ ${p.mouthLabel}`}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>

      <Notice className="mt-6 no-print">
        本番では、この検討リストをお客さま単位で保存し、次回のご連絡時に同じ一覧を呼び出せるようにします。
        このデモではブラウザのタブを閉じるとリセットされます。
      </Notice>
    </div>
  )
}
