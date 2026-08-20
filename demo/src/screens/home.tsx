'use client'
import * as React from 'react'
import { ArrowRight, BookOpen, Layers } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CatalogSearch } from '@/components/catalog-search'
import { Notice, SectionTitle } from '@/components/bits'
import { Link } from '@/app/nav'
import { CATEGORIES, catClasses, countByCategory, dataset, pages, products, productsByPage } from '@/lib/catalog'
import { buildGeom } from '@/lib/geometry'
import { ContainerSilhouette } from '@/components/container-drawing'
import { BrandSymbol } from '@/components/brand-symbol'
import { CAPACITY_BANDS } from '@/lib/format'
import { cn } from '@/lib/utils'

/** 誌面で商品が載っているページ（＝Webカタログの着地先になり得るページ） */
const productPages = pages.filter((p) => (productsByPage.get(p.page)?.length ?? 0) > 0)

/**
 * カテゴリーごとの代表シルエット。
 * 写真が未支給のため、仕様値（胴サイズ・全高）から描いた容器の輪郭を並べる。
 * 特定のSKUを手で選ぶと、商品が入れ替わったときに固定値が残って嘘になるので、
 * 全高でソートして分位（小・中・大）から機械的に採る。
 * 高さは「そのカテゴリー内の最大」を基準にした相対比で描くため、
 * カテゴリーをまたいだ大小比較にはならない（キャップとボトルを同縮尺で並べない）。
 */
const SILHOUETTE_QUANTILES = [0.15, 0.5, 0.9]

const repsByCategory = new Map(
  CATEGORIES.map((c) => {
    const pool = products
      .filter((p) => p.category === c.id && buildGeom(p) !== null && p.heightMm !== null)
      .sort((a, b) => (a.heightMm ?? 0) - (b.heightMm ?? 0))
    if (!pool.length) return [c.id, { items: [] as typeof pool, maxH: 1 }]
    const picked = SILHOUETTE_QUANTILES.map(
      (q) => pool[Math.min(pool.length - 1, Math.floor(pool.length * q))]
    )
    // 母数が少ない章では同じSKUが重複して選ばれるので畳む
    const items = [...new Map(picked.map((p) => [p.slug, p])).values()]
    return [c.id, { items, maxH: Math.max(...items.map((p) => p.heightMm ?? 1)) }]
  })
)

export function HomeScreen() {
  return (
    <div className="mx-auto max-w-[1400px] px-3 pb-16 sm:px-4">
      {/* ============ 主導線：ページ数の入力（提案書 8-5） ============ */}
      <section className="relative py-14 sm:py-24">
        {/*
          背景のシンボル。
          overflow-hidden はこの層だけに掛ける。section 自体に掛けると
          検索欄のサジェスト（絶対配置）が切り取られてしまう。
          誌面のカテゴリー色と競合しないよう無彩色の極薄で置き、
          はみ出させてスケール感を出す。
        */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <BrandSymbol
            className="absolute left-1/2 top-1/2 h-[108%] w-auto -translate-x-1/2 -translate-y-1/2 text-foreground/[0.025]"
          />
        </div>

        <div className="relative mx-auto max-w-2xl text-center">
          {/* サイトの名乗り。h1（ページ数入力＝提案書 8-5 の主導線）より一段控えめに置き、
              下線はヘッダーの章タブ色帯と同じ意匠で誌面の章立てと呼応させる */}
          <div className="mb-6 flex justify-center sm:mb-7">
            {/* 色帯の幅を文字幅にそろえるため、内側だけ inline-flex にする */}
            <span className="inline-flex flex-col items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight sm:text-2xl">
                Yamato Material
                <span className="ml-2 text-sm font-medium text-muted-foreground sm:text-base">
                  Webカタログ
                </span>
              </span>
              <span className="flex h-1 w-full overflow-hidden rounded-full" aria-hidden>
                {CATEGORIES.map((c) => (
                  <span key={c.id} className={cn('flex-1', catClasses(c.id).bar)} />
                ))}
              </span>
            </span>
          </div>

          <h1 className="mx-auto max-w-2xl text-balance text-[2rem] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[3.25rem]">
            <span className="whitespace-nowrap">紙カタログの</span>
            <span className="whitespace-nowrap"><span className="text-primary">ページ数</span>を</span>
            <span className="whitespace-nowrap">入力ください</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            そのページに載っている商品の一覧が開きます。容量・口の形・材質での絞り込みや、
            図面・仕様の確認もこの画面から行えます。
          </p>
        </div>

        <div className="relative mx-auto mt-7 max-w-2xl">
          <CatalogSearch size="hero" />
        </div>

        {/* 誌面ページへの直接リンク（数字を打たずに選びたい方向け） */}
        <div className="relative mx-auto mt-6 max-w-3xl">
          <p className="mb-3 text-center text-[0.6875rem] tracking-[0.08em] text-muted-foreground">
            よく開かれるページ
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {productPages.slice(0, 18).map((p) => (
              <Link
                key={p.page}
                href={`/page/${p.page}`}
                className={cn(
                  'group inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors hover:bg-accent'
                )}
              >
                <span className={cn('h-3.5 w-1 rounded-sm', catClasses(p.category).bar)} aria-hidden />
                <span className="num font-semibold">{p.page}</span>
                <span className="text-muted-foreground">{p.title}</span>
              </Link>
            ))}
          </div>
          <p className="mt-3 text-center">
            <Button asChild variant="link" size="sm">
              <Link href="/contents">
                <BookOpen className="size-3.5" />
                目次で全 {dataset.catalogPageCount} ページを見る
                <ArrowRight />
              </Link>
            </Button>
          </p>
        </div>
      </section>

      {/* ============ カテゴリー ============ */}
      {/*
        紙カタログの章立てをそのまま見せる区画。
        カードを4つ並べると「同じ重みの箱の反復」になり、
        誌面のどこを開くかという判断材料（ページ範囲・SKU数）が埋もれる。
        そこで箱をやめ、1本の枠を罫線で4分割した「章の一覧」として組む。
        ・各区画の頭に誌面の章タブ色をベタで置き、紙の側面のタブを想起させる
        ・SKU数は等幅で特大にし、章ごとの規模差が一目で分かるようにする
        ・「一覧を見る」の文言は区画全体がリンクなので置かず、矢印だけ残す
      */}
      <section className="py-10">
        <SectionTitle label="CATEGORY" sub="紙カタログの章立てと同じ区分です。数字は掲載SKU数です">
          カテゴリーから探す
        </SectionTitle>
        <div className="grid border-l border-t sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c, i) => {
            const cc = catClasses(c.id)
            const count = countByCategory.get(c.id) ?? 0
            return (
              <Link
                key={c.id}
                href={`/products?cat=${c.id}`}
                className={cn(
                  'group relative flex min-h-[17rem] flex-col border-b border-r p-5 transition-colors',
                  cc.hoverBg
                )}
              >
                {/*
                  章タブ：誌面の章タブ色は実測値で明度が高く（L55〜66%）、
                  白抜き文字では 2.1〜3.1:1、濃色文字を薄い色面に載せても 4.1:1 で
                  いずれも AA（4.5:1）に届かない。
                  そこで番号は本文色（16.3:1）で置き、色の識別は左の帯に担わせる。
                */}
                <span
                  className={cn(
                    'num inline-flex h-6 w-fit shrink-0 items-center gap-1.5 self-start pr-2.5 text-[0.6875rem] font-bold text-foreground',
                    cc.bg
                  )}
                  aria-hidden
                >
                  <span className={cn('h-full w-1.5', cc.bar)} />
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* 代表容器の輪郭。カテゴリー内の全高比で並べ、章ごとの容器の性格を示す */}
                {(() => {
                  const rep = repsByCategory.get(c.id)
                  if (!rep?.items.length) return null
                  return (
                    <div className="mt-4 flex h-[5.5rem] items-end justify-center gap-4" aria-hidden>
                      {rep.items.map((sil) => (
                        <div
                          key={sil.slug}
                          className="flex w-10 items-end justify-center"
                          style={{ height: `${Math.max(28, ((sil.heightMm ?? 1) / rep.maxH) * 100)}%` }}
                        >
                          <ContainerSilhouette
                            product={sil}
                            className="h-full w-full"
                            shapeClassName={cn(cc.shape, 'transition-colors')}
                            align="bottom"
                          />
                        </div>
                      ))}
                    </div>
                  )
                })()}

                <h3 className="mt-4 text-[0.9375rem] font-bold leading-snug tracking-tight group-hover:underline">
                  {c.label}
                </h3>
                <p className="num mt-1 text-[0.6875rem] tracking-[0.04em] text-muted-foreground">
                  誌面 {c.pageRange[0]}–{c.pageRange[1]} ページ
                </p>

                <p className="mt-auto flex items-baseline gap-1.5 pt-4">
                  <span className={cn('num text-[2.75rem] font-bold leading-none tracking-[-0.05em]', cc.text)}>
                    {count}
                  </span>
                  <span className="text-[0.6875rem] tracking-[0.06em] text-muted-foreground">SKU</span>
                </p>

                <ArrowRight
                  className="absolute bottom-5 right-5 size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground"
                  aria-hidden
                />
              </Link>
            )
          })}
        </div>
      </section>

      {/* ============ 容量から探す ============ */}
      <section className="py-10">
        <SectionTitle label="CAPACITY" sub="紙カタログでは1通りの分け方しか掲載できませんが、Webでは必要な切り口で並べ替えられます（提案書 8-1）">
          容量から探す
        </SectionTitle>
        <div className="flex flex-wrap gap-2">
          {CAPACITY_BANDS.map((b) => (
            <Button key={b.id} asChild variant="outline" size="lg">
              <Link href={`/products?band=${b.id}`}>
                <Layers />
                <span className="num">{b.label}</span>
              </Link>
            </Button>
          ))}
          <Button asChild variant="secondary" size="lg">
            <Link href="/products">
              すべての条件で絞り込む
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      {/* ============ デモの位置づけ ============ */}
      <section className="mt-10 border-t pt-6">
        <h2 className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          <BookOpen className="size-4" />
          このデモサイトについて
        </h2>
        <div className="mt-2 grid gap-x-6 gap-y-1 text-xs leading-relaxed text-muted-foreground sm:grid-cols-2">
          <p>
            掲載 {dataset.products.length} SKU のうち{' '}
            <span className="num font-medium text-foreground">
              {dataset.products.filter((p) => !p.isDemo).length}
            </span>{' '}
            件は、ご提供いただいた「仕様リスト_食品プラスチック(ボトル).xlsx」の実データです。
          </p>
          <p>
            食品ガラスボトル・酒類・キャップは、規模感を確認するために生成した架空データで、
            画面上に「デモデータ」と表示しています。
          </p>
        </div>
        <Button asChild variant="link" size="sm" className="mt-1 px-0">
          <Link href="/about">データの出典と確認事項を見る<ArrowRight /></Link>
        </Button>
        <Notice className="mt-3">
          商品写真は未支給のため、仕様値（胴サイズ・全高・ラベル面・口部）から容器シルエットと簡易図面を仮で描画しています。本番ではご支給の写真・簡易図面に差し替えてまいります。
        </Notice>
      </section>
    </div>
  )
}
