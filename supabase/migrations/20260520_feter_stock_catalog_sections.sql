-- Feter Stock + Catalog Eter section model.
-- pedidos remains the canonical order table; orders is exposed as a read-only
-- compatibility view for legacy consumers that still select from public.orders.

alter table public.productos
  add column if not exists product_sections text[] not null default array['catalog']::text[];

alter table public.productos
  drop constraint if exists productos_product_sections_allowed;

alter table public.productos
  add constraint productos_product_sections_allowed
  check (
    product_sections <@ array['home', 'catalog', 'liquidation', 'flash']::text[]
    and cardinality(product_sections) > 0
  );

update public.productos
set product_sections = array(
  select distinct section
  from unnest(
    array_cat(
      case when coalesce(product_sections, array[]::text[]) = array[]::text[]
        then array['catalog']::text[]
        else product_sections
      end,
      case when liquidation_active is true
        then array['liquidation']::text[]
        else array[]::text[]
      end
    )
  ) as section
)
where product_sections is null
   or cardinality(product_sections) = 0
   or liquidation_active is true;

alter table public.announcements
  add column if not exists target_pages text[] not null default array['home']::text[],
  add column if not exists template_key text not null default 'minimal',
  add column if not exists display_mode text not null default 'floating',
  add column if not exists cta_label text,
  add column if not exists cta_url text,
  add column if not exists priority integer not null default 0;

alter table public.announcements
  drop constraint if exists announcements_target_pages_allowed;

alter table public.announcements
  add constraint announcements_target_pages_allowed
  check (
    target_pages <@ array['all', 'home', 'catalog', 'community', 'about', 'contact']::text[]
    and cardinality(target_pages) > 0
  );

alter table public.announcements
  drop constraint if exists announcements_display_mode_allowed;

alter table public.announcements
  add constraint announcements_display_mode_allowed
  check (display_mode in ('floating', 'banner', 'modal'));

drop view if exists public.orders;

create view public.orders as
select
  p.id,
  null::uuid as user_id,
  null::uuid as reseller_id,
  p.customer_name,
  null::text as customer_phone,
  p.customer_email,
  p.items,
  p.total_amount as subtotal,
  coalesce(p.discount_amount, 0) as discount,
  p.total_amount as total,
  p.status,
  null::text as payment_method,
  null::text as shipping_address,
  null::text as tracking_number,
  null::text as notes,
  p.created_at,
  p.created_at as updated_at
from public.pedidos p;

comment on view public.orders is 'Read-only compatibility view. New writes must target public.pedidos.';

create index if not exists idx_productos_status_name
  on public.productos(status, name);

create index if not exists idx_productos_product_sections
  on public.productos using gin(product_sections);

create index if not exists idx_productos_liquidation_active
  on public.productos(liquidation_active)
  where liquidation_active is true;

create index if not exists idx_pedidos_created_status
  on public.pedidos(created_at desc, status);

create index if not exists idx_coupons_code_active
  on public.coupons(code, is_active);

create index if not exists idx_announcements_active_priority
  on public.announcements(is_active, priority desc, published_at desc);
