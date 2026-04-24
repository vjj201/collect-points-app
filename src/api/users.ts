/**
 * api/users.ts
 *
 * Supabase table: users
 * ┌────────────┬──────────────────────────────┐
 * │ column     │ type                         │
 * ├────────────┼──────────────────────────────┤
 * │ id         │ uuid  PRIMARY KEY DEFAULT ... │
 * │ name       │ text  NOT NULL               │
 * │ avatar     │ text  NOT NULL               │  ← emoji 動物
 * │ created_at │ timestamptz DEFAULT now()    │
 * └────────────┴──────────────────────────────┘
 *
 * RLS 建議：啟用 RLS，允許所有人讀取，只允許本人寫入自己的 row。
 */

import { supabase } from './supabase'
import type { User } from '../types'

// ── DB row shape (snake_case from Supabase) ──────────────────────────────────
interface UserRow {
  id: string
  name: string
  avatar: string
  created_at: string
}

function toUser(row: UserRow): User {
  return { id: row.id, name: row.name, avatar: row.avatar }
}

// ── API functions ─────────────────────────────────────────────────────────────

/** 取得所有使用者 */
export async function fetchUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data as UserRow[]).map(toUser)
}

/** 新增使用者，回傳帶 id 的完整物件 */
export async function insertUser(payload: Omit<User, 'id'>): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .insert({ name: payload.name, avatar: payload.avatar })
    .select()
    .single()

  if (error) throw error
  return toUser(data as UserRow)
}

/** 刪除使用者（同時會觸發 DB 的 ON DELETE SET NULL 讓 cards.owner 變 null） */
export async function deleteUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)

  if (error) throw error
}
