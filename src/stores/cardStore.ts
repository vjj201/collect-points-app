import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Card, PointLog, StampIcon } from '../types'

const FAKE_CARDS: Card[] = [
  { id: '1', name: '珍珠奶茶卡', owner: '小明', description: '每次購買珍珠奶茶可獲得一點，集滿十點即可兌換免費一杯！', maxPoints: 10, createdAt: '2025-01-15', color: 'peach' },
  { id: '2', name: '早餐集點卡', owner: '小華', description: '每個工作日來用餐蓋一格，集滿八格送早餐一份。', maxPoints: 8, createdAt: '2025-02-03', color: 'mint' },
  { id: '3', name: '書店會員卡', owner: '小明', description: '每次消費滿 200 元蓋一格，集滿 12 格享九折優惠。', maxPoints: 12, createdAt: '2025-03-10', color: 'lavender' },
  { id: '4', name: '咖啡廳常客', owner: '小華', description: '每杯咖啡蓋一格，集滿六格下一杯半價。', maxPoints: 6, createdAt: '2025-03-20', color: 'butter' },
]

const FAKE_LOGS: PointLog[] = [
  { id: 'l1', cardId: '1', delta: 1, stampIcon: 'star', operatedBy: '小明', createdAt: '2025-04-01T10:00:00Z' },
  { id: 'l2', cardId: '1', delta: 1, stampIcon: 'heart', operatedBy: '小明', createdAt: '2025-04-02T11:00:00Z' },
  { id: 'l3', cardId: '1', delta: 1, stampIcon: 'flower', operatedBy: '小華', createdAt: '2025-04-03T09:30:00Z' },
  { id: 'l4', cardId: '1', delta: 1, stampIcon: 'star', operatedBy: '小明', createdAt: '2025-04-05T14:00:00Z' },
  { id: 'l5', cardId: '1', delta: 1, stampIcon: 'sun', operatedBy: '小華', createdAt: '2025-04-06T16:00:00Z' },
  { id: 'l6', cardId: '2', delta: 1, stampIcon: 'leaf', operatedBy: '小明', createdAt: '2025-04-01T08:00:00Z' },
  { id: 'l7', cardId: '2', delta: 1, stampIcon: 'moon', operatedBy: '小明', createdAt: '2025-04-03T08:15:00Z' },
  { id: 'l8', cardId: '2', delta: 1, stampIcon: 'leaf', operatedBy: '小華', createdAt: '2025-04-07T08:30:00Z' },
  { id: 'l9', cardId: '3', delta: 1, stampIcon: 'crown', operatedBy: '小明', createdAt: '2025-04-10T15:00:00Z' },
  { id: 'l10', cardId: '3', delta: 1, stampIcon: 'diamond', operatedBy: '小華', createdAt: '2025-04-12T15:00:00Z' },
]

export const useCardStore = defineStore('card', () => {
  const cards = ref<Card[]>([...FAKE_CARDS])
  const logs = ref<PointLog[]>([...FAKE_LOGS])
  const selectedCardId = ref<string>('1')

  const selectedCard = computed(() =>
    cards.value.find(c => c.id === selectedCardId.value) ?? null
  )

  function getCardPoints(cardId: string): number {
    return logs.value
      .filter(l => l.cardId === cardId)
      .reduce((sum, l) => sum + l.delta, 0)
  }

  function getCardLogs(cardId: string): PointLog[] {
    return logs.value
      .filter(l => l.cardId === cardId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  // Returns which slot index has which stamp (null = empty)
  function getCardSlots(cardId: string): (PointLog | null)[] {
    const card = cards.value.find(c => c.id === cardId)
    if (!card) return []
    const cardLogs = getCardLogs(cardId)
    const slots: (PointLog | null)[] = Array(card.maxPoints).fill(null)
    // reconstruct filled slots from logs
    let filled = 0
    for (const log of cardLogs) {
      if (log.delta === 1 && filled < card.maxPoints) {
        slots[filled] = log
        filled++
      } else if (log.delta === -1 && filled > 0) {
        filled--
        slots[filled] = null
      }
    }
    return slots
  }

  function addStamp(cardId: string, icon: StampIcon) {
    const newLog: PointLog = {
      id: `l${Date.now()}`,
      cardId,
      delta: 1,
      stampIcon: icon,
      operatedBy: '使用者',
      createdAt: new Date().toISOString(),
    }
    logs.value.push(newLog)
    return newLog
  }

  function removeStamp(cardId: string) {
    const currentPoints = getCardPoints(cardId)
    if (currentPoints <= 0) return null
    const newLog: PointLog = {
      id: `l${Date.now()}`,
      cardId,
      delta: -1,
      stampIcon: 'star',
      operatedBy: '使用者',
      createdAt: new Date().toISOString(),
    }
    logs.value.push(newLog)
    return newLog
  }

  function createCard(name: string, maxPoints: number, owner: string, description: string) {
    const colors: Card['color'][] = ['peach', 'mint', 'lavender', 'butter', 'sky']
    const newCard: Card = {
      id: `card_${Date.now()}`,
      name,
      owner,
      description,
      maxPoints,
      createdAt: new Date().toISOString().split('T')[0],
      color: colors[cards.value.length % colors.length],
    }
    cards.value.push(newCard)
    selectedCardId.value = newCard.id
    return newCard
  }

  return {
    cards,
    logs,
    selectedCardId,
    selectedCard,
    getCardPoints,
    getCardLogs,
    getCardSlots,
    addStamp,
    removeStamp,
    createCard,
  }
})
