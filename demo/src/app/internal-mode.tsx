'use client'
import * as React from 'react'

/**
 * 社内モード（提案書 8-3 / 8-4）
 * ・既定は必ず OFF ＝「お客さまに見せて安全な状態」
 * ・営業担当者さま個別のアカウントは発行しない方針のため、共有の社内用パスコード1本を想定
 * ・状態はメモリ上のみ（ブラウザに保存しない）。画面共有を終えてタブを閉じれば必ず OFF に戻る
 *   → 誤って詳細情報を表示してしまう事故の防止を、実装既定として担保する
 */
interface InternalModeApi {
  internal: boolean
  enable: (passcode: string) => boolean
  disable: () => void
}

const DEMO_PASSCODE = 'yamato'

const Ctx = React.createContext<InternalModeApi | null>(null)

export function InternalModeProvider({ children }: { children: React.ReactNode }) {
  const [internal, setInternal] = React.useState(false)
  const api = React.useMemo<InternalModeApi>(
    () => ({
      internal,
      enable: (pass) => {
        const ok = pass.trim().toLowerCase() === DEMO_PASSCODE
        if (ok) setInternal(true)
        return ok
      },
      disable: () => setInternal(false),
    }),
    [internal]
  )
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useInternalMode() {
  const v = React.useContext(Ctx)
  if (!v) throw new Error('useInternalMode must be used inside InternalModeProvider')
  return v
}

export { DEMO_PASSCODE }
