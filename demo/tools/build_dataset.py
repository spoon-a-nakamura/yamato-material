# -*- coding: utf-8 -*-
"""products.real.json + 誌面対応表 + デモ用ダミーデータ → デモサイト用 dataset"""
import csv, json, os, random, re, unicodedata

OUT = '/home/claude/work/data'
CSV_SRC = '/mnt/user-data/uploads/yamato_foods_catalog_pages/00_ページ対応表.csv'

def z2h(s): return unicodedata.normalize('NFKC', str(s)).replace('　',' ').strip()

# ---------- 誌面ページ ----------
CATEGORY_BY_PAGE = []
def cat_of(page):
    if 6 <= page <= 22: return 'film'
    if 23 <= page <= 38: return 'plastic-bottle'
    if 39 <= page <= 53: return 'glass-bottle'
    if 54 <= page <= 63: return 'liquor'
    if 64 <= page <= 72: return 'cap'
    return 'other'

# 提案書 4-1 の移行対象範囲
def in_scope(page):
    return (29 <= page <= 38) or (40 <= page <= 62) or (65 <= page <= 68)

pages = []
with open(CSV_SRC, encoding='utf-8-sig') as f:
    for r in csv.DictReader(f):
        pn = r['printed_page_number(推定)'].strip()
        if not pn.isdigit(): continue
        n = int(pn)
        pages.append(dict(
            page=n, title=r['title(目次見出し)'].strip(), file=r['filename'].strip(),
            category=cat_of(n), inScope=in_scope(n),
        ))
json.dump(pages, open(f'{OUT}/catalog-pages.json','w'), ensure_ascii=False, indent=1)

# ---------- キーワード（提案書 8-5：カテゴリー名からも同じページへ） ----------
KEYWORDS = {
 'ダイヤカット': [24], '調味料': [29,30,31,32,40,41,42,43,44,45,46],
 '広口': [33], '粉末': [33,47], 'チューブ': [35], '単層': [34], '多層': [34],
 '密封': [36], '飲料': [37,38,48], 'ペット': [29,30,31,32,37],
 'ジャム': [49,50,51,52], 'ペースト': [49,50,51,52], 'スイーツ': [53],
 'ガラス': [39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,56,57,58,59,60,61],
 'ワイン': [61], '洋雑酒': [61], '酒器': [62], '塗り物': [63],
 'キャップ': [53,64,65,66,67,68], 'ラベル': [69], '物流': [71],
 'オリジナル': [24,25,26,27,56], '小容量': [26],
}

products = json.load(open(f'{OUT}/products.real.json'))
issues = json.load(open(f'{OUT}/data-issues.json'))

# 実データ側に inScope を付与
for p in products:
    if p['category'] == 'cap':
        p['catalogPages'] = [65]; p['pageConfidence'] = 'low'
    if p['isOriginal']:
        p['catalogPages'] = []              # 支給資料から確定できないため空にする
        p['pageConfidence'] = 'unresolved'
    p['inScope'] = any(in_scope(x) for x in p['catalogPages'])

# ---------- デモ用ダミー：食品ガラスボトル / 酒類 / キャップ ----------
rnd = random.Random(20260819)
DEMO_MAKERS_GLASS = ['（デモ）A硝子','（デモ）B硝子工業','（デモ）Cガラス','（デモ）D硝子製造']
DEMO_MAKERS_CAP   = ['（デモ）Eキャップ工業','（デモ）Fクロージャー','（デモ）G製作所']

GLASS_PAGES = [
 (40,'調味料30~120㎖','調味料',(30,120),'GS'), (41,'調味料150~155㎖','調味料',(150,155),'GS'),
 (42,'調味料180~200㎖','調味料',(180,200),'GS'), (43,'調味料200~250㎖','調味料',(200,250),'GS'),
 (44,'調味料275~324㎖','調味料',(275,324),'GS'), (45,'調味料360~400㎖','調味料',(360,400),'GS'),
 (46,'調味料500~1,000㎖','調味料',(500,1000),'GS'), (47,'粉末','粉末',(90,400),'GP'),
 (48,'飲料','飲料',(180,720),'GD'), (49,'ジャム・ペーストOF30~115㎖','ジャム・ペースト',(30,115),'GJ'),
 (50,'ジャム・ペーストOF118~148㎖','ジャム・ペースト',(118,148),'GJ'),
 (51,'ジャム150~238㎖','ジャム・ペースト',(150,238),'GJ'),
 (52,'ジャム・ペーストOF250~927.5㎖','ジャム・ペースト',(250,928),'GJ'),
 (53,'スイーツ','スイーツ',(80,300),'GW'),
]
LIQUOR_PAGES = [
 (55,'プラスチック ボトル','酒類プラスチック',(180,1800),'LP','PET'),
 (56,'ガラス カップ・オリジナル','酒類ガラス（オリジナル）',(90,200),'LC','ガラス'),
 (57,'ガラス 90~275㎖','酒類ガラス',(90,275),'LG','ガラス'),
 (58,'ガラス 300~600㎖','酒類ガラス',(300,600),'LG','ガラス'),
 (59,'ガラス 720㎖','酒類ガラス',(720,720),'LG','ガラス'),
 (60,'ガラス 720~1,800㎖','酒類ガラス',(720,1800),'LG','ガラス'),
 (61,'ガラス ワイン・洋雑酒','酒類ガラス',(375,750),'LW','ガラス'),
]
CAP_PAGES = [
 (65,'プラスチックボトル用キャップ','プラスチックボトル用'), (66,'プラスチックボトル用キャップ','プラスチックボトル用'),
 (67,'ガラスボトル用キャップ','ガラスボトル用'), (68,'ガラスボトル用キャップ','ガラスボトル用'),
]
GLASS_MOUTHS = ['26.3樹脂王冠','専用キャップ','ツイストキャップ口','PPキャップ口']
def mk(sku, **kw):
    d = dict(sku=sku, series=None, variantGroup=None, isOriginal=False, isDemo=True,
             makerUrl=None, capacityType='net', mouthTypes=[], icons=[], note=None,
             shape='round', bodyW=None, bodyD=None, labelHeightMm=None,
             recycleMark='unknown', pageConfidence='high', photoStatus=None,
             weightLabel=None, perCaseLabel=None, capacityLabel=None,
             heatResistC=None, heatResistLabel='—', bodySizeLabel=None, heightMm=None,
             mouthLabel=None, perCase=None, weightG=None, capacityMl=None, material='—')
    d.update(kw); d['inScope'] = any(in_scope(x) for x in d['catalogPages'])
    return d

for page, title, group, (lo, hi), pre in GLASS_PAGES:
    n = rnd.randint(5, 8)
    caps = sorted({int(rnd.uniform(lo, hi)//5*5) or lo for _ in range(n)})
    for i, c in enumerate(caps):
        c = max(c, lo)
        shape = rnd.choice(['round','round','round','square','hex'])
        diam = round((c ** (1/3)) * 9 + rnd.uniform(-4, 6), 1)
        h = round(diam * rnd.uniform(1.4, 2.6), 1)
        mouth = rnd.choice(GLASS_MOUTHS)
        products.append(mk(
            f'{pre}-{c}-{"FRSH"[i%4]}', category='glass-bottle', group=f'{group}（ガラス）',
            maker=rnd.choice(DEMO_MAKERS_GLASS),
            capacityMl=c, capacityLabel=f'{c:,}', material='ソーダガラス',
            mouthLabel=mouth, mouthTypes=[mouth],
            weightG=round(c*rnd.uniform(0.6,1.1),1), weightLabel=None,
            perCase=rnd.choice([12,24,30,48,60,84,120]),
            heatResistC=None, heatResistLabel='—',
            bodySizeLabel=(f'Φ{diam}' if shape=='round' else (f'{diam}×{diam}（角）' if shape=='square' else f'{diam}（六角）')),
            shape=shape, bodyW=diam, bodyD=diam, heightMm=h,
            labelHeightMm=round(h*rnd.uniform(0.25,0.5),1),
            recycleMark=rnd.choice(['yes','no','no','option']),
            icons=(['gas'] if group=='飲料' and rnd.random()<0.4 else []),
            catalogPages=[page],
        ))

for page, title, group, (lo, hi), pre, mat in LIQUOR_PAGES:
    n = rnd.randint(4, 7)
    caps = sorted({int(rnd.uniform(lo, hi)//10*10) or lo for _ in range(n)})
    for i, c in enumerate(caps):
        c = max(c, lo)
        diam = round((c ** (1/3)) * 8.5 + rnd.uniform(-3, 7), 1)
        h = round(diam * rnd.uniform(1.8, 3.4), 1)
        mouth = 'ガラス用スクリュー口' if mat == 'ガラス' else 'F口'
        products.append(mk(
            f'{pre}-{c}', category='liquor', group=f'{group}',
            maker=rnd.choice(DEMO_MAKERS_GLASS),
            capacityMl=c, capacityLabel=f'{c:,}',
            material=mat, mouthLabel=mouth, mouthTypes=[mouth],
            weightG=round(c*rnd.uniform(0.5,1.0),1),
            perCase=rnd.choice([12,20,24,30,60]),
            bodySizeLabel=f'Φ{diam}', shape='round', bodyW=diam, bodyD=diam,
            heightMm=h, labelHeightMm=round(h*rnd.uniform(0.2,0.45),1),
            recycleMark=rnd.choice(['yes','no','no']),
            catalogPages=[page],
        ))

for page, title, group in CAP_PAGES:
    for i in range(rnd.randint(4, 6)):
        d = rnd.choice([18,23,28,26.3,33,38])
        products.append(mk(
            f'CAP-{int(d*10)}-{page}{i+1}', category='cap', group=group,
            maker=rnd.choice(DEMO_MAKERS_CAP),
            material=rnd.choice(['PP','PE','PP/PE','アルミ']),
            mouthLabel=f'{d}φ対応', mouthTypes=[f'{d}φ'],
            perCase=rnd.choice([1000,2000,3000,5000]),
            bodySizeLabel=f'Φ{d}', shape='round', bodyW=d, bodyD=d,
            heightMm=round(d*rnd.uniform(0.5,0.9),1),
            catalogPages=[page],
        ))

# slug 再付与（重複回避）
seen = {}
for p in products:
    base = re.sub(r'[^0-9a-zA-Z]+','-', z2h(p['sku'])).strip('-').lower() or 'sku'
    k = seen.get(base,0); seen[base]=k+1
    p['slug'] = base if k==0 else f'{base}-{k+1}'

dataset = dict(
    generatedFrom='仕様リスト_食品プラスチック(ボトル).xlsx / 00_ページ対応表.csv',
    catalogPageCount=len(pages),
    products=products, pages=pages, keywords=KEYWORDS, issues=issues,
)
json.dump(dataset, open(f'{OUT}/dataset.json','w'), ensure_ascii=False, separators=(',',':'))
json.dump(dataset, open(f'{OUT}/dataset.pretty.json','w'), ensure_ascii=False, indent=1)

from collections import Counter
print('総SKU:', len(products))
print('カテゴリー:', Counter(p['category'] for p in products))
print('実データ/デモ:', Counter('demo' if p['isDemo'] else 'real' for p in products))
print('移行対象範囲内:', sum(1 for p in products if p['inScope']))
print('bytes:', os.path.getsize(f'{OUT}/dataset.json'))
