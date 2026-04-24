-- ============================================================
-- collect-points-service  Supabase Schema
-- 在 Supabase Dashboard > SQL Editor 執行此檔案
-- ============================================================

-- 啟用 UUID 擴充功能（Supabase 預設已啟用，保留備用）
create extension if not exists "pgcrypto";

-- ── users ─────────────────────────────────────────────────────────────────────
create table if not exists public.users (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  avatar     text not null default '🐶',  -- emoji 動物圖案
  created_at timestamptz not null default now()
);

-- ── cards ─────────────────────────────────────────────────────────────────────
create table if not exists public.cards (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null default '',
  owner       uuid references public.users(id) on delete set null,
  max_points  int  not null check (max_points >= 1 and max_points <= 30),
  color       text not null default 'peach'
              check (color in ('peach','mint','lavender','butter','sky')),
  redeemed_at date default null,
  created_at  timestamptz not null default now()
);

-- ── point_logs ────────────────────────────────────────────────────────────────
-- Append-only：+1 = 蓋章，-1 = 消除。不修改不刪除，靠 SUM(delta) 計算目前點數
create table if not exists public.point_logs (
  id          uuid primary key default gen_random_uuid(),
  card_id     uuid not null references public.cards(id) on delete cascade,
  delta       int  not null check (delta in (1, -1)),
  stamp_icon  text not null default 'star',
  operated_by uuid references public.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists idx_cards_owner        on public.cards(owner);
create index if not exists idx_point_logs_card_id on public.point_logs(card_id);
create index if not exists idx_point_logs_created on public.point_logs(created_at);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- 目前為多人共用集點卡情境，允許匿名讀寫
-- 正式環境建議依需求收緊權限

alter table public.users     enable row level security;
alter table public.cards     enable row level security;
alter table public.point_logs enable row level security;

-- users: 所有人可讀寫
create policy "users_select_all" on public.users for select using (true);
create policy "users_insert_all" on public.users for insert with check (true);
create policy "users_delete_all" on public.users for delete using (true);

-- cards: 所有人可讀寫
create policy "cards_select_all" on public.cards for select using (true);
create policy "cards_insert_all" on public.cards for insert with check (true);
create policy "cards_update_all" on public.cards for update using (true);
create policy "cards_delete_all" on public.cards for delete using (true);

-- point_logs: 所有人可讀寫（append-only 由應用層保證，不在 DB 層限制）
create policy "logs_select_all"  on public.point_logs for select using (true);
create policy "logs_insert_all"  on public.point_logs for insert with check (true);

-- ── Realtime ──────────────────────────────────────────────────────────────────
-- 在 Supabase Dashboard > Database > Replication 開啟以下資料表的 Realtime
-- 或執行：
-- alter publication supabase_realtime add table public.point_logs;
