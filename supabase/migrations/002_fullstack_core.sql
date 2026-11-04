-- DpgTAP cloud sync schema. Apply after 001_toll_search.sql in Supabase SQL Editor.
-- All user data is protected by RLS. Never store full card PAN, APDU, PIN, OTP, or operator passwords.
create extension if not exists pgcrypto;
create table if not exists public.cards (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 issuer text not null check (issuer in ('mandiri','brizzi','flazz','tapcash','other')),
 nickname text not null check (char_length(nickname) between 1 and 40), last4 char(4) not null check (last4 ~ '^[0-9]{4}$'),
 card_fingerprint char(64) not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id,card_fingerprint)
);
create index if not exists cards_user_idx on public.cards(user_id,created_at desc);
create table if not exists public.balance_snapshots (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 card_id uuid not null references public.cards(id) on delete cascade, balance bigint not null check(balance >= 0),
 currency char(3) not null default 'IDR' check(currency='IDR'), read_method text not null check(read_method in ('nfc','manual')),
 read_at timestamptz not null default now(), created_at timestamptz not null default now()
);
create index if not exists balance_snapshots_card_idx on public.balance_snapshots(card_id,read_at desc);
create table if not exists public.subscription_entitlements (
 id uuid primary key default gen_random_uuid(), user_id uuid not null unique references auth.users(id) on delete cascade,
 plan text not null default 'free' check(plan in ('free','premium_yearly','lifetime')),
 status text not null default 'inactive' check(status in ('active','inactive','grace_period','expired','cancelled')),
 provider text check(provider in ('google_play','app_store','manual')), provider_product_id text, expires_at timestamptz, updated_at timestamptz not null default now()
);
create table if not exists public.toll_search_audit (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 period_days int not null check(period_days in (7,14,30)), card_last4 char(4) not null,
 operator_count int not null default 0, result_count int not null default 0, consented_at timestamptz not null default now(), created_at timestamptz not null default now()
);
alter table public.cards enable row level security;
alter table public.balance_snapshots enable row level security;
alter table public.subscription_entitlements enable row level security;
alter table public.toll_search_audit enable row level security;
create policy "cards_select_own" on public.cards for select using (auth.uid()=user_id);
create policy "cards_insert_own" on public.cards for insert with check (auth.uid()=user_id);
create policy "cards_update_own" on public.cards for update using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "cards_delete_own" on public.cards for delete using (auth.uid()=user_id);
create policy "balances_select_own" on public.balance_snapshots for select using (auth.uid()=user_id);
create policy "balances_insert_own" on public.balance_snapshots for insert with check (auth.uid()=user_id and exists(select 1 from public.cards c where c.id=card_id and c.user_id=auth.uid()));
create policy "balances_delete_own" on public.balance_snapshots for delete using (auth.uid()=user_id);
create policy "entitlements_select_own" on public.subscription_entitlements for select using (auth.uid()=user_id);
create policy "search_audit_select_own" on public.toll_search_audit for select using (auth.uid()=user_id);
create policy "search_audit_insert_own" on public.toll_search_audit for insert with check (auth.uid()=user_id);
-- Clients cannot grant themselves Premium; writes are reserved for verified server/webhook workflows.
revoke insert, update, delete on public.subscription_entitlements from anon, authenticated;
