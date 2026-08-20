'use client'
import * as React from 'react'
import { ChevronLeft, ChevronRight, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProductTable } from '@/components/product-table'
import { ProductCard } from '@/components/product-card'
import { CategoryBadge, Notice } from '@/components/bits'
import { Link } from '@/app/nav'
import { CatalogSearch } from '@/components/catalog-search'
import { catClasses, dataset, pageByNumber, pages, productsByPage } from '@/lib/catalog'
import { cn } from '@/lib/utils'

/* ==================================================================
   提案書 8-5：紙のノンブルからの着地ページ。
   「その中の◯◯です」と口頭で特定する会話が続く前提なので、
   ページ内の全SKUを1画面に、仕様を横並びで並べる。
   ================================================================== */

export function PageScreen({ pageNumber }: { pageNumber: number }) {
  const page = pageByNumber.get(pageNumber)
  const items = productsByPage.get(pageNumber) ?? []

  const withItems = React.useMemo(
    () => pages.filter((p) => (productsByPage.get(p.page)?.length ?? 0) > 0).map((p) => p.page),
    []
  )
  const idx = withItems.indexOf(pageNumber)
  const prev = idx > 0 ? withItems[idx - 1] : undefined
  const next = idx >= 0 && idx < withItems.length - 1 ? withItems[idx + 1] : undefined

  if (!page) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-lg font-bold">{pageNumber} ページは見つかりませんでした</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          ご入力いただけるのは 1〜{dataset.catalogPageCount} ページです。
        </p>
        <div className="mx-auto mt-6 max-w-md"><CatalogSearch size="hero" autoFocus /></div>
      </div>
    )
  }

  const cc = catClasses(page.category)

  return (
    <div className="mx-auto max-w-[1400px] px-3 py-5 sm:px-4">
      <div className={cn('rounded-lg border-l-4 bg-card p-4 shadow-card', cc.border)}>
        <div className="flex flex-wrap items-center gap-2">
          <CategoryBadge id={page.category} />
          {!page.inScope && <Badge variant="warn">Web移行対象範囲外のページ</Badge>}
        </div>
        <h1 className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className={cn('num text-3xl font-bold leading-none', cc.text)}>{page.page}</span>
          <span className="text-sm font-medium text-muted-foreground">ページ</span>
          <span className="text-xl font-bold tracking-tight">{page.title}</span>
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          <Phone className="mr-1 inline-block size-3.5 -translate-y-px align-middle" aria-hidden />
          このページには <span className="num font-semibold text-foreground">{items.length}</span> 件の商品があります。
          お電話でお伝えいただいた品番を、下の表からお選びください。
        </p>
      </div>

      {items.length === 0 ? (
        <Notice tone="warn" className="mt-4">
          このページの商品データは、まだWebカタログに登録されていません。
          {page.category === 'film' && '（食品フィルムは今回のWeb移行対象外のページです）'}
          {page.inScope && 'データ収集の完了後に反映されます（提案書 14-2）。'}
        </Notice>
      ) : (
        <>
          <ProductTable groups={[{ title: '', items }]} className="mt-4 hidden sm:block" />
          <div className="mt-4 grid gap-2 sm:hidden">
            {items.map((p) => <ProductCard key={p.slug} p={p} />)}
          </div>
        </>
      )}

      <nav className="mt-6 flex items-center justify-between gap-3 no-print">
        {prev !== undefined ? (
          <Button asChild variant="outline">
            <Link href={`/page/${prev}`}>
              <ChevronLeft />
              <span className="num">{prev}</span>ページ
              <span className="hidden text-muted-foreground sm:inline">{pageByNumber.get(prev)?.title}</span>
            </Link>
          </Button>
        ) : <span />}
        {next !== undefined ? (
          <Button asChild variant="outline">
            <Link href={`/page/${next}`}>
              <span className="hidden text-muted-foreground sm:inline">{pageByNumber.get(next)?.title}</span>
              <span className="num">{next}</span>ページ
              <ChevronRight />
            </Link>
          </Button>
        ) : <span />}
      </nav>

      <div className="mt-8 rounded-lg border bg-muted/40 p-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">別のページを開く</p>
        <div className="flex flex-wrap gap-1.5">
          {pages.filter((p) => (productsByPage.get(p.page)?.length ?? 0) > 0).map((p) => (
            <Link
              key={p.page}
              href={`/page/${p.page}`}
              className={cn(
                'num inline-flex h-8 min-w-8 items-center justify-center rounded border bg-card px-2 text-xs font-medium transition-colors hover:bg-accent',
                p.page === pageNumber && 'border-primary bg-primary text-primary-foreground hover:bg-primary'
              )}
              title={p.title}
            >
              {p.page}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
