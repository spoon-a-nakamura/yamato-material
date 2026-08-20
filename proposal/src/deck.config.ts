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
  author: '中村 明史',
  date: '2026年8月21日',
  brandMark: 'STUDIO SPOON',
  footerNote: 'Webカタログ構築のご提案書｜スタジオスプーン株式会社',

  /* ---- デモ（Webカタログ試作）の公開先 ------------------------
     デプロイ構成では以下のように並びます（.github/workflows/deployment.yaml）。
       提案書デッキ → /yamato-material/deck/
       デモ         → /yamato-material/catalog/
     そのため既定は相対パスにしています。公開サイト上ではこれで解決します。

     ⚠ PDFやローカルHTMLから開く場合、相対パスは解決できません。
       PDFで配布する際は絶対URL（例 https://example.com/yamato-material/catalog/）
       に書き換えてください。npm run check が相対パスのまま残っていれば警告します。 */
  demoUrl: '../catalog/',

  /* 商品詳細画面へリンクするときのサンプル商品。
     実在する slug を指定します（demo/src/data/dataset.json の slug）。 */
  demoSampleProduct: 'yd-s-100',
};
