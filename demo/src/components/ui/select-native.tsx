import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * 並び替え等は OS ネイティブの select を採用。
 * 理由：スマートフォンでの操作性（Webに不慣れなお客さまが電話中に操作する想定・提案書 9-3）と
 * スクリーンリーダー互換を、独自ドロップダウンより優先する。
 */
export const SelectNative = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative inline-flex">
    <select
      ref={ref}
      className={cn(
        'h-8 appearance-none rounded-md border border-input bg-background pl-2.5 pr-7 text-xs font-medium shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
  </div>
))
SelectNative.displayName = 'SelectNative'
