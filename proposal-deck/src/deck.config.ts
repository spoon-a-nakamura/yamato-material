/* ============================================================
   Deck 全体のメタ情報。ここだけ書き換えれば全ページに反映されます。
   ============================================================ */
export type DeckTheme = 'base' | 'swiss' | 'mincho' | 'tech' | 'air';

export const deck = {
  /* 意匠テーマ。この1行の差し替えで全ページの見た目が変わります。 */
  theme: 'air' as DeckTheme,

  docTitle: 'Webカタログ構築のご提案書',
  client: 'ヤマトマテリアル株式会社',
  clientHonorific: '御中',
  company: 'スタジオスプーン株式会社',
  author: '中村 明史',
  date: '2026年8月21日',
  brandMark: 'STUDIO SPOON',
  footerNote: 'Webカタログ構築のご提案書｜スタジオスプーン株式会社',
};
