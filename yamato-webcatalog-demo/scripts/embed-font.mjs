/**
 * サブセット済み woff2 を data URI の @font-face として globals.css に埋め込む。
 *
 * 単一HTML版は file:// から開く1ファイル配布のため、url('/fonts/x.woff2') のような
 * 外部参照ではフォントが読めない。両版で同じ CSS を使うため data URI にする。
 * （欧文のみのサブセットなので Sans 24KB / Mono 19KB 程度に収まる）
 *
 * 使い方: node scripts/embed-font.mjs
 */
import { readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CSS = resolve(root, 'src/styles/globals.css')

const BEGIN = '/* == BEGIN embedded fonts (scripts/embed-font.mjs が生成・直接編集しないこと) == */'
const END = '/* == END embedded fonts == */'

const FONTS = [
  { family: 'Geist', file: 'assets-src/fonts/GeistSans.woff2' },
  { family: 'Geist Mono', file: 'assets-src/fonts/GeistMono.woff2' },
]

const faces = []
for (const f of FONTS) {
  const buf = await readFile(resolve(root, f.file))
  faces.push(
    `@font-face {\n` +
      `  font-family: '${f.family}';\n` +
      `  font-style: normal;\n` +
      `  font-weight: 100 900;\n` + // Variable フォントなので全ウェイトを1ファイルで賄う
      `  font-display: swap;\n` +
      `  src: url(data:font/woff2;base64,${buf.toString('base64')}) format('woff2');\n` +
      `}`
  )
  console.log(`  ${f.family}: ${(buf.length / 1024).toFixed(1)} KB → base64 ${((buf.length * 4) / 3 / 1024).toFixed(1)} KB`)
}

const block = [
  BEGIN,
  '/* Geist / Geist Mono — Copyright (c) 2023 Vercel, in collaboration with basement.studio',
  '   SIL Open Font License 1.1（全文: docs/licenses/geist-font-LICENSE.txt）',
  '   和文は収録していないため、日本語はシステムフォントにフォールバックする。 */',
  ...faces,
  END,
].join('\n')

let css = await readFile(CSS, 'utf8')
if (css.includes(BEGIN)) {
  const s = css.indexOf(BEGIN)
  const e = css.indexOf(END) + END.length
  css = css.slice(0, s) + block + css.slice(e)
} else {
  // @tailwind の後ろに挿入する（@font-face は base レイヤーより前で問題ない）
  css = css.replace('@tailwind utilities;', '@tailwind utilities;\n\n' + block)
}
await writeFile(CSS, css, 'utf8')
console.log('globals.css に @font-face を埋め込みました')
