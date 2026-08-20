/* dist/index.html の外部CSSをインライン化し、単一ファイルHTMLを生成する。
   → ダブルクリックで開いて Cmd+P → A4横PDF が可能になります。 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const dist = 'dist';
const src = join(dist, 'index.html');
if (!existsSync(src)) { console.error('dist/index.html が見つかりません。先に `npm run build` を実行してください。'); process.exit(1); }

let html = readFileSync(src, 'utf8');

html = html.replace(/<link rel="stylesheet" href="([^"]+)"\s*\/?>/g, (m, href) => {
  const p = join(dist, href.replace(/^\//, ''));
  if (!existsSync(p)) return m;
  return `<style>\n${readFileSync(p, 'utf8')}\n</style>`;
});

const out = join(dist, 'proposal-deck.html');
writeFileSync(out, html);
console.log(`✓ 単一ファイルHTMLを生成しました: ${out}`);
