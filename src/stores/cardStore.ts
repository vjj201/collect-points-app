import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Card, PointLog, StampIcon, FilterState, User } from '../types'

const FAKE_USERS: User[] = [
  { id: 'u1', name: '小明', avatar: '🐶' },
  { id: 'u2', name: '小華', avatar: '🐱' },
]

const FAKE_CARDS: Card[] = [
  { id: '1', name: '珍珠奶茶卡', owner: 'u1', description: '每次購買珍珠奶茶可獲得一點，集滿十點即可兌換免費一杯！', maxPoints: 10, createdAt: '2025-01-15', color: 'peach', redeemedAt: null },
  { id: '2', name: '早餐集點卡', owner: 'u2', description: '每個工作日來用餐蓋一格，集滿八格送早餐一份。', maxPoints: 8, createdAt: '2025-02-03', color: 'mint', redeemedAt: null },
  { id: '3', name: '書店會員卡', owner: 'u1', description: '每次消費滿 200 元蓋一格，集滿 12 格享九折優惠。', maxPoints: 12, createdAt: '2025-03-10', color: 'lavender', redeemedAt: null },
  { id: '4', name: '咖啡廳常客', owner: 'u2', description: '每杯咖啡蓋一格，集滿六格下一杯半價。', maxPoints: 6, createdAt: '2025-03-20', color: 'butter', redeemedAt: '2025-04-10' },
]

const FAKE_LOGS: PointLog[] = [
  { id: 'l1',  cardId: '1', delta: 1, stampIcon: 'star',    operatedBy: 'u1', createdAt: '2025-04-01T10:00:00Z' },
  { id: 'l2',  cardId: '1', delta: 1, stampIcon: 'heart',   operatedBy: 'u1', createdAt: '2025-04-02T11:00:00Z' },
  { id: 'l3',  cardId: '1', delta: 1, stampIcon: 'flower',  operatedBy: 'u2', createdAt: '2025-04-03T09:30:00Z' },
  { id: 'l4',  cardId: '1', delta: 1, stampIcon: 'star',    operatedBy: 'u1', createdAt: '2025-04-05T14:00:00Z' },
  { id: 'l5',  cardId: '1', delta: 1, stampIcon: 'sun',     operatedBy: 'u2', createdAt: '2025-04-06T16:00:00Z' },
  { id: 'l6',  cardId: '2', delta: 1, stampIcon: 'leaf',    operatedBy: 'u1', createdAt: '2025-04-01T08:00:00Z' },
  { id: 'l7',  cardId: '2', delta: 1, stampIcon: 'moon',    operatedBy: 'u1', createdAt: '2025-04-03T08:15:00Z' },
  { id: 'l8',  cardId: '2', delta: 1, stampIcon: 'leaf',    operatedBy: 'u2', createdAt: '2025-04-07T08:30:00Z' },
  { id: 'l9',  cardId: '3', delta: 1, stampIcon: 'crown',   operatedBy: 'u1', createdAt: '2025-04-10T15:00:00Z' },
  { id: 'l10', cardId: '3', delta: 1, stampIcon: 'diamond', operatedBy: 'u2', createdAt: '2025-04-12T15:00:00Z' },
  { id: 'l11', cardId: '4', delta: 1, stampIcon: 'heart',   operatedBy: 'u2', createdAt: '2025-03-21T09:00:00Z' },
  { id: 'l12', cardId: '4', delta: 1, stampIcon: 'heart',   operatedBy: 'u2', createdAt: '2025-03-22T09:00:00Z' },
  { id: 'l13', cardId: '4', delta: 1, stampIcon: 'heart',   operatedBy: 'u2', createdAt: '2025-03-23T09:00:00Z' },
  { id: 'l14', cardId: '4', delta: 1, stampIcon: 'heart',   operatedBy: 'u2', createdAt: '2025-03-24T09:00:00Z' },
  { id: 'l15', cardId: '4', delta: 1, stampIcon: 'heart',   operatedBy: 'u2', createdAt: '2025-03-25T09:00:00Z' },
  { id: 'l16', cardId: '4', delta: 1, stampIcon: 'heart',   operatedBy: 'u2', createdAt: '2025-03-26T09:00:00Z' },
]

export const useCardStore = defineStore('card', () => {
  const users  = ref<User[]>([...FAKE_USERS])
  const cards  = ref<Card[]>([...FAKE_CARDS])
  const logs   = ref<PointLog[]>([...FAKE_LOGS])
  const selectedCardId  = ref<string>('1')
  const currentUserId   = ref<string>('u1')

  const currentUser = computed(() => users.value.find(u => u.id === currentUserId.value) ?? null)

  // Users who own at least one card (as User objects)
  const allOwners = computed(() =>
    users.value.filter(u => cards.value.some(c => c.owner === u.id))
  )

  function getUserById(id: string): User | undefined {
    return users.value.find(u => u.id === id)
  }

  function getCardPoints(cardId: string): number {
    return logs.value.filter(l => l.cardId === cardId).reduce((s, l) => s + l.delta, 0)
  }

  function getCardLogs(cardId: string): PointLog[] {
    return logs.value
      .filter(l => l.cardId === cardId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  function getCardSlots(cardId: string): (PointLog | null)[] {
    const card = cards.value.find(c => c.id === cardId)
    if (!card) return []
    const cardLogs = getCardLogs(cardId)
    const slots: (PointLog | null)[] = Array(card.maxPoints).fill(null)
    let filled = 0
    for (const log of cardLogs) {
      if (log.delta === 1 && filled < card.maxPoints) { slots[filled] = log; filled++ }
      else if (log.delta === -1 && filled > 0) { filled--; slots[filled] = null }
    }
    return slots
  }

  function getCardStatus(cardId: string): 'incomplete' | 'complete' | 'redeemed' {
    const card = cards.value.find(c => c.id === cardId)
    if (!card) return 'incomplete'
    if (card.redeemedAt) return 'redeemed'
    if (getCardPoints(cardId) >= card.maxPoints) return 'complete'
    return 'incomplete'
  }

  function addStamp(cardId: string, icon: StampIcon) {
    const log: PointLog = {
      id: `l${Date.now()}`, cardId, delta: 1, stampIcon: icon,
      operatedBy: currentUserId.value,
      createdAt: new Date().toISOString(),
    }
    logs.value.push(log)
    return log
  }

  function removeStamp(cardId: string) {
    if (getCardPoints(cardId) <= 0) return null
    const log: PointLog = {
      id: `l${Date.now()}`, cardId, delta: -1, stampIcon: 'star',
      operatedBy: currentUserId.value,
      createdAt: new Date().toISOString(),
    }
    logs.value.push(log)
    return log
  }

  function redeemCard(cardId: string) {
    const card = cards.value.find(c => c.id === cardId)
    if (card) card.redeemedAt = new Date().toISOString().split('T')[0]
  }

  function deleteCard(cardId: string) {
    cards.value = cards.value.filter(c => c.id !== cardId)
    logs.value  = logs.value.filter(l => l.cardId !== cardId)
    if (selectedCardId.value === cardId) selectedCardId.value = cards.value[0]?.id ?? ''
  }

  function createCard(name: string, maxPoints: number, ownerId: string, description: string, color: Card['color']) {
    const card: Card = {
      id: `card_${Date.now()}`, name, owner: ownerId, description, maxPoints,
      createdAt: new Date().toISOString().split('T')[0],
      color, redeemedAt: null,
    }
    cards.value.push(card)
    selectedCardId.value = card.id
    return card
  }

  function addUser(name: string, avatar: string): User {
    const user: User = { id: `u${Date.now()}`, name, avatar }
    users.value.push(user)
    return user
  }

  function deleteUser(userId: string) {
    users.value = users.value.filter(u => u.id !== userId)
    // Reassign cards owned by deleted user to empty string
    cards.value.forEach(c => { if (c.owner === userId) c.owner = '' })
    if (currentUserId.value === userId) currentUserId.value = users.value[0]?.id ?? ''
  }

  function filteredAndSorted(filter: FilterState): Card[] {
    let result = [...cards.value]
    if (filter.status !== 'all') result = result.filter(c => getCardStatus(c.id) === filter.status)
    if (filter.owner) result = result.filter(c => c.owner === filter.owner)
    result.sort((a, b) => {
      const diff = filter.sortKey === 'createdAt'
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : getCardPoints(a.id) - getCardPoints(b.id)
      return filter.sortDir === 'asc' ? diff : -diff
    })
    return result
  }

  return {
    users, cards, logs, selectedCardId, currentUserId, currentUser, allOwners,
    getUserById, getCardPoints, getCardLogs, getCardSlots, getCardStatus,
    addStamp, removeStamp, redeemCard, deleteCard, createCard,
    addUser, deleteUser, filteredAndSorted,
  }
})
