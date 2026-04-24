/**
 * stores/cardStore.ts
 *
 * 職責：
 *  1. 作為前端唯一的資料來源（single source of truth）
 *  2. 包裝 api/ 層的非同步呼叫，管理 loading / error 狀態
 *  3. 透過 Supabase Realtime 訂閱 point_logs，讓多人操作即時同步
 *  4. 提供純計算的 getter（getCardPoints / getCardSlots / getCardStatus）
 *  5. 提供篩選排序的 filteredAndSorted()
 *
 * 使用方式（在元件的 setup 裡）：
 *   const store = useCardStore()
 *   await store.init()   ← App.vue 的 onMounted 呼叫一次即可
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as usersApi from '../api/users'
import * as cardsApi from '../api/cards'
import * as logsApi  from '../api/pointLogs'
import type { Card, PointLog, StampIcon, FilterState, User } from '../types'

export const useCardStore = defineStore('card', () => {

  // ── State ──────────────────────────────────────────────────────────────────

  const users        = ref<User[]>([])
  const cards        = ref<Card[]>([])
  const logs         = ref<PointLog[]>([])
  const selectedCardId = ref<string>('')
  const currentUserId  = ref<string>('')

  const loading = ref(false)           // 全域 loading（init 階段）
  const error   = ref<string | null>(null)  // 最後一次 API 錯誤，元件可顯示 toast
  const ready   = ref(false)           // init 是否完成

  let unsubscribeLogs: (() => void) | null = null

  // ── Computed ───────────────────────────────────────────────────────────────

  const currentUser = computed(() =>
    users.value.find(u => u.id === currentUserId.value) ?? null
  )

  const allOwners = computed(() =>
    users.value.filter(u => cards.value.some(c => c.owner === u.id))
  )

  // ── Helpers (純計算，不觸發 API) ───────────────────────────────────────────

  function getUserById(id: string): User | undefined {
    return users.value.find(u => u.id === id)
  }

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

  function filteredAndSorted(filter: FilterState): Card[] {
    let result = [...cards.value]
    if (filter.status !== 'all') result = result.filter(c => getCardStatus(c.id) === filter.status)
    if (filter.owner)            result = result.filter(c => c.owner === filter.owner)
    result.sort((a, b) => {
      const diff = filter.sortKey === 'createdAt'
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : getCardPoints(a.id) - getCardPoints(b.id)
      return filter.sortDir === 'asc' ? diff : -diff
    })
    return result
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  async function init() {
    if (ready.value) return
    loading.value = true
    error.value   = null
    try {
      const [fetchedUsers, fetchedCards, fetchedLogs] = await Promise.all([
        usersApi.fetchUsers(),
        cardsApi.fetchCards(),
        logsApi.fetchAllLogs(),
      ])
      users.value = fetchedUsers
      cards.value = fetchedCards
      logs.value  = fetchedLogs

      if (fetchedCards.length > 0) selectedCardId.value = fetchedCards[0].id
      if (fetchedUsers.length > 0) currentUserId.value  = fetchedUsers[0].id

      // Realtime: 其他使用者蓋章時自動同步
      unsubscribeLogs = logsApi.subscribeToLogs((newLog) => {
        const exists = logs.value.some(l => l.id === newLog.id)
        if (!exists) logs.value.push(newLog)
      })

      ready.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  function dispose() {
    unsubscribeLogs?.()
    unsubscribeLogs = null
    ready.value = false
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  async function addStamp(cardId: string, icon: StampIcon): Promise<PointLog | null> {
    error.value = null
    const tempId = `temp_${Date.now()}`
    // 樂觀更新
    const tempLog: PointLog = {
      id: tempId, cardId, delta: 1, stampIcon: icon,
      operatedBy: currentUserId.value, createdAt: new Date().toISOString(),
    }
    logs.value.push(tempLog)
    try {
      const saved = await logsApi.insertLog({ cardId, delta: 1, stampIcon: icon, operatedBy: currentUserId.value })
      const idx = logs.value.findIndex(l => l.id === tempId)
      if (idx !== -1) logs.value.splice(idx, 1, saved)
      return saved
    } catch (e) {
      logs.value = logs.value.filter(l => l.id !== tempId)
      error.value = e instanceof Error ? e.message : String(e)
      return null
    }
  }

  async function removeStamp(cardId: string): Promise<PointLog | null> {
    if (getCardPoints(cardId) <= 0) return null
    error.value = null
    const tempId = `temp_${Date.now()}`
    const tempLog: PointLog = {
      id: tempId, cardId, delta: -1, stampIcon: 'star',
      operatedBy: currentUserId.value, createdAt: new Date().toISOString(),
    }
    logs.value.push(tempLog)
    try {
      const saved = await logsApi.insertLog({ cardId, delta: -1, stampIcon: 'star', operatedBy: currentUserId.value })
      const idx = logs.value.findIndex(l => l.id === tempId)
      if (idx !== -1) logs.value.splice(idx, 1, saved)
      return saved
    } catch (e) {
      logs.value = logs.value.filter(l => l.id !== tempId)
      error.value = e instanceof Error ? e.message : String(e)
      return null
    }
  }

  async function redeemCard(cardId: string): Promise<void> {
    error.value = null
    const today = new Date().toISOString().split('T')[0]
    const card = cards.value.find(c => c.id === cardId)
    if (!card) return
    const prev = card.redeemedAt
    card.redeemedAt = today
    try {
      await cardsApi.updateCard(cardId, { redeemedAt: today })
    } catch (e) {
      card.redeemedAt = prev
      error.value = e instanceof Error ? e.message : String(e)
    }
  }

  async function createCard(
    name: string, maxPoints: number, ownerId: string,
    description: string, color: Card['color']
  ): Promise<Card | null> {
    error.value = null
    try {
      const card = await cardsApi.insertCard({ name, description, maxPoints, color, owner: ownerId, redeemedAt: null })
      cards.value.unshift(card)
      selectedCardId.value = card.id
      return card
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      return null
    }
  }

  async function deleteCard(cardId: string): Promise<void> {
    error.value = null
    const prevCards = [...cards.value]
    const prevLogs  = [...logs.value]
    cards.value = cards.value.filter(c => c.id !== cardId)
    logs.value  = logs.value.filter(l => l.cardId !== cardId)
    if (selectedCardId.value === cardId) selectedCardId.value = cards.value[0]?.id ?? ''
    try {
      await cardsApi.deleteCard(cardId)
    } catch (e) {
      cards.value = prevCards
      logs.value  = prevLogs
      error.value = e instanceof Error ? e.message : String(e)
    }
  }

  async function addUser(name: string, avatar: string): Promise<User | null> {
    error.value = null
    try {
      const user = await usersApi.insertUser({ name, avatar })
      users.value.push(user)
      return user
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      return null
    }
  }

  async function deleteUser(userId: string): Promise<void> {
    error.value = null
    const prevUsers = [...users.value]
    users.value = users.value.filter(u => u.id !== userId)
    cards.value.forEach(c => { if (c.owner === userId) c.owner = '' })
    if (currentUserId.value === userId) currentUserId.value = users.value[0]?.id ?? ''
    try {
      await usersApi.deleteUser(userId)
    } catch (e) {
      users.value = prevUsers
      error.value = e instanceof Error ? e.message : String(e)
    }
  }

  // ── Return ─────────────────────────────────────────────────────────────────

  return {
    users, cards, logs, selectedCardId, currentUserId,
    loading, error, ready,
    currentUser, allOwners,
    getUserById, getCardPoints, getCardLogs, getCardSlots, getCardStatus,
    filteredAndSorted,
    init, dispose,
    addStamp, removeStamp, redeemCard,
    createCard, deleteCard,
    addUser, deleteUser,
  }
})
