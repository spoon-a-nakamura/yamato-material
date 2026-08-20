import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [mdx()],

  /* CSSをHTMLに埋め込み、外部アセットへの参照を持たない1枚のHTMLとして出力する。
     /proposal/ のようなサブディレクトリに置いても、file:// で直接開いても、
     パスの解決に失敗しない。デプロイ先のパスをビルド設定に持たせないための指定。 */
  build: {
    inlineStylesheets: 'always',
  },
});
