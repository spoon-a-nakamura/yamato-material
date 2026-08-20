'use client'
import * as React from 'react'
import { BookOpen, ChevronRight, ListTree } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Notice } from '@/components/bits'
import { Link } from '@/app/nav'
import { CATEGORY_LABEL, catClasses, dataset, pages, productsByPage } from '@/lib/catalog'
import { cn } from '@/lib/utils'
import type { CatalogPage, CategoryId } from '@/lib/types'

/* ==================================================================
   紙カタログの目次をそのままWeb上に置いた画面。
   誌面の章立て（＝カテゴリーが連続する区間）を1画面に縦に並べ、
   左（SPでは上）の目次からページ番号でその位置へスクロールする。
   ================================================================== */

interface Chapter {
  id: string
  category: CategoryId
  label: string
  pages: CatalogPage[]
  skuCount: number
  /** Web移行対象に入るページ番号の範囲（無い章は undefined） */
  scope?: [number, number]
}

/**
 * 章の区切り＝カテゴリーが切り替わる位置。
 * 「その他」は巻頭（目次・特集）と巻末（会社案内ほか）の2回現れるため、
 * カテゴリー名ではなく誌面のページタイトルから章名を組み立てて区別する。
 */
const chapters: Chapter[] = (() => {
  const out: Chapter[] = []
  for (const pg of pages) {
    const last = out[out.length - 1]
    if (last && last.category === pg.category) last.pages.push(pg)
    else out.push({ id: `ch-${pg.category}-${pg.page}`, category: pg.category, label: '', pages: [pg], skuCount: 0 })
  }
  for (const ch of out) {
    ch.skuCount = ch.pages.reduce((n, p) => n + (productsByPage.get(p.page)?.length ?? 0), 0)
    const titles = [...new Set(ch.pages.map((p) => p.title))]
    ch.label =
      ch.category === 'other'
        ? titles.slice(0, 2).join('・') + (titles.length > 2 ? ' ほか' : '')
        : CATEGORY_LABEL[ch.category] ?? 'その他'
    const inScope = ch.pages.filter((p) => p.inScope)
    if (inScope.length) ch.scope = [inScope[0].page, inScope[inScope.length - 1].page]
  }
  return out
})()

const firstPage = (ch: Chapter) => ch.pages[0].page
const lastPage = (ch: Chapter) => ch.pages[ch.pages.length - 1].page

/**
 * 単一HTML版はハッシュ（#/page/29）をルート指定に使うため、
 * <a href="#p-29"> のアンカーリンクは「/p-29 への画面遷移」と解釈されてしまう。
 * 目次内のジャンプは href を持たせず、要素への直接スクロールで実装する。
 * これで Next.js 版・単一HTML版のどちらも同じコードで動く。
 */
function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

export function ContentsScreen() {
  const [active, setActive] = React.useState<string>(chapters[0]?.id ?? '')
  const [flash, setFlash] = React.useState<number | null>(null)
  const flashTimer = React.useRef<number | undefined>(undefined)

  const jumpToPage = React.useCallback((page: number) => {
    scrollToId(`p-${page}`)
    // 着地点を数秒だけ強調する（77行の中のどこに飛んだか分かるように）
    setFlash(page)
    window.clearTimeout(flashTimer.current)
    flashTimer.current = window.setTimeout(() => setFlash(null), 2200)
  }, [])

  React.useEffect(() => () => window.clearTimeout(flashTimer.current), [])

  // 現在表示中の章を目次側で強調する
  React.useEffect(() => {
    const els = chapters
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => el !== null)
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (hit) setActive(hit.target.id)
      },
      { rootMargin: '-15% 0px -70% 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div className="mx-auto max-w-[1400px] px-3 py-5 sm:px-4">
      <header className="mb-4">
        <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <BookOpen className="size-5 text-primary" />
          目次
        </h1>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          紙カタログ全 <span className="num font-medium text-foreground">{dataset.catalogPageCount}</span> ページの章立てです。
          目次のページ番号を押すと、この画面のその位置までスクロールします。
          一覧の行を押すと、そのページの商品一覧が開きます。
        </p>
      </header>

      {/* SP：目次は本文の上に置く（横幅が足りずサイドに出せないため） */}
      <div className="mb-5 rounded-lg border bg-card p-3 shadow-card lg:hidden no-print">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <ListTree className="size-3.5" />
          ページ番号を選ぶ
        </p>
        <Toc
          active={active}
          cols="grid-cols-10 sm:grid-cols-[repeat(16,minmax(0,1fr))]"
          onChapter={scrollToId}
          onPage={jumpToPage}
        />
      </div>

      <div className="flex gap-6">
        {/* PC：目次を画面左に固定 */}
        <aside className="hidden w-72 shrink-0 lg:block no-print">
          <div className="sticky top-[4.25rem] max-h-[calc(100vh-5.5rem)] overflow-y-auto pr-1">
            <Toc active={active} cols="grid-cols-8" onChapter={scrollToId} onPage={jumpToPage} />
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-8">
          {chapters.map((ch) => {
            const cc = catClasses(ch.category)
            return (
              <section key={ch.id} id={ch.id} className="scroll-mt-32 lg:scroll-mt-20">
                <h2 className="mb-2 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className={cn('h-5 w-1.5 rounded-sm', cc.bar)} aria-hidden />
                  <span className="text-base font-semibold tracking-tight">{ch.label}</span>
                  <span className="num text-xs text-muted-foreground">
                    誌面 {firstPage(ch)}〜{lastPage(ch)} ページ
                  </span>
                  {ch.skuCount > 0 && (
                    <span className="num text-xs text-muted-foreground">／ 掲載 {ch.skuCount} SKU</span>
                  )}
                  {ch.scope && (
                    <Badge variant="outline" className="num">
                      Web移行対象 {ch.scope[0]}〜{ch.scope[1]}ページ
                    </Badge>
                  )}
                </h2>

                <ul className="divide-y overflow-hidden rounded-lg border bg-card shadow-card">
                  {ch.pages.map((pg) => {
                    const n = productsByPage.get(pg.page)?.length ?? 0
                    return (
                      <li
                        key={pg.page}
                        id={`p-${pg.page}`}
                        className={cn(
                          'scroll-mt-32 transition-colors lg:scroll-mt-20',
                          flash === pg.page && 'bg-accent ring-2 ring-inset ring-primary'
                        )}
                      >
                        <Link
                          href={`/page/${pg.page}`}
                          className="group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-accent"
                        >
                          <span
                            className={cn(
                              'num w-9 shrink-0 text-right text-lg font-bold leading-none',
                              n > 0 ? cc.text : 'text-muted-foreground/60'
                            )}
                          >
                            {pg.page}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className={cn('block truncate text-sm font-medium', n === 0 && 'text-muted-foreground')}>
                              {pg.title}
                            </span>
                            <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                              {n > 0 ? (
                                <span className="num">{n} 件</span>
                              ) : (
                                <span>このページの商品はまだ登録されていません</span>
                              )}
                            </span>
                          </span>
                          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}

          <Notice>
            誌面ページと商品の対応は「00_ページ対応表.csv」から機械的に作成しています。
            商品が登録されていないページは、今回のWeb移行対象範囲外か、データ収集が未完了のページです（提案書 4-1 / 14-2）。
          </Notice>
        </main>
      </div>
    </div>
  )
}

/** 章 → ページ番号の2階層の目次。PC のサイドと SP の上部で同じものを使う */
function Toc({
  active, cols, onChapter, onPage,
}: {
  active: string
  cols: string
  onChapter: (id: string) => void
  onPage: (page: number) => void
}) {
  return (
    <nav aria-label="目次">
      {chapters.map((ch) => {
        const cc = catClasses(ch.category)
        return (
          <div key={ch.id} className="mb-3 last:mb-0">
            <button
              type="button"
              onClick={() => onChapter(ch.id)}
              aria-label={`${ch.label}（${firstPage(ch)}〜${lastPage(ch)}ページ）`}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent',
                active === ch.id && 'bg-accent'
              )}
            >
              <span className={cn('h-5 w-1.5 shrink-0 rounded-sm', cc.bar)} aria-hidden />
              <span className={cn('flex-1 text-[0.8125rem] leading-snug', active === ch.id && 'font-semibold')}>
                {ch.label}
              </span>
              <span className="num shrink-0 text-[0.6875rem] text-muted-foreground">
                {firstPage(ch)}–{lastPage(ch)}
              </span>
            </button>

            <div className={cn('mt-1 grid gap-1 pl-3.5', cols)}>
              {ch.pages.map((pg) => {
                const n = productsByPage.get(pg.page)?.length ?? 0
                return (
                  <button
                    key={pg.page}
                    type="button"
                    onClick={() => onPage(pg.page)}
                    aria-label={`${pg.page}ページ ${pg.title}`}
                    title={`${pg.page}ページ ${pg.title}`}
                    className={cn(
                      'num h-6 rounded border text-[0.6875rem] font-medium transition-colors hover:border-primary/40 hover:bg-accent',
                      n > 0 ? 'bg-card' : 'border-dashed text-muted-foreground/70'
                    )}
                  >
                    {pg.page}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </nav>
  )
}
