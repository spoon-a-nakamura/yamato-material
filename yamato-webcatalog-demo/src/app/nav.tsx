'use client'
import * as React from 'react'

/**
 * ルーティングの抽象化レイヤー。
 * ─ Next.js（本番想定）：実URL（/products/xxx/）で動く NextNavProvider
 * ─ 単一HTML版（配布・持ち運び用）：ハッシュURL（#/products/xxx）で動く HashNavProvider
 * 画面側はこの useNav() / <Link> だけを使うため、両方を同一コードで共有できる。
 */
export interface NavApi {
  /** 例: '/products' 'products/ydr-300' → 常に先頭スラッシュ付き・末尾スラッシュ無しに正規化 */
  path: string
  query: URLSearchParams
  push: (href: string) => void
  replace: (href: string) => void
  href: (to: string) => string
}

const NavContext = React.createContext<NavApi | null>(null)

export function useNav(): NavApi {
  const v = React.useContext(NavContext)
  if (!v) throw new Error('useNav must be used inside a Nav provider')
  return v
}

export const normalizePath = (p: string) => {
  const s = ('/' + p).replace(/\/{2,}/g, '/').replace(/\/+$/, '')
  return s === '' ? '/' : s
}

export function splitHref(href: string): { path: string; query: URLSearchParams } {
  const [p, q = ''] = href.split('?')
  return { path: normalizePath(p), query: new URLSearchParams(q) }
}

/* ------------------------------------------------------------------ */
/* 単一HTML版：ハッシュルーター                                        */
/* ------------------------------------------------------------------ */
export function HashNavProvider({ children }: { children: React.ReactNode }) {
  const read = () => (typeof window === 'undefined' ? '/' : window.location.hash.replace(/^#/, '') || '/')
  const [raw, setRaw] = React.useState(read)

  React.useEffect(() => {
    const on = () => setRaw(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  const api = React.useMemo<NavApi>(() => {
    const { path, query } = splitHref(raw)
    return {
      path,
      query,
      href: (to) => '#' + normalizePath(to.split('?')[0]) + (to.includes('?') ? '?' + to.split('?')[1] : ''),
      push: (to) => { window.location.hash = to },
      replace: (to) => { window.history.replaceState(null, '', '#' + to); setRaw(to) },
    }
  }, [raw])

  React.useEffect(() => { window.scrollTo({ top: 0 }) }, [api.path])

  return <NavContext.Provider value={api}>{children}</NavContext.Provider>
}

/* ------------------------------------------------------------------ */
/* Next.js 版：実URL                                                   */
/* ------------------------------------------------------------------ */
export function NavProvider({ value, children }: { value: NavApi; children: React.ReactNode }) {
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>
}

/* ------------------------------------------------------------------ */
/* リンク                                                              */
/* ------------------------------------------------------------------ */
export const Link = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>(({ href, onClick, ...props }, ref) => {
  const nav = useNav()
  return (
    <a
      ref={ref}
      href={nav.href(href)}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        if (nav.href(href).startsWith('#')) return // ハッシュ版はブラウザ既定に任せる
        e.preventDefault()
        nav.push(href)
      }}
      {...props}
    />
  )
})
Link.displayName = 'Link'
