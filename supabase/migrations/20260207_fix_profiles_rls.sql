-- =====================================================
-- FIX: Infinite recursion in profiles RLS policies
-- Solution: Use a helper table without RLS
-- =====================================================

-- 1. Eliminar políticas conflictivas
drop policy if exists "profiles: user can read own" on public.profiles;
drop policy if exists "profiles: admin can read all" on public.profiles;
drop policy if exists "Public profiles visible" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "Admins manage all profiles" on public.profiles;
drop policy if exists "profiles_read_own" on public.profiles;
drop policy if exists "profiles_admin_read_all" on public.profiles;
drop policy if exists "profiles_admin_update" on public.profiles;

-- 2. Crear tabla auxiliar para roles (sin RLS)
create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user',
  updated_at timestamp with time zone default now()
);

-- Asegurarse de que NO tiene RLS habilitado
alter table public.user_roles disable row level security;

-- 3. Sincronizar roles existentes desde profiles
insert into public.user_roles (user_id, role)
select id, role::text from public.profiles
on conflict (user_id) do update set role = excluded.role;

-- 4. Crear trigger para mantener sincronizado
create or replace function public.sync_user_role()
returns trigger as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, new.role::text)
  on conflict (user_id) 
  do update set role = excluded.role, updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists sync_role_on_profile_change on public.profiles;
create trigger sync_role_on_profile_change
  after insert or update of role on public.profiles
  for each row
  execute function public.sync_user_role();

-- 5. Función optimizada que consulta la tabla sin RLS
create or replace function public.is_admin_or_support()
returns boolean as $$
begin
  return exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
    and role in ('admin', 'support')
  );
end;
$$ language plpgsql security definer stable;

-- 6. Crear nuevas políticas limpias
-- Los usuarios pueden leer su propio perfil
create policy "profiles_read_own"
on public.profiles for select
using (auth.uid() = id);

-- Los administradores pueden leer todos los perfiles
create policy "profiles_admin_read_all"
on public.profiles for select
using (public.is_admin_or_support());

-- Los usuarios pueden actualizar su propio perfil
create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id);

-- Los administradores pueden actualizar cualquier perfil
create policy "profiles_admin_update"
on public.profiles for update
using (public.is_admin_or_support());
