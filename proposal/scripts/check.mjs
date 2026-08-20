/* 各スライドの内容が版面から溢れていないか、
   およびスライド間の参照が解決できているかを検査する。 */
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
      || s.querySelector('.closing__msg')?.textContent
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

/* ---- 参照整合性 --------------------------------------------
   ページ番号は並び順で変わるため、原稿は「どのスライドを指すか」
   だけを持ちます。ここでは、その参照が実在するかを検査します。
   スライドを削除・改番したのに参照が残っている場合、ここで落ちます。 */
const links = await page.evaluate(() => {
  const slides = [...document.querySelectorAll('.deck .slide')];
  const ids = slides.map((s) => s.id);
  const dupIds = ids.filter((id, i) => id && ids.indexOf(id) !== i);

  const known = new Set();
  slides.forEach((s) => {
    if (s.id) known.add('id:' + s.id);
    if (s.dataset.no) known.add('slide:' + s.dataset.no);
    if (s.dataset.chapter) known.add('ch:' + s.dataset.chapter);
    if (s.dataset.part) known.add('part:' + s.dataset.part);
  });

  const refs = [...document.querySelectorAll('[data-ref]')].map((a) => ({
    key: a.dataset.ref,
    where: a.closest('.slide')?.dataset.page || '?',
    text: (a.textContent || '').trim().slice(0, 24),
    inAgenda: !!a.closest('.agenda'),
  }));
  const broken = refs.filter((r) => !known.has(r.key));

  // 目次に載っていない章（目次の取りこぼし）
  const inAgenda = new Set(refs.filter((r) => r.inAgenda).map((r) => r.key));
  const chapters = [...new Set(slides.map((s) => s.dataset.chapter).filter(Boolean))];
  const missingFromAgenda = chapters.filter((c) => !inAgenda.has('ch:' + c));

  // 安定IDを持たないスライド（並べ替えでアンカーが変わってしまう）
  const unstable = slides
    .map((s, i) => ({ page: i + 1, id: s.id }))
    .filter((s) => s.id.startsWith('slide-index-'));

  return { dupIds: [...new Set(dupIds)], total: refs.length, broken, missingFromAgenda, unstable };
});

console.log('── 参照整合性 ──');
console.log(`参照 ${links.total} 件`);
let linkBad = 0;
if (links.broken.length) {
  linkBad += links.broken.length;
  console.log(`⚠ 解決できない参照 ${links.broken.length} 件:`);
  links.broken.forEach((b) => console.log(`   p${b.where}  ${b.key}  「${b.text}」`));
} else {
  console.log('✓ すべての参照が解決できました');
}
if (links.dupIds.length) {
  linkBad += links.dupIds.length;
  console.log(`⚠ IDの重複: ${links.dupIds.join(', ')}`);
}
if (links.missingFromAgenda.length) {
  console.log(`△ 目次に載っていない章: ${links.missingFromAgenda.join(', ')}`);
}
if (links.unstable.length) {
  console.log(`△ 安定IDを持たないスライド（並べ替えでアンカーが変わります）:`);
  links.unstable.forEach((u) => console.log(`   p${u.page}  ${u.id}`));
}
console.log('');

/* ---- デモへのリンク ----------------------------------------
   URLは deck.config.ts の demoUrl から組み立てています。
   相対パスは公開サイト上でしか解決できないため、PDF配布時に
   絶対URLへ差し替え忘れていないかをここで検出します。 */
const demo = await page.evaluate(() => {
  const links = [...document.querySelectorAll('[data-demo]')];
  return links.map((a) => ({
    パス: a.dataset.demo,
    href: a.getAttribute('href'),
    ページ: a.closest('.slide')?.dataset.page || '?',
    文言: (a.textContent || '').trim().slice(0, 26),
  }));
});

/* ---- 参照先の意味的な照合 ------------------------------------
   解決できるかどうかではなく、指している先が正しいかを検査する。
   キーの種別と遷移先の属性、表示しているページ番号と実ページ、
   文言の「第N章」と遷移先の章、目次の文言と章タイトルを突き合わせる。 */
const semantic = await page.evaluate(() => {
  const slides = [...document.querySelectorAll('.deck .slide')];
  const chTitle = {}, partTitle = {};
  slides.forEach((s) => {
    if (s.dataset.chapter && !(s.dataset.chapter in chTitle))
      chTitle[s.dataset.chapter] = (s.querySelector('.slide__chapter-label span')?.textContent || '').trim();
    if (s.dataset.part)
      partTitle[s.dataset.part] = (s.querySelector('.section__title')?.textContent || '').trim();
  });
  const errors = [];
  document.querySelectorAll('[data-ref]').forEach((a) => {
    const key = a.dataset.ref;
    const href = a.getAttribute('href') || '';
    const target = href ? document.getElementById(href.slice(1)) : null;
    const where = a.closest('.agenda') ? '目次' : ('p' + (a.closest('.slide')?.dataset.page || '?'));
    if (!target) return;   // 解決不能は上の検査で報告済み
    const [kind, val] = key.split(':');
    if (kind === 'ch' && target.dataset.chapter !== val)
      errors.push(`${where} ${key}: 遷移先の章が ${target.dataset.chapter}`);
    if (kind === 'part' && target.dataset.part !== val)
      errors.push(`${where} ${key}: 遷移先のPARTが ${target.dataset.part}`);
    if (kind === 'slide' && target.dataset.no !== val)
      errors.push(`${where} ${key}: 遷移先の no が ${target.dataset.no}`);
    const shown = (a.querySelector('.agenda__page, .xref__page')?.textContent || '').trim();
    if (shown && Number(shown) !== Number(target.dataset.page))
      errors.push(`${where} ${key}: 表示P ${shown} ≠ 実P ${target.dataset.page}`);
    const label = (a.querySelector('.agenda__t, .agenda__part-t')?.textContent || a.textContent || '').trim();
    const m = label.match(/第(\d+)章/);
    if (m && target.dataset.chapter !== m[1])
      errors.push(`${where} 文言「第${m[1]}章」→ 遷移先は第${target.dataset.chapter}章`);
    if (a.closest('.agenda') && kind === 'ch') {
      const no = (a.querySelector('.agenda__no')?.textContent || '').trim();
      if (/^\d+$/.test(no) && Number(no) !== Number(target.dataset.chapter))
        errors.push(`目次 番号 ${no} → 遷移先は第${target.dataset.chapter}章`);
      const t = chTitle[target.dataset.chapter] || '';
      const st = (a.querySelector('.agenda__t')?.firstChild?.textContent || '').trim();
      if (t && st && t !== st) errors.push(`目次「${st}」≠ 章タイトル「${t}」`);
    }
    if (a.closest('.agenda') && kind === 'part') {
      const t = partTitle[target.dataset.part] || '';
      const st = (a.querySelector('.agenda__part-t')?.textContent || '').trim();
      if (t && st && t !== st) errors.push(`目次 PART「${st}」≠ 章扉「${t}」`);
    }
  });
  return errors;
});
if (semantic.length) {
  linkBad += semantic.length;
  console.log(`⚠ 参照先の不一致 ${semantic.length} 件:`);
  semantic.forEach((e) => console.log('   ' + e));
} else {
  console.log('✓ 参照先の章・PART・ページ番号・文言がすべて一致しています');
}
console.log('');

console.log('── デモへのリンク ──');
let demoBad = 0;
if (!demo.length) {
  console.log('（なし）');
} else {
  const relative = demo.filter((d) => !/^https?:\/\//.test(d.href));
  demo.forEach((d) => console.log(`  p${String(d.ページ).padStart(2, '0')}  ${d.href.padEnd(34)} 「${d.文言}」`));
  if (relative.length) {
    demoBad = relative.length;
    console.log(`\n△ ${relative.length}件が相対パスです。公開サイト上では解決しますが、`);
    console.log('  PDFやローカルHTMLからは開けません。PDFで配布する場合は');
    console.log('  deck.config.ts の demoUrl を絶対URLに書き換えてください。');
  } else {
    console.log('✓ すべて絶対URLです（PDFからも開けます）');
  }
}
console.log('');

console.log('── 版面の溢れ ──');
let bad = 0;
for (const r of report) {
  const flag = r.over > 1 || r.slideOver > 1;
  if (flag) bad++;
  console.log(
    `${String(r.page).padStart(3, '0')}  ${flag ? '⚠ 溢れ' : '  OK  '}  ${(r.no + ' ' + r.title).padEnd(46)}` +
    (flag ? `  body+${r.over}px slide+${r.slideOver}px` : `  fill ${(r.fill * 100).toFixed(0)}%${r.centered ? ' [center]' : ''}${r.fill < 0.62 && !r.centered ? ' ← center候補' : ''}`)
  );
}
console.log(`\n合計 ${report.length} ページ / 溢れ ${bad} ページ / 参照エラー ${linkBad} 件`);
console.log(`デモへのリンク ${demo.length} 件${demoBad ? `（うち相対パス ${demoBad} 件）` : ''}`);
await browser.close();
process.exit(bad > 0 || linkBad > 0 ? 1 : 0);
