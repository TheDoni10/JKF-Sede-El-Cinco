-- Sistema academico JFK Sede El Cinco
-- Ejecutar completo en Supabase SQL Editor.
-- Este esquema usa service_role desde Vercel para las APIs del portal.

create extension if not exists pgcrypto;

drop trigger if exists notas_refresh_rollups_insert on public.notas;
drop trigger if exists notas_refresh_rollups_update on public.notas;
drop trigger if exists notas_refresh_rollups_delete on public.notas;
drop function if exists public.refresh_academic_rollups_trigger();
drop function if exists public.refresh_academic_rollups();

create table if not exists public.grados (
  id smallint primary key,
  nombre text not null unique,
  orden smallint not null unique
);

create table if not exists public.periodos (
  id smallint primary key,
  nombre text not null unique,
  numero smallint not null unique check (numero between 1 and 4),
  estado text not null default 'activo' check (estado in ('activo', 'inactivo')),
  fecha_inicio date,
  fecha_fin date
);

create table if not exists public.estudiantes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  apellidos text not null,
  numero_documento text not null unique,
  grado_id smallint not null references public.grados(id) on update cascade,
  estado text not null default 'activo' check (estado in ('activo', 'inactivo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profesores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  apellidos text not null,
  numero_documento text not null unique,
  estado text not null default 'activo' check (estado in ('activo', 'inactivo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.materias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  estado text not null default 'activo' check (estado in ('activo', 'inactivo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.grado_materias (
  grado_id smallint not null references public.grados(id) on delete cascade,
  materia_id uuid not null references public.materias(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (grado_id, materia_id)
);

create table if not exists public.notas (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references public.estudiantes(id) on delete cascade,
  materia_id uuid not null references public.materias(id) on delete restrict,
  periodo_id smallint not null references public.periodos(id) on delete restrict,
  profesor_id uuid references public.profesores(id) on delete set null,
  nota numeric(3, 1) not null check (nota >= 0 and nota <= 5),
  observacion text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (estudiante_id, materia_id, periodo_id)
);

create table if not exists public.rankings (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references public.estudiantes(id) on delete cascade,
  grado_id smallint not null references public.grados(id) on delete cascade,
  promedio_general numeric(3, 2) not null default 0,
  posicion int not null,
  total_estudiantes int not null,
  updated_at timestamptz not null default now(),
  unique (estudiante_id)
);

create table if not exists public.historial_academico (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references public.estudiantes(id) on delete cascade,
  grado_id smallint not null references public.grados(id) on delete cascade,
  periodo_id smallint not null references public.periodos(id) on delete cascade,
  promedio numeric(3, 2) not null default 0,
  ranking int,
  total_estudiantes int,
  updated_at timestamptz not null default now(),
  unique (estudiante_id, periodo_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists estudiantes_set_updated_at on public.estudiantes;
create trigger estudiantes_set_updated_at
before update on public.estudiantes
for each row execute function public.set_updated_at();

drop trigger if exists profesores_set_updated_at on public.profesores;
create trigger profesores_set_updated_at
before update on public.profesores
for each row execute function public.set_updated_at();

drop trigger if exists materias_set_updated_at on public.materias;
create trigger materias_set_updated_at
before update on public.materias
for each row execute function public.set_updated_at();

drop trigger if exists notas_set_updated_at on public.notas;
create trigger notas_set_updated_at
before update on public.notas
for each row execute function public.set_updated_at();

create or replace function public.refresh_academic_rollups()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.rankings;

  insert into public.rankings (estudiante_id, grado_id, promedio_general, posicion, total_estudiantes)
  with student_averages as (
    select
      e.id as estudiante_id,
      e.grado_id,
      round(coalesce(avg(n.nota), 0)::numeric, 2) as promedio_general
    from public.estudiantes e
    left join public.notas n on n.estudiante_id = e.id
    where e.estado = 'activo'
    group by e.id, e.grado_id
  ),
  ranked as (
    select
      estudiante_id,
      grado_id,
      promedio_general,
      dense_rank() over (partition by grado_id order by promedio_general desc) as posicion,
      count(*) over (partition by grado_id) as total_estudiantes
    from student_averages
  )
  select estudiante_id, grado_id, promedio_general, posicion, total_estudiantes
  from ranked;

  delete from public.historial_academico;

  insert into public.historial_academico (estudiante_id, grado_id, periodo_id, promedio, ranking, total_estudiantes)
  with period_averages as (
    select
      e.id as estudiante_id,
      e.grado_id,
      p.id as periodo_id,
      round(coalesce(avg(n.nota), 0)::numeric, 2) as promedio
    from public.estudiantes e
    cross join public.periodos p
    left join public.notas n on n.estudiante_id = e.id and n.periodo_id = p.id
    where e.estado = 'activo'
    group by e.id, e.grado_id, p.id
  ),
  ranked as (
    select
      estudiante_id,
      grado_id,
      periodo_id,
      promedio,
      dense_rank() over (partition by grado_id, periodo_id order by promedio desc) as ranking,
      count(*) over (partition by grado_id, periodo_id) as total_estudiantes
    from period_averages
  )
  select estudiante_id, grado_id, periodo_id, promedio, ranking, total_estudiantes
  from ranked;
end;
$$;

create or replace function public.refresh_academic_rollups_trigger()
returns trigger
language plpgsql
as $$
begin
  perform public.refresh_academic_rollups();
  return null;
end;
$$;

create trigger notas_refresh_rollups_insert
after insert on public.notas
for each statement execute function public.refresh_academic_rollups_trigger();

create trigger notas_refresh_rollups_update
after update on public.notas
for each statement execute function public.refresh_academic_rollups_trigger();

create trigger notas_refresh_rollups_delete
after delete on public.notas
for each statement execute function public.refresh_academic_rollups_trigger();

alter table public.grados enable row level security;
alter table public.periodos enable row level security;
alter table public.estudiantes enable row level security;
alter table public.profesores enable row level security;
alter table public.materias enable row level security;
alter table public.grado_materias enable row level security;
alter table public.notas enable row level security;
alter table public.rankings enable row level security;
alter table public.historial_academico enable row level security;

insert into public.grados (id, nombre, orden)
values
  (1, 'Preescolar', 1),
  (2, 'Primero', 2),
  (3, 'Segundo', 3),
  (4, 'Tercero', 4),
  (5, 'Cuarto', 5),
  (6, 'Quinto', 6),
  (7, 'Sexto', 7),
  (8, 'Septimo', 8),
  (9, 'Octavo', 9),
  (10, 'Noveno', 10),
  (11, 'Decimo', 11),
  (12, 'Undecimo', 12)
on conflict (id) do update set nombre = excluded.nombre, orden = excluded.orden;

insert into public.periodos (id, nombre, numero)
values
  (1, 'Periodo 1', 1),
  (2, 'Periodo 2', 2),
  (3, 'Periodo 3', 3),
  (4, 'Periodo 4', 4)
on conflict (id) do update set nombre = excluded.nombre, numero = excluded.numero;

insert into public.materias (nombre)
values
  ('Matematicas'),
  ('Espanol'),
  ('Ingles'),
  ('Ciencias Naturales'),
  ('Ciencias Sociales'),
  ('Tecnologia'),
  ('Educacion Fisica'),
  ('Artistica'),
  ('Etica')
on conflict (nombre) do nothing;

insert into public.grado_materias (grado_id, materia_id)
select g.id, m.id
from public.grados g
cross join public.materias m
on conflict (grado_id, materia_id) do nothing;

insert into public.profesores (nombre, apellidos, numero_documento, estado)
values
  ('Ana Maria', 'Rios Gomez', '1001001001', 'activo'),
  ('Carlos Andres', 'Gomez Perez', '1001001002', 'activo'),
  ('Luz Elena', 'Martinez Castro', '1001001003', 'activo'),
  ('Miguel Angel', 'Torres Ramirez', '1001001004', 'activo'),
  ('Patricia Fernanda', 'Lopez Herrera', '1001001005', 'activo')
on conflict (numero_documento) do update set
  nombre = excluded.nombre,
  apellidos = excluded.apellidos,
  estado = excluded.estado;

with student_seed as (
  select nombre, apellidos, numero_documento, grado_id, estado
  from (
    values
      ('Juan Daniel', 'Villa', '1046907616', 6::smallint, 'activo')
  ) as manual(nombre, apellidos, numero_documento, grado_id, estado)

  union all

  select
    nombres[((n - 1) % array_length(nombres, 1)) + 1],
    apellido_uno[(((n - 1) * 5) % array_length(apellido_uno, 1)) + 1] || ' ' ||
      apellido_dos[(((n - 1) * 7) % array_length(apellido_dos, 1)) + 1],
    (1046908000 + n)::text,
    (((n - 1) % 12) + 1)::smallint,
    'activo'
  from generate_series(1, 119) as series(n)
  cross join (
    select
      array[
        'Samuel Andres',
        'Maria Jose',
        'Santiago',
        'Valentina',
        'Sebastian',
        'Isabella',
        'Mateo',
        'Camila',
        'Nicolas',
        'Luciana',
        'Daniel Felipe',
        'Mariana',
        'Emmanuel',
        'Salome',
        'David Alejandro',
        'Gabriela',
        'Tomas'
      ]::text[] as nombres,
      array[
        'Garcia',
        'Rodriguez',
        'Martinez',
        'Lopez',
        'Gomez',
        'Perez',
        'Sanchez',
        'Ramirez',
        'Torres',
        'Diaz',
        'Vargas',
        'Castro',
        'Moreno',
        'Rojas',
        'Herrera',
        'Molina',
        'Ortiz',
        'Jimenez',
        'Ruiz'
      ]::text[] as apellido_uno,
      array[
        'Restrepo',
        'Hernandez',
        'Quintero',
        'Cardona',
        'Arias',
        'Mendez',
        'Cano',
        'Giraldo',
        'Mejia',
        'Suarez',
        'Velasquez',
        'Montoya',
        'Ospina',
        'Londono',
        'Cifuentes',
        'Agudelo',
        'Florez',
        'Valencia',
        'Barrera',
        'Escobar',
        'Serna',
        'Pineda',
        'Salazar',
        'Duque'
      ]::text[] as apellido_dos
  ) as catalog
)
insert into public.estudiantes (nombre, apellidos, numero_documento, grado_id, estado)
select nombre, apellidos, numero_documento, grado_id, estado
from student_seed
on conflict (numero_documento) do update set
  nombre = excluded.nombre,
  apellidos = excluded.apellidos,
  grado_id = excluded.grado_id,
  estado = excluded.estado;

select public.refresh_academic_rollups();

-- Accesos iniciales para probar:
-- Profesor: cedula 1001001001
-- Estudiante: documento 1046907616
