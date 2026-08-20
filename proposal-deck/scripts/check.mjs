/* 各スライドの内容が版面から溢れていないかを検査する。 */
import { chromium } from 'playwright';

// ローカルにChromiumが無い環境向けのフォールバック
const EXEC = process.env.CHROME_PATH || undefined;
import path from 'node:path';
import { existsSync } from 'node:fs';

const file = path.resolve('dist/proposal-deck.html');
if (!existsSync(file)) { console.error('dist/proposal-deck.html がありません。'); process.exit(1); }

const browser = await chromium.launch(EXEC ? { executablePath: EXEC } : {});
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto('file://' + file, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

const report = await page.evaluate(() => {
  const slides = [...document.querySelectorAll('.slide')];
  return slides.map((s, i) => {
    const body = s.querySelector('.slide__body');
    const title = s.querySelector('.slide__title')?.textContent
      || s.querySelector('.section__title')?.textContent
      || s.querySelector('.cover__title')?.textContent
      || '(無題)';
    const no = s.querySelector('.slide__no')?.textContent || '';
    const over = body ? body.scrollHeight - body.clientHeight : 0;
    let fill = 1;
    if (body && body.clientHeight) {
      const kids = [...body.children];
      const top = kids.length ? Math.min(...kids.map(k => k.offsetTop)) : 0;
      const bottom = kids.length ? Math.max(...kids.map(k => k.offsetTop + k.offsetHeight)) : 0;
      fill = (bottom - top) / body.clientHeight;
    }
    const centered = s.classList.contains('slide--center');
    const slideOver = s.scrollHeight - s.clientHeight;
    return { page: i + 1, no, title: title.trim().slice(0, 40), over, slideOver, fill, centered };
  });
});

let bad = 0;
for (const r of report) {
  const flag = r.over > 1 || r.slideOver > 1;
  if (flag) bad++;
  console.log(
    `${String(r.page).padStart(3, '0')}  ${flag ? '⚠ 溢れ' : '  OK  '}  ${(r.no + ' ' + r.title).padEnd(46)}` +
    (flag ? `  body+${r.over}px slide+${r.slideOver}px` : `  fill ${(r.fill * 100).toFixed(0)}%${r.centered ? ' [center]' : ''}${r.fill < 0.62 && !r.centered ? ' ← center候補' : ''}`)
  );
}
console.log(`\n合計 ${report.length} ページ / 溢れ ${bad} ページ`);
await browser.close();
process.exit(bad > 0 ? 1 : 0);
