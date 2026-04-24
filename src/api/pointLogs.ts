/**
 * api/pointLogs.ts
 *
 * Supabase table: point_logs  ← append-only，不修改不刪除（邏輯刪除用 delta: -1）
 * ┌──────────────┬──────────────────────────────────────────────────────────┐
 * │ column       │ type                                                     │
 * ├──────────────┼──────────────────────────────────────────────────────────┤
 * │ id           │ uuid  PRIMARY KEY DEFAULT gen_random_uuid()              │
 * │ card_id      │ uuid  NOT NULL REFERENCES cards(id) ON DELETE CASCADE    │
 * │ delta        │ int   NOT NULL  (+1 = 蓋章, -1 = 消除)                   │
 * │ stamp_icon   │ text  NOT NULL                                           │
 * │ operated_by  │ uuid  REFERENCES users(id) ON DELETE SET NULL            │
 * │ created_at   │ timestamptz DEFAULT now()                                │
 * └──────────────┴──────────────────────────────────────────────────────────┘
 *
 * Realtime：訂閱 point_logs INSERT 可做到多人即時同步。
 */

import { supabase } from './supabase'
import type { PointLog, StampIcon } from '../types'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ── DB row shape ──────────────────────────────────────────────────────────────
interface PointLogRow {
  id: string
  card_id: string
  delta: number
  stamp_icon: string
  operated_by: string | null
  created_at: string
}

function toPointLog(row: PointLogRow): PointLog {
  return {
    id:          row.id,
    cardId:      row.card_id,
    delta:       row.delta,
    stampIcon:   row.stamp_icon as StampIcon,
    operatedBy:  row.operated_by ?? '',
    createdAt:   row.created_at,
  }
}

// ── API functions ─────────────────────────────────────────────────────────────

/** 取得指定卡片的所有操作紀錄，依時間升序 */
export async function fetchLogs(cardId: string): Promise<PointLog[]> {
  const { data, error } = await supabase
    .from('point_logs')
    .select('*')
    .eq('card_id', cardId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data as PointLogRow[]).map(toPointLog)
}

/** 取得所有卡片的所有紀錄（初始化 store 用） */
export async function fetchAllLogs(): Promise<PointLog[]> {
  const { data, error } = await supabase
    .from('point_logs')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data as PointLogRow[]).map(toPointLog)
}

/** 新增一筆蓋章或消除紀錄 */
export async function insertLog(payload: Omit<PointLog, 'id' | 'createdAt'>): Promise<PointLog> {
  const { data, error } = await supabase
    .from('point_logs')
    .insert({
      card_id:     payload.cardId,
      delta:       payload.delta,
      stamp_icon:  payload.stampIcon,
      operated_by: payload.operatedBy || null,
    })
    .select()
    .single()

  if (error) throw error
  return toPointLog(data as PointLogRow)
}

// ── Realtime ──────────────────────────────────────────────────────────────────

/**
 * 訂閱 point_logs 的 INSERT 事件
 * 當其他使用者蓋章或消除時，本地 store 會即時收到新的 log
 *
 * @param onInsert  收到新 log 時的 callback
 * @returns 取消訂閱的函式
 */
export function subscribeToLogs(
  onInsert: (log: PointLog) => void
): () => void {
  const channel: RealtimeChannel = supabase
    .channel('point_logs_changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'point_logs' },
      (payload) => {
        const log = toPointLog(payload.new as PointLogRow)
        onInsert(log)
      }
    )
    .subscribe()

  // 回傳 cleanup 函式，在 onUnmounted 呼叫
  return () => { supabase.removeChannel(channel) }
}

/**
 * 訂閱特定卡片的 point_logs INSERT（可用於 CardDetailView）
 */
export function subscribeToCardLogs(
  cardId: string,
  onInsert: (log: PointLog) => void
): () => void {
  const channel: RealtimeChannel = supabase
    .channel(`point_logs_card_${cardId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'point_logs',
        filter: `card_id=eq.${cardId}`,
      },
      (payload) => {
        const log = toPointLog(payload.new as PointLogRow)
        onInsert(log)
      }
    )
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}
