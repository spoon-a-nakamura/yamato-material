/* 指定ページのスライドをPNGに書き出す（目視確認用）。
   使い方: node scripts/shot.mjs 1 2 3   (省略時は全ページ) */
import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const EXEC = process.env.CHROME_PATH || undefined;
const file = path.resolve('dist/proposal-deck.html');
const outDir = 'out/shots';
if (!existsSync('out')) mkdirSync('out');
if (!existsSync(outDir)) mkdirSync(outDir);

const wanted = process.argv.slice(2).map(Number).filter(Boolean);

const browser = await chromium.launch(EXEC ? { executablePath: EXEC } : {});
const page = await browser.newPage({ viewport: { width: 1300, height: 900 }, deviceScaleFactor: 2 });
await page.goto('file://' + file, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

const n = await page.locator('.slide').count();
const list = wanted.length ? wanted : Array.from({ length: n }, (_, i) => i + 1);
for (const i of list) {
  if (i < 1 || i > n) continue;
  const el = page.locator('.slide').nth(i - 1);
  await el.screenshot({ path: path.join(outDir, `p${String(i).padStart(3, '0')}.png`) });
}
await browser.close();
console.log(`✓ ${list.length} 枚を ${outDir} に書き出しました（全 ${n} ページ）`);
