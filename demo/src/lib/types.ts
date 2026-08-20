/** 商品カテゴリー（紙カタログの章に対応） */
export type CategoryId = 'film' | 'plastic-bottle' | 'glass-bottle' | 'liquor' | 'cap' | 'other'

/** 容量の表記種別。OF＝満量容量（誌面の Catalog Guide に準拠） */
export type CapacityType = 'net' | 'overflow' | 'unknown'

/** 容器形状。胴サイズ表記から機械的に判定する */
export type Shape = 'round' | 'square' | 'oval' | 'hex' | 'freeform' | 'unknown'

/** リサイクルマーク刻印。中身によって法令で決まる＝選定の必須条件（提案書 2-2） */
export type RecycleMark = 'yes' | 'no' | 'option' | 'unknown'

/** 誌面ノンブルとの対応の確度。推測で断定しないための項目 */
export type PageConfidence = 'high' | 'medium' | 'low' | 'unresolved'

export interface Product {
  sku: string
  slug: string
  category: CategoryId
  group: string
  series: string | null
  variantGroup: string | null
  isOriginal: boolean
  /** true = デモ用に生成した架空データ（画面上に明示する） */
  isDemo: boolean
  /** 社内アカウントのみ表示（提案書 8-4） */
  maker: string | null
  makerUrl: string | null

  capacityMl: number | null
  capacityType: CapacityType
  capacityLabel: string | null

  mouthLabel: string | null
  mouthTypes: string[]

  weightG: number | null
  weightLabel: string | null
  perCase: number | null
  perCaseLabel: string | null
  material: string
  heatResistC: number | null
  heatResistLabel: string
  icons: string[]
  note: string | null

  bodySizeLabel: string | null
  shape: Shape
  bodyW: number | null
  bodyD: number | null
  heightMm: number | null
  labelHeightMm: number | null

  recycleMark: RecycleMark
  catalogPages: number[]
  pageConfidence: PageConfidence
  photoStatus: string | null
  /** 提案書 4-1 の Web 移行対象範囲に入るか */
  inScope: boolean
}

export interface CatalogPage {
  page: number
  title: string
  file: string
  category: CategoryId
  inScope: boolean
}

export interface DataIssue {
  sku: string
  field: string
  value: string | null
  note: string
}

export interface Dataset {
  generatedFrom: string
  catalogPageCount: number
  products: Product[]
  pages: CatalogPage[]
  keywords: Record<string, number[]>
  issues: DataIssue[]
}
