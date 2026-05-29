---
name: eter-supabase
description: "Supabase operating memory for Éter. Use when touching database schema, products, images, orders, coupons, announcements, reseller links, RPCs, RLS, storage, or app-web sync."
---

# Éter Supabase

## Project

- Project ref/id: `tolzrvsykzmvndvomllt`.
- Public REST base: `https://tolzrvsykzmvndvomllt.supabase.co/rest/v1/`.
- Storage project base: `https://tolzrvsykzmvndvomllt.supabase.co`.

## Canonical Tables

- Products: `public.productos`.
- Orders: `public.pedidos`.
- Compatibility view: `public.orders` can exist for read compatibility; new writes go to `pedidos`.
- Coupons: `public.coupons`.
- Announcements: `public.announcements`.
- Reseller/user profiles: `public.profiles`.

## Product Shape

Important `productos` columns:

- `id uuid`
- `name`
- `category`
- `price numeric`
- `base_price numeric`
- `image text`
- `images text[]`
- `description`
- `stock int`
- `stock_by_size jsonb`
- `status`
- `brand`
- `product_sections text[] not null default ['catalog']`
- liquidation fields: `liquidation_active`, `liquidation_discount_percent`, `liquidation_price`, `liquidation_at`

Allowed product sections:

- `home`
- `catalog`
- `liquidation`
- `flash`

## Storage

- Product images bucket: `products`.
- Bucket should be public.
- Public image URL pattern:
  `https://tolzrvsykzmvndvomllt.supabase.co/storage/v1/object/public/products/<objectPath>`
- Mobile uploads should go direct to:
  `storage/v1/object/products/<objectPath>`
- Validate app uploads:
  - MIME: `image/jpeg`, `image/png`, `image/webp`.
  - Max size: 8 MB.

## Admin RPC

Mobile/admin app should use `public.feter_admin_sync(payload jsonb)` for privileged operational actions.

Expected actions:

- `list_all`
- `update_product_sections`
- `update_product`
- `create_product`
- `bulk_load`
- `update_order_status`
- `save_coupon`
- `delete_coupon`
- `save_announcement`
- `delete_announcement`

HTTP headers:

- `apikey: <anon key>`
- `Authorization: Bearer <anon key>`
- `x-admin-token: Feter`

Important: Android must only show success when HTTP is successful and RPC body has `success: true`.

## Known Safety Notes

- `public.user_roles` has been reported with RLS disabled. Do not blindly enable RLS; define policies first.
- Prefer migrations for durable schema changes.
- Verify schema before writing assumptions.
- For arrays, remember `productos.images` and `productos.product_sections` are PostgreSQL arrays, not JSON arrays.

## Verification Queries

Use Supabase SQL or REST checks to confirm:

- Product count.
- RPC exists.
- Bucket `products` is public.
- Storage insert/select policies exist.
- A controlled create-product test inserts, selects, then deletes a temporary `CODEX_TEST_DELETE_%` product.
