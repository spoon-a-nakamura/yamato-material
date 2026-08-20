/**
 * 単一HTMLファイル版のビルド。
 * ・JS / CSS / 商品データをすべて1ファイルにインライン化する
 * ・ハッシュルーターなので file:// から直接開ける（メール添付・USB配布が可能）
 * ・Next.js 版と同じ src/ のコンポーネントを共有しているため、実装は二重にならない
 */
import { build } from 'esbuild'
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'
import tailwind from 'tailwindcss'
import autoprefixer from 'autoprefixer'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'dist-standalone')
const tmp = resolve(outDir, '.tmp')

await rm(outDir, { recursive: true, force: true })
await mkdir(tmp, { recursive: true })

/* ---- JS ---- */
const js = await build({
  entryPoints: [resolve(root, 'standalone/main.tsx')],
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020'],
  jsx: 'automatic',
  loader: { '.json': 'json' },
  define: { 'process.env.NODE_ENV': '"production"' },
  alias: { '@': resolve(root, 'src') },
  external: [],
  write: false,
  // globals.css は PostCSS 側で処理するため、JS バンドルからは切り離す
  plugins: [
    {
      name: 'strip-css-import',
      setup(b) {
        b.onResolve({ filter: /\.css$/ }, () => ({ path: 'virtual:css', namespace: 'noop' }))
        b.onLoad({ filter: /.*/, namespace: 'noop' }, () => ({ contents: '', loader: 'js' }))
      },
    },
  ],
})
const jsCode = js.outputFiles[0].text

/* ---- CSS ---- */
const cssSrc = await readFile(resolve(root, 'src/styles/globals.css'), 'utf8')
const cssResult = await postcss([
  tailwind({ config: resolve(root, 'tailwind.config.ts') }),
  autoprefixer(),
]).process(cssSrc, { from: resolve(root, 'src/styles/globals.css') })

// 最小化（コメント・余分な空白の除去）
const css = cssResult.css
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s*\n\s*/g, '\n')
  .replace(/\n{2,}/g, '\n')

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>ヤマトマテリアル Webカタログ（デモ）</title>
<style>${css}</style>
</head>
<body>
<div id="root"></div>
<script>${jsCode}</script>
</body>
</html>
`

await mkdir(outDir, { recursive: true })
await writeFile(resolve(outDir, 'yamato-webcatalog-demo.html'), html, 'utf8')
await rm(tmp, { recursive: true, force: true })

const kb = (n) => `${(n / 1024).toFixed(0)} KB`
console.log('単一HTML版を書き出しました: dist-standalone/yamato-webcatalog-demo.html')
console.log(`  CSS ${kb(css.length)} / JS ${kb(jsCode.length)} / 合計 ${kb(html.length)}`)
