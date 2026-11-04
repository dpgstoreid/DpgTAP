-- Lock down legacy/future tables that are not exposed by DpgTAP APIs yet.
-- Apply after 001 and 002. No user-facing feature depends on direct client access to these tables.

alter table public.operator_registry enable row level security;
alter table public.search_sessions enable row level security;
alter table public.toll_transactions enable row level security;

-- Public operator master data is read-only. Never allow arbitrary client edits.
drop policy if exists operator_registry_public_read on public.operator_registry;
create policy operator_registry_public_read
  on public.operator_registry for select to anon, authenticated using (true);
revoke all on public.operator_registry from public, anon, authenticated;
grant select on public.operator_registry to anon, authenticated;

-- Search-session and transaction tables remain inaccessible until a dedicated,
-- user-scoped API and data-retention policy are implemented.
revoke all on public.search_sessions from public, anon, authenticated;
revoke all on public.toll_transactions from public, anon, authenticated;

-- Search audit data is server-owned; clients may read only their own records.
revoke all on public.toll_search_audit from public, anon;
revoke insert, update, delete on public.toll_search_audit from authenticated;
grant select on public.toll_search_audit to authenticated;
drop policy if exists search_audit_insert_own on public.toll_search_audit;
