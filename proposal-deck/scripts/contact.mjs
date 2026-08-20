/* 全スライドの一覧（コンタクトシート）をPNGで書き出す */
import { chromium } from 'playwright';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const EXEC = process.env.CHROME_PATH || undefined;
const file = path.resolve('dist/proposal-deck.html');
if (!existsSync('out')) mkdirSync('out');
const browser = await chromium.launch(EXEC ? { executablePath: EXEC } : {});
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto('file://' + file, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.addStyleTag({ content: `
  body { background:#c9ced4; }
  .deck { display:grid !important; grid-template-columns: repeat(4, 297mm); gap: 6mm; padding: 6mm; width: max-content; }
  .slide { box-shadow: 0 0 0 0.3mm #9aa3ad; }
  .toolbar { display:none; }
` });
await page.waitForTimeout(400);
const el = page.locator('.deck');
const box = await el.boundingBox();
await page.setViewportSize({ width: Math.ceil(box.width / 4.2), height: 1000 });
await page.evaluate(() => { document.body.style.zoom = '0.238'; });
await page.waitForTimeout(600);
await page.locator('body').screenshot({ path: 'out/contact-sheet.png' });
await browser.close();
console.log('✓ out/contact-sheet.png');
