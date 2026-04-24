/**
 * api/cards.ts
 *
 * Supabase table: cards
 * ┌──────────────┬───────────────────────────────────────────────────────────┐
 * │ column       │ type                                                      │
 * ├──────────────┼───────────────────────────────────────────────────────────┤
 * │ id           │ uuid  PRIMARY KEY DEFAULT gen_random_uuid()               │
 * │ name         │ text  NOT NULL                                            │
 * │ description  │ text  NOT NULL DEFAULT ''                                 │
 * │ owner        │ uuid  REFERENCES users(id) ON DELETE SET NULL             │
 * │ max_points   │ int   NOT NULL CHECK (max_points >= 1 AND <= 30)         │
 * │ color        │ text  NOT NULL DEFAULT 'peach'                            │
 * │ redeemed_at  │ date  DEFAULT NULL                                        │
 * │ created_at   │ timestamptz DEFAULT now()                                 │
 * └──────────────┴───────────────────────────────────────────────────────────┘
 *
 * RLS 建議：允許所有人讀取，寫入不限制（多人共用集點卡情境）。
 */

import { supabase } from './supabase'
import type { Card, CardColor } from '../types'

// ── DB row shape ──────────────────────────────────────────────────────────────
interface CardRow {
  id: string
  name: string
  description: string
  owner: string | null
  max_points: number
  color: string
  redeemed_at: string | null
  created_at: string
}

function toCard(row: CardRow): Card {
  return {
    id:          row.id,
    name:        row.name,
    description: row.description,
    owner:       row.owner ?? '',
    maxPoints:   row.max_points,
    color:       row.color as CardColor,
    redeemedAt:  row.redeemed_at,
    createdAt:   row.created_at.split('T')[0],
  }
}

// ── API functions ─────────────────────────────────────────────────────────────

/** 取得所有集點卡 */
export async function fetchCards(): Promise<Card[]> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as CardRow[]).map(toCard)
}

/** 新增集點卡 */
export async function insertCard(
  payload: Omit<Card, 'id' | 'createdAt'>
): Promise<Card> {
  const { data, error } = await supabase
    .from('cards')
    .insert({
      name:        payload.name,
      description: payload.description,
      owner:       payload.owner || null,
      max_points:  payload.maxPoints,
      color:       payload.color,
      redeemed_at: payload.redeemedAt ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return toCard(data as CardRow)
}

/** 更新集點卡（目前只用於 redeemed_at） */
export async function updateCard(
  cardId: string,
  patch: Partial<Pick<Card, 'name' | 'description' | 'color' | 'redeemedAt'>>
): Promise<Card> {
  const dbPatch: Partial<CardRow> = {}
  if (patch.name        !== undefined) dbPatch.name        = patch.name
  if (patch.description !== undefined) dbPatch.description = patch.description
  if (patch.color       !== undefined) dbPatch.color       = patch.color
  if (patch.redeemedAt  !== undefined) dbPatch.redeemed_at = patch.redeemedAt

  const { data, error } = await supabase
    .from('cards')
    .update(dbPatch)
    .eq('id', cardId)
    .select()
    .single()

  if (error) throw error
  return toCard(data as CardRow)
}

/** 刪除集點卡（point_logs 由 DB CASCADE 一併刪除） */
export async function deleteCard(cardId: string): Promise<void> {
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', cardId)

  if (error) throw error
}
