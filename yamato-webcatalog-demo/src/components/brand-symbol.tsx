/**
 * ヤマトマテリアルのシンボルマーク。
 *
 * 支給SVG（assets-src/symbol.svg）のパスをそのまま持つ。
 * ロゴ画像（src/assets/logo.ts）は data URI で色を変えられないが、
 * こちらは装飾として濃度や色を変えて使うため、インラインSVGにして
 * fill を currentColor にしている（呼び出し側の text-* で色が決まる）。
 *
 * 元ファイルの clipPath は viewBox と同じ矩形で実際には何も切っていないため省いた。
 * 元ファイルの path 側 opacity="0.8" も、濃度は呼び出し側で決めるので持たせていない。
 */
export function BrandSymbol({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 632 550"
      className={className}
      fill="currentColor"
      aria-hidden
      focusable="false"
    >
      <path d="M194.8 550H431.6C446.1 417.7 484.8 316.1 564.7 243.9C586.4 224.2 607.9 205.1 631.3 186.7L522.8 2.5C443.6 56.6 350.9 166.5 310.7 258.9C264.1 157.4 202 51.6 103.5 0C103.5 0 2.5 180.4 0 186.7C125.5 276.2 173 382.1 194.8 550Z" />
    </svg>
  )
}
