/**
 * 画像ファイルを data URI にして src/assets/ 配下の TS モジュールとして書き出す。
 *
 * 単一HTML版は file:// から開ける1ファイル完結が要件のため、
 * <img src="/logo.png"> のような外部参照は使えない（画像が同梱されず表示されない）。
 * data URI にしておけば Next.js 版・単一HTML版のどちらも同じコードで表示できる。
 *
 * 使い方:
 *   node scripts/embed-asset.mjs <画像ファイル> <エクスポート名> [出力先モジュール名]
 * 例:
 *   node scripts/embed-asset.mjs ~/Desktop/logo.png LOGO_YAMATO logo
 */
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import { dirname, resolve, extname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const [src, exportName, moduleName] = process.argv.slice(2)
if (!src || !exportName) {
  console.error('使い方: node scripts/embed-asset.mjs <画像ファイル> <エクスポート名> [モジュール名]')
  process.exit(1)
}

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
}

const ext = extname(src).toLowerCase()
const mime = MIME[ext]
if (!mime) {
  console.error(`対応していない拡張子です: ${ext}（対応: ${Object.keys(MIME).join(' ')}）`)
  process.exit(1)
}

const buf = await readFile(resolve(src))
const dataUri = `data:${mime};base64,${buf.toString('base64')}`

const outName = moduleName ?? basename(src, ext)
const outPath = resolve(root, 'src/assets', `${outName}.ts`)
await mkdir(dirname(outPath), { recursive: true })

const body = `// このファイルは scripts/embed-asset.mjs が生成しています。直接編集しないでください。
// 元ファイル: ${basename(src)}（${mime} / ${(buf.length / 1024).toFixed(1)} KB）
//
// 単一HTML版（file:// から開く1ファイル配布）でも表示できるよう data URI で持っています。
// 差し替える場合は次のコマンドを実行してください:
//   node scripts/embed-asset.mjs <新しい画像> ${exportName} ${outName}

export const ${exportName} =
  '${dataUri}'
`

await writeFile(outPath, body, 'utf8')

const { size } = await stat(outPath)
console.log(`書き出しました: src/assets/${outName}.ts`)
console.log(`  元画像 ${(buf.length / 1024).toFixed(1)} KB → モジュール ${(size / 1024).toFixed(1)} KB（base64 で約1.33倍）`)
