/* Playwright で A4横PDF を書き出す。 */
import { chromium } from 'playwright';

// ローカルにChromiumが無い環境向けのフォールバック
const EXEC = process.env.CHROME_PATH || undefined;
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:url';
import path from 'node:path';

const file = path.resolve('dist/proposal-deck.html');
if (!existsSync(file)) { console.error('dist/proposal-deck.html がありません。`npm run bundle` を先に実行してください。'); process.exit(1); }

const outDir = 'out';
if (!existsSync(outDir)) mkdirSync(outDir);
const out = path.join(outDir, 'Webカタログ構築のご提案書_スタジオスプーン.pdf');

const browser = await chromium.launch(EXEC ? { executablePath: EXEC } : {});
const page = await browser.newPage();
await page.goto('file://' + file, { waitUntil: 'networkidle' });
await page.emulateMedia({ media: 'print' });
await page.waitForTimeout(1200);

await page.pdf({
  path: out,
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
});

await browser.close();
console.log(`✓ PDFを書き出しました: ${out}`);
