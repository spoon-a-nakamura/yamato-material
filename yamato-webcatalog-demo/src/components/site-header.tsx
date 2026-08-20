'use client'
import * as React from 'react'
import { ClipboardList, Eye, EyeOff, Lock, Menu, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { CatalogSearch } from '@/components/catalog-search'
import { Link, useNav } from '@/app/nav'
import { DEMO_PASSCODE, useInternalMode } from '@/app/internal-mode'
import { useShortlist } from '@/app/shortlist'
import { CATEGORIES, catClasses, countByCategory } from '@/lib/catalog'
import { cn } from '@/lib/utils'

function InternalModeControl({ compact }: { compact?: boolean }) {
  const { internal, enable, disable } = useInternalMode()
  const [open, setOpen] = React.useState(false)
  const [pass, setPass] = React.useState('')
  const [err, setErr] = React.useState(false)

  if (internal) {
    return (
      <Button variant="internal" size={compact ? 'default' : 'sm'} onClick={disable} className="gap-1.5">
        <Eye className="size-3.5" />
        社内モード ON
        <X className="size-3.5 opacity-60" />
      </Button>
    )
  }
  return (
    <>
      <Button variant="outline" size={compact ? 'default' : 'sm'} onClick={() => setOpen(true)} className="gap-1.5">
        <EyeOff className="size-3.5" />
        社内モード
      </Button>
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); setErr(false); setPass('') }}>
        <DialogContent className="max-w-md">
          <DialogTitle className="flex items-center gap-2">
            <Lock className="size-4 text-internal" />
            社内モードに切り替える
          </DialogTitle>
          <DialogDescription className="mt-2 leading-relaxed">
            詳細図面とメーカー情報が表示されます。お客さまと画面を共有されている場合は切り替えないでください。
          </DialogDescription>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (enable(pass)) { setOpen(false); setPass('') } else setErr(true)
            }}
          >
            <Input
              autoFocus
              type="password"
              value={pass}
              onChange={(e) => { setPass(e.target.value); setErr(false) }}
              placeholder="社内用パスコード"
              aria-invalid={err}
              className={cn(err && 'border-destructive')}
            />
            <Button type="submit">切り替える</Button>
          </form>
          {err && <p className="mt-2 text-xs text-destructive">パスコードが一致しません。</p>}
          <p className="mt-4 rounded bg-muted px-2.5 py-2 text-xs text-muted-foreground">
            デモ用パスコードは <code className="font-mono font-semibold">{DEMO_PASSCODE}</code> です。
            本番では営業チーム共通の社内用アカウント1本で運用する想定です（個別アカウントは発行しません）。
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ShortlistButton({ compact }: { compact?: boolean }) {
  const { slugs } = useShortlist()
  return (
    <Button asChild variant={slugs.length ? 'default' : 'outline'} size={compact ? 'default' : 'sm'} className="gap-1.5">
      <Link href="/shortlist">
        <ClipboardList className="size-3.5" />
        検討リスト
        {slugs.length > 0 && (
          <span className="num ml-0.5 rounded bg-background/25 px-1.5 text-[0.6875rem] font-semibold">
            {slugs.length}
          </span>
        )}
      </Link>
    </Button>
  )
}

function CategoryNav({ onNavigate }: { onNavigate?: () => void }) {
  const nav = useNav()
  return (
    <nav className="flex flex-col gap-0.5">
      {CATEGORIES.map((c) => {
        const cc = catClasses(c.id)
        const activeCat = nav.query.get('cat') === c.id
        return (
          <Link
            key={c.id}
            href={`/products?cat=${c.id}`}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent',
              activeCat && 'bg-accent font-medium'
            )}
          >
            <span className={cn('h-5 w-1.5 rounded-sm', cc.bar)} aria-hidden />
            <span className="flex-1">{c.label}</span>
            <span className="num text-xs text-muted-foreground">{countByCategory.get(c.id) ?? 0}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function SiteHeader() {
  const [menu, setMenu] = React.useState(false)
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 no-print">
      {/* カテゴリー色の帯：紙カタログの章タブと同じ色順 */}
      <div className="flex h-1">
        {CATEGORIES.map((c) => (
          <span key={c.id} className={cn('flex-1', catClasses(c.id).bar)} aria-hidden />
        ))}
      </div>

      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-3 px-3 sm:px-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenu(true)} aria-label="メニューを開く">
          <Menu />
        </Button>

        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="text-[0.9375rem] font-bold leading-tight tracking-tight">
            Yamato Material
            <span className="ml-1.5 font-medium text-muted-foreground">Webカタログ</span>
          </span>
          <Badge variant="demo" className="hidden sm:inline-flex">デモ</Badge>
        </Link>

        <div className="ml-auto hidden max-w-md flex-1 lg:block">
          <CatalogSearch />
        </div>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <div className="hidden sm:block"><InternalModeControl /></div>
          <ShortlistButton />
        </div>
      </div>

      {/* スマートフォン用の検索欄は常時表示（電話中に開いてすぐ入力できる状態） */}
      <div className="border-t px-3 py-2 lg:hidden">
        <CatalogSearch />
      </div>

      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent side="left" className="p-4">
          <SheetTitle className="mb-4 pr-8">カテゴリー</SheetTitle>
          <CategoryNav onNavigate={() => setMenu(false)} />
          <div className="mt-6 flex flex-col gap-2 border-t pt-4">
            <InternalModeControl compact />
            <Button asChild variant="ghost" className="justify-start">
              <Link href="/about" onClick={() => setMenu(false)}>このデモについて</Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}

export { CategoryNav }
