export interface Card {
  id: string
  name: string
  owner: string
  description: string
  maxPoints: number
  createdAt: string
  color: CardColor
}

export interface PointLog {
  id: string
  cardId: string
  delta: number // +1 = stamp, -1 = erase
  stampIcon: StampIcon
  operatedBy: string
  createdAt: string
}

export type CardColor = 'peach' | 'mint' | 'lavender' | 'butter' | 'sky'

export type StampIcon =
  | 'star'
  | 'heart'
  | 'flower'
  | 'sun'
  | 'moon'
  | 'leaf'
  | 'crown'
  | 'diamond'
