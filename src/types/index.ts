export interface Card {
  id: string
  name: string
  owner: string
  description: string
  maxPoints: number
  createdAt: string
  color: CardColor
  redeemedAt?: string | null
}

export interface User {
  id: string
  name: string
  avatar: string  // emoji animal
}

export interface PointLog {
  id: string
  cardId: string
  delta: number
  stampIcon: StampIcon
  operatedBy: string   // user id
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
  owner: string
  sortKey: SortKey
  sortDir: SortDir
}

export const ANIMAL_AVATARS = [
  '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼',
  '🐨','🐯','🦁','🐮','🐷','🐸','🐙','🐧',
  '🦋','🐢','🦄','🐳','🦔','🐺','🦝','🦦',
] as const
