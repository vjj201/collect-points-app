export interface Card {
  id: string
  name: string
  owner: string
  description: string
  maxPoints: number
  createdAt: string
  color: CardColor
  redeemedAt?: string | null   // 已兌換日期，null = 未兌換
}

export interface PointLog {
  id: string
  cardId: string
  delta: number
  stampIcon: StampIcon
  operatedBy: string
  createdAt: string
}

export type CardColor = 'peach' | 'mint' | 'lavender' | 'butter' | 'sky'

export type StampIcon =
  | 'star' | 'heart' | 'flower' | 'sun'
  | 'moon' | 'leaf'  | 'crown'  | 'diamond'

export type FilterStatus = 'all' | 'incomplete' | 'complete' | 'redeemed'
export type SortKey = 'createdAt' | 'points'
export type SortDir = 'asc' | 'desc'

export interface FilterState {
  status: FilterStatus
  owner: string       // '' = all owners
  sortKey: SortKey
  sortDir: SortDir
}
