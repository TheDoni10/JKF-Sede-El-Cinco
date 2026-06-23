-- Tablas y datos para autenticacion y sistema academico

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  apellidos text not null,
  numero_documento text not null unique,
  estado text not null default 'activo' check (estado in ('activo', 'inactivo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sessions (
  session_id uuid primary key,
  role text not null check (role in ('student', 'teacher', 'admin')),
  user_id uuid not null,
  document text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null,
  last_active_at timestamptz not null,
  revoked boolean not null default false,
  ip_address text,
  user_agent text
);

create or replace function public.admins_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists admins_set_updated_at on public.admins;
create trigger admins_set_updated_at
before update on public.admins
for each row execute function public.admins_set_updated_at();

insert into public.admins (nombre, apellidos, numero_documento, estado)
values
  ('Doni', 'Beltra', '10469071616', 'activo')
on conflict (numero_documento) do update set
  nombre = excluded.nombre,
  apellidos = excluded.apellidos,
  estado = excluded.estado;
