'use client'
import * as React from 'react'
import { ChevronLeft, ClipboardCheck, ClipboardList, ExternalLink, FileText, Lock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ContainerSilhouette, DetailDrawing, SimpleDrawing } from '@/components/container-drawing'
import { CategoryBadge, DemoBadge, IconChips, InternalPanel, Notice, RecycleChip, SectionTitle } from '@/components/bits'
import { Link } from '@/app/nav'
import { useInternalMode } from '@/app/internal-mode'
import { useShortlist } from '@/app/shortlist'
import { pageByNumber, products as allProducts, productBySlug } from '@/lib/catalog'
import { DASH, ICON_LABEL, SHAPE_LABEL, capacity, heatBadge, n, perCase, weight } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/types'

function SpecRow({ label, value, note }: { label: string; value: React.ReactNode; note?: string }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] items-baseline gap-2 border-b border-border/60 py-1.5 sm:grid-cols-[9rem_1fr]">
      <dt className="text-spec-sm text-muted-foreground">{label}</dt>
      <dd className="text-spec">
        {value}
        {note && <span className="ml-2 text-[0.6875rem] text-muted-foreground">{note}</span>}
      </dd>
    </div>
  )
}

export function ProductScreen({ slug }: { slug: string }) {
  const product = productBySlug.get(slug)
  const { internal } = useInternalMode()
  const { has, toggle } = useShortlist()

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-sm text-muted-foreground">商品が見つかりませんでした。</p>
        <Button asChild variant="outline" className="mt-4"><Link href="/products">商品一覧へ</Link></Button>
      </div>
    )
  }

  const p = product
  const picked = has(p.slug)
  const related = allProducts
    .filter((x) => x.slug !== p.slug && (x.series ? x.series === p.series : x.group === p.group))
    .slice(0, 8)
  const nearby = allProducts
    .filter((x) => x.slug !== p.slug && x.category === p.category && x.capacityMl !== null && p.capacityMl !== null)
    .sort((a, b) => Math.abs((a.capacityMl ?? 0) - (p.capacityMl ?? 0)) - Math.abs((b.capacityMl ?? 0) - (p.capacityMl ?? 0)))
    .slice(0, 8)

  return (
    <div className="mx-auto max-w-[1400px] px-3 py-5 sm:px-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2 no-print">
        <Link href="/products"><ChevronLeft />商品一覧へ戻る</Link>
      </Button>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        {/* ---------- 図面 ---------- */}
        <div className="lg:sticky lg:top-[4.25rem] lg:self-start">
          <Tabs defaultValue="simple">
            <TabsList className="w-full no-print">
              <TabsTrigger value="simple" className="flex-1"><FileText />簡易図面</TabsTrigger>
              <TabsTrigger value="silhouette" className="flex-1">形状</TabsTrigger>
              {internal && (
                <TabsTrigger value="detail" className="flex-1 data-[state=active]:text-internal-fg">
                  <Lock />詳細図面
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="simple">
              <div className="rounded-lg border bg-card p-4">
                <SimpleDrawing product={p} className="mx-auto h-[26rem]" />
              </div>
              <Notice className="mt-2">
                この簡易図面は仕様値からプログラム描画したものです。お客さまにも公開する想定の情報です（提案書 8-3）。
              </Notice>
            </TabsContent>

            <TabsContent value="silhouette">
              <div className="rounded-lg border bg-card p-8">
                <ContainerSilhouette product={p} tone="category" className="mx-auto h-[24rem]" />
              </div>
              <Notice className="mt-2">
                本番では、ここにご支給の商品写真が入ります（全商品に写真を掲載予定と伺っています）。
              </Notice>
            </TabsContent>

            {internal && (
              <TabsContent value="detail">
                <div className="rounded-lg border border-internal-border bg-internal-bg/40 p-4">
                  <DetailDrawing product={p} className="mx-auto h-[26rem]" />
                </div>
                <Notice tone="warn" className="mt-2">
                  詳細図面は社内モードのときだけ表示されます。お客さまと画面を共有されている場合は、
                  ヘッダーの「社内モード ON」を解除してください。
                </Notice>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* ---------- 仕様 ---------- */}
        <div className="min-w-0 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge id={p.category} />
            {p.isOriginal && <Badge variant="outline">自社オリジナル</Badge>}
            {p.isDemo && <DemoBadge />}
            {!p.inScope && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="warn">Web移行対象範囲外</Badge>
                </TooltipTrigger>
                <TooltipContent>
                  提案書 4-1 の移行対象ページ（29〜38・40〜62・65〜68）に含まれないSKUです。
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          <h1 className="num mt-1.5 text-[1.75rem] font-bold leading-tight tracking-[-0.04em] sm:text-[2rem]">{p.sku}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {p.group}
            {p.series && <> ／ {p.series}</>}
            {p.variantGroup && <> ／ {p.variantGroup}</>}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 no-print">
            <Button
              variant={picked ? 'secondary' : 'default'}
              onClick={() => toggle(p.slug)}
            >
              {picked ? <><ClipboardCheck />検討リストに入っています</> : <><ClipboardList />検討リストに追加</>}
            </Button>
            {p.catalogPages.map((pg) => (
              <Button key={pg} asChild variant="outline">
                <Link href={`/page/${pg}`}>
                  誌面 <span className="num">{pg}</span> ページを開く
                </Link>
              </Button>
            ))}
          </div>

          <IconChips icons={p.icons} className="mt-3" />

          <SectionTitle className="mt-6" sub="単位は mm。容量の OF 表記は満量容量です（誌面 Catalog Guide 準拠）">
            仕様
          </SectionTitle>
          <dl className="rounded-md border bg-card px-3 py-1">
            <SpecRow label="容量" value={<span className="num font-medium">{capacity(p)} ㎖</span>}
              note={p.capacityType === 'overflow' ? '満量容量' : p.capacityType === 'net' ? '正味容量' : '要確認'} />
            <SpecRow label="口部（口の形）" value={p.mouthLabel ?? DASH} />
            <SpecRow label="重量" value={<span className="num">{weight(p)} g</span>} />
            <SpecRow label="入数" value={<span className="num">{perCase(p)}</span>} />
            <SpecRow label="材質" value={p.material} />
            <SpecRow label="耐熱温度" value={<span className="num">{heatBadge(p)}</span>} />
            <SpecRow label="胴サイズ" value={<span className="num">{p.bodySizeLabel ?? DASH}</span>}
              note={SHAPE_LABEL[p.shape] !== DASH ? `形状：${SHAPE_LABEL[p.shape]}` : undefined} />
            <SpecRow label="全高" value={<span className="num">{n(p.heightMm, ' mm')}</span>} />
            <SpecRow label="ラベル面の高さ" value={<span className="num">{n(p.labelHeightMm, ' mm')}</span>} />
            <SpecRow label="リサイクルマーク刻印" value={<RecycleChip p={p} />}
              note={p.recycleMark === 'unknown' ? 'マスターに専用項目が無いため要確認' : undefined} />
            <SpecRow
              label="誌面ページ"
              value={
                p.catalogPages.length ? (
                  <span className="num">
                    {p.catalogPages.map((pg, i) => (
                      <React.Fragment key={pg}>
                        {i > 0 && '・'}
                        <Link href={`/page/${pg}`} className="hover:text-primary hover:underline">{pg}</Link>
                      </React.Fragment>
                    ))} ページ
                  </span>
                ) : (
                  <span className="text-orange-700">要確認</span>
                )
              }
              note={p.catalogPages.length ? pageByNumber.get(p.catalogPages[0])?.title : undefined}
            />
            <SpecRow label="機能（アイコン）" value={p.icons.length ? p.icons.map((i) => ICON_LABEL[i] ?? i).join('・') : DASH} />
            <SpecRow label="注釈" value={p.note ?? DASH} />
          </dl>

          {/* ---------- 社内限定：メーカー情報（提案書 8-4） ---------- */}
          {internal ? (
            <InternalPanel title="メーカー情報" className="mt-4">
              <dl className="space-y-1.5 text-spec">
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 text-internal-fg/70">メーカー</dt>
                  <dd className="font-medium text-internal-fg">
                    {p.maker ?? <span className="font-normal text-internal-fg/60">マスターに未登録（欄自体を出さない運用も可）</span>}
                  </dd>
                </div>
                {p.makerUrl && (
                  <div className="flex gap-2">
                    <dt className="w-24 shrink-0 text-internal-fg/70">該当ページ</dt>
                    <dd>
                      <a href={p.makerUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-internal-fg underline">
                        メーカーサイトを開く<ExternalLink className="size-3" />
                      </a>
                    </dd>
                  </div>
                )}
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 text-internal-fg/70">写真の状態</dt>
                  <dd className="text-internal-fg/90">{p.photoStatus ?? '未設定'}</dd>
                </div>
              </dl>
              <p className="mt-2 border-t border-internal-border/60 pt-2 text-[0.6875rem] leading-relaxed text-internal-fg/70">
                メーカーサイトに該当商品の掲載がある場合はリンク、無い場合はメーカー名のテキスト表示、
                マスターに情報が無い商品は欄自体を表示しない設計です（提案書 8-4）。
              </p>
            </InternalPanel>
          ) : (
            <p className="mt-4 rounded-md border border-dashed px-3 py-2.5 text-xs text-muted-foreground">
              メーカー情報と詳細図面は、社内用アカウントでログインした営業担当者さまのみに表示されます。
              未ログイン状態が「お客さまに見せて安全な状態」です。
            </p>
          )}

          {/* ---------- 関連 ---------- */}
          {related.length > 0 && (
            <section className="mt-8">
              <SectionTitle sub="同じシリーズ／同じ誌面項目の商品">並べて比較する</SectionTitle>
              <RelatedStrip items={related} />
            </section>
          )}
          {nearby.length > 0 && (
            <section className="mt-6">
              <SectionTitle sub="容量が近いカテゴリー内の商品">容量が近い商品</SectionTitle>
              <RelatedStrip items={nearby} />
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function RelatedStrip({ items }: { items: Product[] }) {
  return (
    <ul className="scroll-x flex gap-2 pb-1">
      {items.map((x) => (
        <li key={x.slug} className="shrink-0">
          <Link
            href={`/products/${x.slug}`}
            className="flex w-28 flex-col items-center gap-1 rounded-md border bg-card p-2 text-center transition-colors hover:border-primary/40 hover:bg-accent"
          >
            <ContainerSilhouette product={x} className="h-16 w-12" />
            <span className="w-full truncate text-[0.6875rem] font-medium">{x.sku}</span>
            <span className="num text-[0.6875rem] text-muted-foreground">{capacity(x)}㎖</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
