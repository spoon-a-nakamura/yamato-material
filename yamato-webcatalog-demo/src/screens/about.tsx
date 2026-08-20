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
        「Webカタログ構築のご提案書」（2026年8月21日／スタジオスプーン株式会社）に記載した機能を、
        バックエンド無しのフロントエンドのみで再現した確認用のデモです。
        商品データはブラウザに同梱したJSONを読み込んでおり、サーバーとの通信は行いません。
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
              <td className="px-3 py-2 text-muted-foreground">00_ページ対応表.csv（ノンブル 1〜77）</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Notice className="mt-3">
        メーカー名は、実データ側はxlsxの記載どおり、デモデータ側は「（デモ）A硝子」のように架空の名称にしています。
        実在企業に架空の商品を紐付けないための措置です。
      </Notice>

      <SectionTitle className="mt-8" sub="推測で埋めず、確認が必要な項目として残しています">
        データ変換時に検出した確認事項（{dataIssues.length}件）
      </SectionTitle>
      <ul className="space-y-1.5">
        {dataIssues.map((i, k) => (
          <li key={k} className="rounded-md border border-orange-200 bg-orange-50/60 px-3 py-2 text-spec">
            <span className="font-medium">{i.sku}</span>
            <span className="mx-1.5 text-muted-foreground">／</span>
            <span>{i.field}</span>
            {i.value && <span className="ml-1.5 rounded bg-background px-1 font-mono text-[0.6875rem]">{i.value}</span>}
            <p className="mt-0.5 text-[0.6875rem] text-orange-900">{i.note}</p>
          </li>
        ))}
      </ul>

      <SectionTitle className="mt-8">デモで再現していない範囲</SectionTitle>
      <ul className="list-inside list-disc space-y-1.5 text-sm leading-relaxed text-muted-foreground">
        <li>管理画面（商品データベース／CSV一括登録）— バックエンドを伴うため、画面設計のみ設計書に記載</li>
        <li>Excel・Spreadsheet の同期（提案書 10-1）— 同梱JSONで代替</li>
        <li>共有クラウドドライブ連携（オプション④）— ファイル名規則の設計のみ</li>
        <li>検討リストのお客さま単位の保存 — メモリ内保持のみ（タブを閉じるとリセット）</li>
        <li>詳細図面 — メーカー支給図面が未支給のため、仕様値からの生成図で表示枠を再現</li>
      </ul>
    </div>
  )
}
