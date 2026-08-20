'use client'
import * as React from 'react'
import { LayoutGrid, ListFilter, Rows3, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SelectNative } from '@/components/ui/select-native'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { FilterPanel } from '@/components/filter-panel'
import { ProductTable } from '@/components/product-table'
import { ProductCard } from '@/components/product-card'
import { CategoryBar } from '@/components/bits'
import { useNav } from '@/app/nav'
import { useShortlist } from '@/app/shortlist'
import { CATEGORIES, categoryById, products as allProducts } from '@/lib/catalog'
import { CAPACITY_BANDS } from '@/lib/format'
import {
  GROUP_OPTIONS, SORT_OPTIONS, applyFilters, countActive, emptyFilters,
  groupProducts, sortProducts, type FilterState, type GroupKey, type SortKey,
} from '@/lib/filters'
import { cn } from '@/lib/utils'

type View = 'table' | 'card'

export function ProductsScreen() {
  const nav = useNav()
  const { add, slugs } = useShortlist()

  // URL クエリを初期状態として取り込む（誌面カテゴリー・容量帯からの遷移）
  const initial = React.useMemo<FilterState>(() => {
    const cat = nav.query.get('cat')
    const band = nav.query.get('band')
    const q = nav.query.get('q') ?? ''
    return {
      ...emptyFilters,
      categories: cat && CATEGORIES.some((c) => c.id === cat) ? [cat as FilterState['categories'][number]] : [],
      bands: band && CAPACITY_BANDS.some((b) => b.id === band) ? [band] : [],
      q,
    }
  }, [nav.query])

  const [filters, setFilters] = React.useState<FilterState>(initial)
  React.useEffect(() => setFilters(initial), [initial])

  const [sort, setSort] = React.useState<SortKey>('default')
  const [group, setGroup] = React.useState<GroupKey>('group')
  const [view, setView] = React.useState<View>('table')
  const [drawer, setDrawer] = React.useState(false)

  const result = React.useMemo(
    () => sortProducts(applyFilters(allProducts, filters), sort),
    [filters, sort]
  )
  const groups = React.useMemo(() => groupProducts(result, group), [result, group])
  const active = countActive(filters)
  const catDef = filters.categories.length === 1 ? categoryById(filters.categories[0]) : undefined
  const unpicked = result.filter((p) => !slugs.includes(p.slug)).map((p) => p.slug)

  return (
    <div className="mx-auto flex max-w-[1400px] gap-6 px-3 py-5 sm:px-4">
      {/* ---------- 絞り込み（PC：常時表示 / SP：ドロワー） ---------- */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-[4.25rem] max-h-[calc(100vh-5.5rem)] overflow-y-auto pr-1">
          <FilterPanel value={filters} onChange={setFilters} />
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="mb-3">
          <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight">
            {catDef && <CategoryBar id={catDef.id} className="h-5" />}
            {catDef ? catDef.label : '商品一覧'}
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            <span className="num font-medium text-foreground">{result.length}</span> 件
            {filters.scopeOnly && '（Web移行対象範囲のみ）'}
            {filters.q && <> ／ キーワード「{filters.q}」</>}
          </p>
        </header>

        {/* ツールバー */}
        <div className="sticky top-[3.6rem] z-20 -mx-3 mb-3 flex flex-wrap items-center gap-2 border-b bg-background/95 px-3 py-2 backdrop-blur sm:-mx-4 sm:px-4 lg:top-[3.6rem] no-print">
          <Sheet open={drawer} onOpenChange={setDrawer}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <ListFilter />
                絞り込み
                {active > 0 && <Badge variant="solid">{active}</Badge>}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-4">
              <SheetTitle className="mb-3 pr-8">絞り込み</SheetTitle>
              <div className="-mx-1 flex-1 overflow-y-auto px-1">
                <FilterPanel value={filters} onChange={setFilters} />
              </div>
              <Button className="mt-3 w-full" onClick={() => setDrawer(false)}>
                <span className="num">{result.length}</span> 件を表示
              </Button>
            </SheetContent>
          </Sheet>

          <SelectNative
            aria-label="まとめ方"
            value={group}
            onChange={(e) => setGroup(e.target.value as GroupKey)}
          >
            {GROUP_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
          </SelectNative>

          <SelectNative
            aria-label="並び替え"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            {SORT_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
          </SelectNative>

          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && setView(v as View)}
            className="ml-auto"
            aria-label="表示形式"
          >
            <ToggleGroupItem value="table" aria-label="比較表で表示"><Rows3 />表</ToggleGroupItem>
            <ToggleGroupItem value="card" aria-label="カードで表示"><LayoutGrid />カード</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* 適用中の条件 */}
        {active > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-1.5 no-print">
            <span className="text-xs text-muted-foreground">適用中：</span>
            {filters.categories.map((c) => (
              <Chip key={c} onClear={() => setFilters({ ...filters, categories: filters.categories.filter((x) => x !== c) })}>
                {categoryById(c)?.label}
              </Chip>
            ))}
            {filters.bands.map((b) => (
              <Chip key={b} onClear={() => setFilters({ ...filters, bands: filters.bands.filter((x) => x !== b) })}>
                {CAPACITY_BANDS.find((x) => x.id === b)?.label}
              </Chip>
            ))}
            {filters.mouths.map((m) => (
              <Chip key={m} onClear={() => setFilters({ ...filters, mouths: filters.mouths.filter((x) => x !== m) })}>{m}</Chip>
            ))}
            {filters.materials.map((m) => (
              <Chip key={m} onClear={() => setFilters({ ...filters, materials: filters.materials.filter((x) => x !== m) })}>{m}</Chip>
            ))}
            {filters.heatMin !== null && (
              <Chip onClear={() => setFilters({ ...filters, heatMin: null })}>耐熱 {filters.heatMin}℃以上</Chip>
            )}
            {filters.q && <Chip onClear={() => setFilters({ ...filters, q: '' })}>「{filters.q}」</Chip>}
          </div>
        )}

        {/* 結果 */}
        <div className="space-y-6">
          {result.length > 0 && view === 'table' && (
            <>
              {/* 1つの表にまとめる：グループごとに表を分けると列幅がずれ、横並び比較が崩れる */}
              <ProductTable groups={groups} className="hidden sm:block" />
              <div className="grid gap-2 sm:hidden">
                {result.map((p) => <ProductCard key={p.slug} p={p} />)}
              </div>
            </>
          )}
          {result.length > 0 && view === 'card' && groups.map((g) => (
            <section key={g.title || 'all'}>
              {g.title && (
                <h2 className="mb-1.5 flex items-center gap-2 text-[0.8125rem] font-semibold">
                  {g.items[0] && <CategoryBar id={g.items[0].category} className="h-4" />}
                  {g.title}
                  <span className="num font-normal text-muted-foreground">{g.items.length}件</span>
                </h2>
              )}
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {g.items.map((p) => <ProductCard key={p.slug} p={p} />)}
              </div>
            </section>
          ))}
          {result.length === 0 && (
            <div className="rounded-md border border-dashed py-16 text-center">
              <p className="text-sm text-muted-foreground">条件に合う商品がありません。</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setFilters({ ...emptyFilters, scopeOnly: filters.scopeOnly })}>
                条件をクリア
              </Button>
            </div>
          )}
        </div>

        {/* 一括で検討リストへ */}
        {result.length > 0 && unpicked.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-md border bg-muted/40 p-3 no-print">
            <p className="text-xs text-muted-foreground">
              絞り込んだ結果をまとめて検討リストに入れておくと、次回のお電話でそのまま呼び出せます。
            </p>
            <Button variant="secondary" size="sm" className="ml-auto" onClick={() => add(unpicked)}>
              表示中の <span className="num">{unpicked.length}</span> 件を検討リストに追加
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

function Chip({ children, onClear }: { children: React.ReactNode; onClear: () => void }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border bg-card px-2 py-0.5 text-[0.6875rem]')}>
      {children}
      <button type="button" onClick={onClear} className="text-muted-foreground hover:text-foreground" aria-label="この条件を外す">
        <X className="size-3" />
      </button>
    </span>
  )
}
