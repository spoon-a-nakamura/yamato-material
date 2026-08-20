'use client'
import * as React from 'react'
import { ArrowRight, BookOpen, Layers, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CatalogSearch } from '@/components/catalog-search'
import { Notice, SectionTitle } from '@/components/bits'
import { Link } from '@/app/nav'
import { CATEGORIES, catClasses, countByCategory, dataset, pages, productsByPage } from '@/lib/catalog'
import { CAPACITY_BANDS } from '@/lib/format'
import { cn } from '@/lib/utils'

/** 誌面で商品が載っているページ（＝Webカタログの着地先になり得るページ） */
const productPages = pages.filter((p) => (productsByPage.get(p.page)?.length ?? 0) > 0)

export function HomeScreen() {
  return (
    <div className="mx-auto max-w-[1400px] px-3 pb-16 sm:px-4">
      {/* ============ 主導線：ページ数の入力（提案書 8-5） ============ */}
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <Phone className="size-3.5" />
            お電話で「◯ページを開いてください」と言われた方へ
          </p>
          <h1 className="mx-auto mt-4 max-w-xl text-balance text-[1.75rem] font-bold leading-tight tracking-tight sm:text-[2.5rem]">
            <span className="whitespace-nowrap">紙のカタログの</span>
            <span className="whitespace-nowrap"><span className="text-primary">ページ数</span>を</span>
            <span className="whitespace-nowrap">入力してください</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            そのページに載っている商品の一覧が開きます。容量・口の形・材質での絞り込みや、
            図面・仕様の確認もこの画面から行えます。
          </p>
        </div>

        <div className="mx-auto mt-7 max-w-2xl">
          <CatalogSearch size="hero" />
        </div>

        {/* 誌面ページへの直接リンク（数字を打たずに選びたい方向け） */}
        <div className="mx-auto mt-6 max-w-3xl">
          <p className="mb-2 text-center text-xs font-medium text-muted-foreground">
            よく開かれるページ
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {productPages.slice(0, 18).map((p) => (
              <Link
                key={p.page}
                href={`/page/${p.page}`}
                className={cn(
                  'group inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1.5 text-xs shadow-card transition-colors hover:border-primary/40 hover:bg-accent'
                )}
              >
                <span className={cn('h-3.5 w-1 rounded-sm', catClasses(p.category).bar)} aria-hidden />
                <span className="num font-semibold">{p.page}</span>
                <span className="text-muted-foreground">{p.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ カテゴリー ============ */}
      <section className="py-6">
        <SectionTitle sub="紙カタログの章立てと同じ区分です">カテゴリーから探す</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => {
            const cc = catClasses(c.id)
            return (
              <Link
                key={c.id}
                href={`/products?cat=${c.id}`}
                className="group relative overflow-hidden rounded-lg border bg-card p-4 shadow-card transition-all hover:shadow-pop"
              >
                <span className={cn('absolute inset-x-0 top-0 h-1', cc.bar)} aria-hidden />
                <h3 className="mt-1 text-sm font-semibold leading-snug">{c.label}</h3>
                <p className="num mt-1 text-xs text-muted-foreground">
                  誌面 {c.pageRange[0]}〜{c.pageRange[1]} ページ
                </p>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className={cn('num text-2xl font-bold', cc.text)}>{countByCategory.get(c.id) ?? 0}</span>
                  <span className="text-xs text-muted-foreground">SKU</span>
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
                  一覧を見る
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ============ 容量から探す ============ */}
      <section className="py-6">
        <SectionTitle sub="紙カタログでは1通りの分け方しか掲載できませんが、Webでは必要な切り口で並べ替えられます（提案書 8-1）">
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
      <section className="mt-8 rounded-lg border bg-muted/40 p-4">
        <h2 className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          <BookOpen className="size-4" />
          このデモサイトについて
          <Badge variant="demo">バックエンド不要のフロントエンドのみ</Badge>
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
          商品写真は未支給のため、仕様値（胴サイズ・全高・ラベル面・口部）から容器シルエットと簡易図面を
          プログラムで描画しています。本番ではご支給の写真・簡易図面に差し替わります。
        </Notice>
      </section>
    </div>
  )
}
