-- Optional future cloud-sync schema. Local-first MVP can run without Supabase.
create extension if not exists pgcrypto;
create table if not exists public.operator_registry (
  code text primary key, name text not null, official_url text,
  integration_status text not null default 'not_configured'
    check (integration_status in ('ready','not_configured','unavailable')),
  last_verified_at timestamptz, notes text
);
create table if not exists public.search_sessions (
  id uuid primary key default gen_random_uuid(),
  period_days int not null check (period_days in (7,14,30)),
  card_fingerprint text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.toll_transactions (
  id uuid primary key default gen_random_uuid(),
  operator_code text not null references public.operator_registry(code),
  transaction_at timestamptz not null,
  entry_gate text, exit_gate text, gate text, lane text,
  vehicle_class text, amount bigint, balance_after bigint,
  card_last4 char(4) not null, receipt_id text,
  source_url text not null, original_receipt_url text,
  verification text not null check (verification in ('source_returned','operator_receipt')),
  created_at timestamptz not null default now(),
  unique(operator_code, receipt_id)
);
create index if not exists toll_transactions_time_idx on public.toll_transactions(transaction_at desc);
-- Do not store full card numbers, PINs, OTPs, raw APDU payloads, or operator credentials here.
-- Enable RLS and define explicit policies before exposing any table through Supabase APIs.


-- Default-deny until an explicit, user-scoped API is implemented.
alter table public.operator_registry enable row level security;
alter table public.search_sessions enable row level security;
alter table public.toll_transactions enable row level security;
drop policy if exists operator_registry_public_read on public.operator_registry;
create policy operator_registry_public_read
  on public.operator_registry for select to anon, authenticated using (true);
revoke all on public.operator_registry from public, anon, authenticated;
grant select on public.operator_registry to anon, authenticated;
revoke all on public.search_sessions from public, anon, authenticated;
revoke all on public.toll_transactions from public, anon, authenticated;
