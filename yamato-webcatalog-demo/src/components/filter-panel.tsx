'use client'
import * as React from 'react'
import { RotateCcw } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { CATEGORIES, catClasses, products as allProducts } from '@/lib/catalog'
import { CAPACITY_BANDS, ICON_LABEL, RECYCLE_LABEL, SHAPE_LABEL } from '@/lib/format'
import { countActive, emptyFilters, facetOptions, type FilterState } from '@/lib/filters'
import { cn } from '@/lib/utils'
import type { CategoryId, RecycleMark, Shape } from '@/lib/types'

/* ==================================================================
   提案書 8-1：複数の切り口で絞り込む。
   階層を浅く保つため（提案書 9-3）、すべての条件を1画面のアコーディオンに収め、
   選択肢には該当件数を出して「押しても0件」を作らない。
   ================================================================== */

function Row({
  checked, onChange, label, count, swatch,
}: { checked: boolean; onChange: () => void; label: React.ReactNode; count?: number; swatch?: string }) {
  const disabled = count === 0 && !checked
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-[0.8125rem] transition-colors hover:bg-accent/60',
        disabled && 'cursor-not-allowed opacity-40'
      )}
    >
      <Checkbox checked={checked} onCheckedChange={onChange} disabled={disabled} />
      {swatch && <span className={cn('h-3.5 w-1 shrink-0 rounded-sm', swatch)} aria-hidden />}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count !== undefined && <span className="num shrink-0 text-[0.6875rem] text-muted-foreground">{count}</span>}
    </label>
  )
}

const toggle = <T,>(arr: T[], v: T): T[] => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

const HEAT_STEPS = [60, 70, 80, 85]

export function FilterPanel({
  value, onChange, className,
}: { value: FilterState; onChange: (f: FilterState) => void; className?: string }) {
  const facets = React.useMemo(() => facetOptions(allProducts, value), [value])
  const active = countActive(value)
  const set = (patch: Partial<FilterState>) => onChange({ ...value, ...patch })

  const mouthKeys = React.useMemo(
    () => [...facets.mouths.keys()].sort((a, b) => (facets.mouths.get(b) ?? 0) - (facets.mouths.get(a) ?? 0)),
    [facets]
  )
  const materialKeys = React.useMemo(
    () => [...facets.materials.keys()].sort((a, b) => (facets.materials.get(b) ?? 0) - (facets.materials.get(a) ?? 0)),
    [facets]
  )
  const shapeKeys = React.useMemo(
    () => (['round', 'square', 'oval', 'hex', 'freeform'] as Shape[]).filter((s) => facets.shapes.has(s)),
    [facets]
  )
  const iconKeys = React.useMemo(
    () => Object.keys(ICON_LABEL).filter((k) => facets.icons.has(k)),
    [facets]
  )

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center justify-between gap-2 pb-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          絞り込み
          {active > 0 && <Badge variant="solid">{active}</Badge>}
        </h2>
        {active > 0 && (
          <Button variant="ghost" size="sm" onClick={() => onChange({ ...emptyFilters, scopeOnly: value.scopeOnly })}>
            <RotateCcw />条件をクリア
          </Button>
        )}
      </div>

      {/* 移行対象範囲：8/21 の読み合わせ用に最上段へ */}
      <label className="mb-1 flex items-start gap-2.5 rounded-md border bg-muted/50 p-2.5">
        <Switch checked={value.scopeOnly} onCheckedChange={(v) => set({ scopeOnly: v })} className="mt-0.5" />
        <span className="text-[0.8125rem] leading-snug">
          <span className="font-medium">Web移行対象範囲のみ表示</span>
          <span className="mt-0.5 block text-[0.6875rem] text-muted-foreground">
            提案書 4-1（誌面 29〜38・40〜62・65〜68ページ）
          </span>
        </span>
      </label>

      <Accordion type="multiple" defaultValue={['cat', 'cap', 'mouth']} className="w-full">
        <AccordionItem value="cat">
          <AccordionTrigger>カテゴリー</AccordionTrigger>
          <AccordionContent className="space-y-px">
            {CATEGORIES.map((c) => (
              <Row
                key={c.id}
                checked={value.categories.includes(c.id)}
                onChange={() => set({ categories: toggle(value.categories, c.id as CategoryId) })}
                label={c.label}
                swatch={catClasses(c.id).bar}
              />
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cap">
          <AccordionTrigger>容量</AccordionTrigger>
          <AccordionContent className="space-y-px">
            {CAPACITY_BANDS.map((b) => (
              <Row
                key={b.id}
                checked={value.bands.includes(b.id)}
                onChange={() => set({ bands: toggle(value.bands, b.id) })}
                label={b.label}
                count={facets.bands.get(b.id) ?? 0}
              />
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="mouth">
          <AccordionTrigger>口の形（口部）</AccordionTrigger>
          <AccordionContent className="space-y-px">
            {mouthKeys.map((m) => (
              <Row
                key={m}
                checked={value.mouths.includes(m)}
                onChange={() => set({ mouths: toggle(value.mouths, m) })}
                label={m}
                count={facets.mouths.get(m) ?? 0}
              />
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="mat">
          <AccordionTrigger>材質</AccordionTrigger>
          <AccordionContent className="space-y-px">
            {materialKeys.map((m) => (
              <Row
                key={m}
                checked={value.materials.includes(m)}
                onChange={() => set({ materials: toggle(value.materials, m) })}
                label={m}
                count={facets.materials.get(m) ?? 0}
              />
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="recycle">
          <AccordionTrigger>リサイクルマーク刻印</AccordionTrigger>
          <AccordionContent>
            <p className="mb-1.5 rounded bg-orange-50 px-2 py-1.5 text-[0.6875rem] leading-relaxed text-orange-900">
              中身によって法令で決まる選定の必須条件（提案書 2-2）。
              現行マスターに独立した列が無いため、デモでは注釈欄から判定しています。
              本番では専用の項目として持たせる想定です。
            </p>
            <div className="space-y-px">
              {(['yes', 'option', 'no', 'unknown'] as RecycleMark[]).map((r) => (
                <Row
                  key={r}
                  checked={value.recycle.includes(r)}
                  onChange={() => set({ recycle: toggle(value.recycle, r) })}
                  label={RECYCLE_LABEL[r]}
                  count={facets.recycle.get(r) ?? 0}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="heat">
          <AccordionTrigger>耐熱温度</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant={value.heatMin === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => set({ heatMin: null })}
              >
                指定なし
              </Button>
              {HEAT_STEPS.map((t) => (
                <Button
                  key={t}
                  variant={value.heatMin === t ? 'default' : 'outline'}
                  size="sm"
                  className="num"
                  onClick={() => set({ heatMin: value.heatMin === t ? null : t })}
                >
                  {t}℃以上
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="shape">
          <AccordionTrigger>形状</AccordionTrigger>
          <AccordionContent className="space-y-px">
            {shapeKeys.map((s) => (
              <Row
                key={s}
                checked={value.shapes.includes(s)}
                onChange={() => set({ shapes: toggle(value.shapes, s) })}
                label={SHAPE_LABEL[s]}
                count={facets.shapes.get(s) ?? 0}
              />
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="icon" className="border-b-0">
          <AccordionTrigger>機能（アイコン）</AccordionTrigger>
          <AccordionContent className="space-y-px">
            {iconKeys.map((i) => (
              <Row
                key={i}
                checked={value.icons.includes(i)}
                onChange={() => set({ icons: toggle(value.icons, i) })}
                label={ICON_LABEL[i]}
                count={facets.icons.get(i) ?? 0}
              />
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
