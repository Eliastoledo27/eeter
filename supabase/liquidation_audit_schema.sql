-- Liquidation + audit schema hardening
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  ip_address text,
  entity text not null,
  entity_id text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_logs_user_id on public.audit_logs(user_id);
create index if not exists idx_audit_logs_entity on public.audit_logs(entity, entity_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);

alter table public.productos
  add column if not exists liquidation_active boolean not null default false,
  add column if not exists liquidation_discount_percent integer,
  add column if not exists liquidation_price numeric,
  add column if not exists liquidation_at timestamptz,
  add column if not exists liquidation_by uuid;

create or replace function public.sync_liquidation_state()
returns trigger
language plpgsql
as $$
begin
  if new.liquidation_active is true then
    if new.liquidation_discount_percent is null then
      raise exception 'liquidation_discount_percent required when liquidation_active=true';
    end if;
    if new.liquidation_price is null then
      raise exception 'liquidation_price required when liquidation_active=true';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_liquidation_state on public.productos;
create trigger trg_sync_liquidation_state
before insert or update on public.productos
for each row execute function public.sync_liquidation_state();
