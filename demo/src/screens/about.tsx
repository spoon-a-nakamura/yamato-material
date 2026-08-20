'use client'
import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Notice, SectionTitle } from '@/components/bits'
import { dataIssues, dataset } from '@/lib/catalog'

/**
 * デモの前提・データの出典・確認事項を1画面にまとめる。
 * 「実データ」と「デモ用の架空データ」を混ぜたまま客先に出さないための頁。
 */
export function AboutScreen() {
  const real = dataset.products.filter((p) => !p.isDemo)
  const demo = dataset.products.filter((p) => p.isDemo)

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-20">
      <h1 className="text-xl font-bold tracking-tight">このデモサイトについて</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        こちらのサイトは「Webカタログ構築のご提案書」に記載した機能を、管理画面無しの仮想環境で再現した仕上がりイメージ確認用のデモです。
      </p>

      <SectionTitle className="mt-8" sub="画面上でも「デモデータ」バッジで区別しています">データの出典</SectionTitle>
      <div className="overflow-hidden rounded-md border">
        <table className="w-full text-spec">
          <thead className="bg-muted/80">
            <tr>
              <th className="px-3 py-2 text-left text-[0.6875rem] font-semibold text-muted-foreground">区分</th>
              <th className="px-3 py-2 text-right text-[0.6875rem] font-semibold text-muted-foreground">件数</th>
              <th className="px-3 py-2 text-left text-[0.6875rem] font-semibold text-muted-foreground">出典</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="px-3 py-2">実データ</td>
              <td className="num px-3 py-2 text-right font-medium">{real.length}</td>
              <td className="px-3 py-2 text-muted-foreground">仕様リスト_食品プラスチック(ボトル).xlsx（2シート）</td>
            </tr>
            <tr className="border-t">
              <td className="px-3 py-2">デモ用の架空データ <Badge variant="demo">デモデータ</Badge></td>
              <td className="num px-3 py-2 text-right font-medium">{demo.length}</td>
              <td className="px-3 py-2 text-muted-foreground">
                食品ガラスボトル・酒類・キャップ。規模感（300〜400SKU）の確認用に生成
              </td>
            </tr>
            <tr className="border-t bg-muted/40">
              <td className="px-3 py-2 font-medium">合計</td>
              <td className="num px-3 py-2 text-right font-semibold">{dataset.products.length}</td>
              <td className="px-3 py-2" />
            </tr>
            <tr className="border-t">
              <td className="px-3 py-2">誌面ページ</td>
              <td className="num px-3 py-2 text-right font-medium">{dataset.pages.length}</td>
              <td className="px-3 py-2 text-muted-foreground">現状のWebカタログを参照して作成いたしました</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Notice className="mt-3">
        メーカー名は、実データ側はxlsxの記載どおり、デモデータ側は「（デモ）A硝子」のように架空の名称にしています。
      </Notice>

      <SectionTitle className="mt-8">デモで再現していない範囲</SectionTitle>
      <ul className="list-inside list-disc space-y-1.5 text-sm leading-relaxed text-muted-foreground">
        <li>管理画面（商品データベース／CSV一括登録等）</li>
        <li>Excel・Spreadsheet の同期（提案書 10-1）</li>
        <li>共有クラウドドライブ連携（オプション④）</li>
        <li>検討リストのお客さま単位の保存</li>
        <li>詳細図面（メーカー支給図面を挿入予定）</li>
      </ul>
    </div>
  )
}
