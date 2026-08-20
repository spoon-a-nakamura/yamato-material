import type { Config } from 'tailwindcss'

/**
 * デザインシステムの単一の情報源。
 * UI基調色・角丸・影はデジタル庁デザインシステムのトークンに準拠
 * （@digital-go-jp/design-tokens v2.0.1 / MIT。出典は globals.css の冒頭に記載）。
 * 色・角丸・影・タイポは CSS 変数（src/app 側 globals.css）で定義し、
 * ここでは「意味のある名前」だけを Tailwind に橋渡しする。
 * → 配色変更は globals.css の :root だけで完結する。
 */
const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}', './standalone/**/*.{ts,tsx,html}'],
  theme: {
    container: { center: true, padding: '1rem', screens: { '2xl': '1400px' } },
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        /** 社内限定情報の識別色（提案書 8-3 / 8-4） */
        internal: {
          DEFAULT: 'hsl(var(--internal))',
          fg: 'hsl(var(--internal-fg))',
          bg: 'hsl(var(--internal-bg))',
          border: 'hsl(var(--internal-border))',
        },
        /** 紙カタログの章タブ色を継承したカテゴリー識別色 */
        cat: {
          film: 'hsl(var(--cat-film))',
          'film-fg': 'hsl(var(--cat-film-fg))',
          'film-bg': 'hsl(var(--cat-film-bg))',
          plastic: 'hsl(var(--cat-plastic))',
          'plastic-fg': 'hsl(var(--cat-plastic-fg))',
          'plastic-bg': 'hsl(var(--cat-plastic-bg))',
          glass: 'hsl(var(--cat-glass))',
          'glass-fg': 'hsl(var(--cat-glass-fg))',
          'glass-bg': 'hsl(var(--cat-glass-bg))',
          liquor: 'hsl(var(--cat-liquor))',
          'liquor-fg': 'hsl(var(--cat-liquor-fg))',
          'liquor-bg': 'hsl(var(--cat-liquor-bg))',
          cap: 'hsl(var(--cat-cap))',
          'cap-fg': 'hsl(var(--cat-cap-fg))',
          'cap-bg': 'hsl(var(--cat-cap-bg))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      /**
       * 公式トークンの font-weight は 400 と 700 の2段階のみ。
       * 中間の太さ（500/600）は「AI生成っぽさ」の一因でもあるため、
       * クラス名は既存のまま、実際の重みだけを2段階に寄せる。
       * → コード側の font-medium / font-semibold を書き換えずに済む。
       */
      fontWeight: {
        normal: '400',
        medium: '400',
        semibold: '700',
        bold: '700',
      },
      fontSize: {
        // 仕様表の情報密度用スケール
        spec: ['0.8125rem', { lineHeight: '1.25rem' }],
        'spec-sm': ['0.75rem', { lineHeight: '1.125rem' }],
      },
      spacing: { 'row': 'var(--row-h)' },
      boxShadow: {
        /**
         * デジタル庁デザインシステムは面の階層を罫線と面色で作り、影は
         * 浮いている要素（ダイアログ・ドロワー等）にだけ使う。
         * そのため card は影を持たせず、border で輪郭を出す。
         * pop は公式 --elevation-2 に相当する値。
         */
        card: 'none',
        pop: '0 2px 12px 2px rgb(0 0 0 / 0.10), 0 1px 6px 0 rgb(0 0 0 / 0.30)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-in-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'slide-in-left': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.18s ease-out',
        'accordion-up': 'accordion-up 0.18s ease-out',
        'fade-in': 'fade-in 0.15s ease-out',
        'slide-in-right': 'slide-in-right 0.22s cubic-bezier(0.32,0.72,0,1)',
        'slide-in-left': 'slide-in-left 0.22s cubic-bezier(0.32,0.72,0,1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
