import { CATEGORY_LABEL, dataset, pageByNumber, productBySlug, productsByPage } from './catalog'

/**
 * 画面ごとの <title> / description の定義。
 *
 * Next.js 版（各ルートの generateMetadata）と単一HTML版（document.title の更新）で
 * 同じ定義を使うため、ここに1箇所だけ持つ。nav.tsx でルーターを抽象化しているのと同じ考え方。
 *
 * なお本デモは検索エンジンに載せない前提（layout.tsx の robots: noindex）だが、
 * タイトルはブラウザのタブ・ブックマーク・履歴に出るため、画面ごとに固有にしている。
 * 複数ページを開いて見比べる使い方（提案書 8-6）でタブが判別できないと困るため。
 */
export interface PageMeta {
  /** <title> にそのまま入る完全な文字列 */
  title: string
  description: string
}

export const SITE_NAME = 'ヤマトマテリアル Webカタログ（デモ）'

const withSite = (name: string) => `${name}｜${SITE_NAME}`

const HOME: PageMeta = {
  title: SITE_NAME,
  description:
    `紙カタログのページ数から商品を引けるWebカタログのデモです。誌面${dataset.catalogPageCount}ページ・` +
    `${dataset.products.length}SKUを収録し、容量・口の形・材質での絞り込み、簡易図面の表示、` +
    `検討リストでの比較に対応しています。`,
}

const STATIC: Record<string, PageMeta> = {
  '/': HOME,
  '/contents': {
    title: withSite('目次'),
    description:
      `紙カタログ全${dataset.catalogPageCount}ページの章立てです。` +
      `目次のページ番号から、そのページに掲載されている商品の一覧を開けます。`,
  },
  '/products': {
    title: withSite('商品一覧'),
    description:
      `収録${dataset.products.length}SKUを容量・口の形・材質・耐熱温度で絞り込み、` +
      `仕様を横並びで比較できます。誌面のカテゴリーや容量帯での並べ替えにも対応しています。`,
  },
  '/shortlist': {
    title: withSite('検討リスト'),
    description:
      '検討中の候補を横並びで比較し、簡易図面をまとめて印刷できます。' +
      '次回のお電話のときに、同じ一覧を呼び出して続きから相談できます。',
  },
  '/about': {
    title: withSite('このデモについて'),
    description:
      '実データとデモ用の架空データの区分、データ変換で検出した確認事項をまとめています。',
  },
}

/**
 * パスから画面のタイトル・説明を返す。
 * path は先頭スラッシュ付き・末尾スラッシュ無しの正規化済みを想定（nav.ts の path と同じ形式）。
 */
export function pageMeta(path: string): PageMeta {
  const p = path.replace(/\/+$/, '') || '/'

  const fixed = STATIC[p]
  if (fixed) return fixed

  const pg = p.match(/^\/page\/(\d+)$/)
  if (pg) {
    const n = Number(pg[1])
    const page = pageByNumber.get(n)
    if (!page) return { title: withSite(`${n}ページ`), description: HOME.description }
    const count = productsByPage.get(n)?.length ?? 0
    return {
      title: withSite(`${n}ページ ${page.title}`),
      description:
        count > 0
          ? `紙カタログ${n}ページ「${page.title}」に掲載の${count}件です。容量・口部・材質・耐熱温度を横並びで確認できます。`
          : `紙カタログ${n}ページ「${page.title}」です。このページの商品データはまだ登録されていません。`,
    }
  }

  const prod = p.match(/^\/products\/(.+)$/)
  if (prod) {
    const item = productBySlug.get(prod[1])
    if (!item) return HOME
    // capacityLabel は誌面の表に合わせた単位なしの数値なので、説明文では単位を補う。
    // OF（満量容量）は誌面の Catalog Guide 表記なので、文章では「満量」と書く
    const cap =
      item.capacityMl !== null
        ? `${item.capacityType === 'overflow' ? '満量' : ''}${item.capacityMl}㎖`
        : item.capacityLabel
    const spec = [cap, item.mouthLabel, item.material].filter(Boolean).join('／')
    return {
      title: withSite(item.sku),
      description:
        `${item.sku}（${CATEGORY_LABEL[item.category] ?? item.group}）の仕様と簡易図面です。` +
        (spec ? `${spec}。` : '') +
        (item.catalogPages.length ? `誌面${item.catalogPages.join('・')}ページ掲載。` : ''),
    }
  }

  return HOME
}
