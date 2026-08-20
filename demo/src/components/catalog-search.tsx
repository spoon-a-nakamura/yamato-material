'use client'
import * as React from 'react'
import { ArrowRight, BookOpen, Package, Search, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { asPageNumber, dataset, search, type SearchHit } from '@/lib/catalog'
import { useNav } from '@/app/nav'
import { cn } from '@/lib/utils'

/* ==================================================================
   提案書 8-5：紙カタログからWebへの導線
   ・主導線は「ページ数の入力」。数字だけなので電話口で伝えやすい
   ・同じ入力欄で品番・カテゴリー名も受ける（お客さまに入口を選ばせない）
   ================================================================== */

function hitHref(h: SearchHit) {
  if (h.kind === 'page') return `/page/${h.page.page}`
  if (h.kind === 'product') return `/products/${h.product.slug}`
  return `/page/${h.pages[0]}`
}

export function CatalogSearch({
  size = 'default', autoFocus, className, placeholder,
}: { size?: 'default' | 'hero'; autoFocus?: boolean; className?: string; placeholder?: string }) {
  const nav = useNav()
  const [q, setQ] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState(0)
  const hits = React.useMemo(() => search(q, 8), [q])
  const pageNo = asPageNumber(q)
  const boxRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const go = (href: string) => { setOpen(false); nav.push(href) }

  const submit = () => {
    if (pageNo !== null) return go(`/page/${pageNo}`)
    if (hits.length) return go(hitHref(hits[Math.min(active, hits.length - 1)]))
    if (q.trim()) return go(`/products?q=${encodeURIComponent(q.trim())}`)
  }

  const hero = size === 'hero'

  return (
    <div ref={boxRef} className={cn('relative', className)}>
      <form
        onSubmit={(e) => { e.preventDefault(); submit() }}
        className={cn('flex gap-2', hero && 'flex-col sm:flex-row')}
      >
        <div className="relative flex-1">
          <Search
            className={cn(
              'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground',
              hero ? 'size-5' : 'size-4'
            )}
          />
          <Input
            value={q}
            autoFocus={autoFocus}
            inputMode="text"
            enterKeyHint="search"
            aria-label="カタログのページ数・品番・キーワードで検索"
            autoComplete="off"
            onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(0) }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, hits.length - 1)) }
              if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
              if (e.key === 'Escape') setOpen(false)
            }}
            placeholder={placeholder ?? 'ページ数・品番・キーワード'}
            className={cn(
              hero
                ? 'h-16 rounded-lg pl-11 text-2xl font-semibold shadow-card num placeholder:text-lg placeholder:font-normal'
                : 'h-9 pl-9'
            )}
          />
        </div>
        {/* hero では入力欄が h-16 なので、ボタンも同じ高さに揃える
            （size="xl" は h-14 のため、そのままだと 8px 低くなる） */}
        <Button type="submit" size={hero ? 'xl' : 'default'} className={cn(hero && 'h-16 rounded-lg')}>
          {hero ? 'このページを開く' : '検索'}
          <ArrowRight />
        </Button>
      </form>

      {hero && (
        <p className="mt-2 text-xs text-muted-foreground">
          紙のカタログに印刷されたページ数（1〜{dataset.catalogPageCount}）を入力してください。品番やカテゴリー名でも探せます。
        </p>
      )}

      {open && q.trim() !== '' && (
        <div
          className="absolute left-0 right-0 top-full z-40 mt-1.5 overflow-hidden rounded-md border bg-popover shadow-pop animate-fade-in"
          role="listbox"
        >
          {hits.length === 0 && (
            <p className="px-3 py-3 text-sm text-muted-foreground">
              一致するページ・品番が見つかりませんでした。
            </p>
          )}
          <ul className="max-h-80 divide-y divide-border/60 overflow-y-auto">
            {hits.map((h, i) => (
              <li key={`${h.kind}-${i}`}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(hitHref(h))}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors',
                    i === active ? 'bg-accent' : 'hover:bg-accent/60'
                  )}
                >
                  {h.kind === 'page' && <BookOpen className="size-4 shrink-0 text-muted-foreground" />}
                  {h.kind === 'product' && <Package className="size-4 shrink-0 text-muted-foreground" />}
                  {h.kind === 'keyword' && <Tag className="size-4 shrink-0 text-muted-foreground" />}
                  <span className="min-w-0 flex-1 truncate">
                    {h.kind === 'page' && (
                      <>
                        <span className="num font-semibold">{h.page.page}ページ</span>
                        <span className="ml-2 text-muted-foreground">{h.page.title}</span>
                      </>
                    )}
                    {h.kind === 'product' && (
                      <>
                        <span className="font-medium">{h.product.sku}</span>
                        <span className="ml-2 text-muted-foreground">{h.product.group}</span>
                      </>
                    )}
                    {h.kind === 'keyword' && (
                      <>
                        <span className="font-medium">{h.word}</span>
                        <span className="ml-2 text-muted-foreground">誌面 {h.pages.slice(0, 4).join('・')}
                          {h.pages.length > 4 ? ' ほか' : ''} ページ</span>
                      </>
                    )}
                  </span>
                  {h.kind === 'page' && (
                    <span className="num shrink-0 text-xs text-muted-foreground">{h.count}件</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
