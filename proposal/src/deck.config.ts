/* ============================================================
   Deck 全体のメタ情報。ここだけ書き換えれば全ページに反映されます。
   ============================================================ */
export type DeckTheme = 'base' | 'swiss' | 'mincho' | 'tech' | 'air';

export const deck = {
  /* 意匠テーマ。この1行の差し替えで全ページの見た目が変わります。 */
  theme: 'base' as DeckTheme,

  docTitle: 'Webカタログ構築のご提案書',
  client: 'ヤマトマテリアル株式会社',
  clientHonorific: '御中',
  company: 'スタジオスプーン株式会社',
  date: '2026年8月21日',
  brandMark: 'STUDIO SPOON',
  /* ヘッダーのブランド表記のリンク先。控えめに辿れるようにするためのもの。 */
  brandUrl: 'https://studio-spoon.co.jp/works/',
  footerNote: 'Webカタログ構築のご提案書｜スタジオスプーン株式会社',

  /* ---- デモ（Webカタログ試作）の公開先 ------------------------
     絶対URLにしている。相対パス（../demo/）だと公開サイト上でしか
     解決できず、PDFやローカルHTMLから開いたときにリンクが切れるため。
     公開先が変わったらこの1行を書き換える。
     ※ このホストは https が有効でないため http のままにしている。 */
  demoUrl: 'http://yamato-material.checked.jp/demo/',

  /* 商品詳細画面へリンクするときのサンプル商品。
     実在する slug を指定します（demo/src/data/dataset.json の slug）。 */
  demoSampleProduct: 'yd-s-100',
};
