-- ============================================================================
-- Pichona — panel administrativo: categorías con nombre editable
-- ============================================================================
-- Migración incremental — correr UNA sola vez, DESPUÉS de sql/schema.sql,
-- en: Supabase Dashboard → tu proyecto → SQL Editor → pegar todo este
-- archivo → Run.
--
-- Qué hace:
--   1. Crea la tabla `categorias`, con una fila por cada categoría del
--      catálogo. El `id` es el mismo identificador interno que ya usa
--      cada producto en su columna `categoria` (panaderia, pasteleria,
--      petit-fours-tartitas, salados, almacen) — ESE no cambia nunca
--      desde el panel, así los productos siguen asociados sin tocar
--      nada. Lo único editable es `nombre`, la etiqueta que se ve en
--      los filtros del panel y del catálogo público.
--   2. Activa Row Level Security: lectura pública, edición solo
--      autenticado (mismo criterio que el resto de las tablas).
--   3. Suma los GRANT explícitos de select (anon + authenticated) y
--      update (authenticated) — en este proyecto las tablas nuevas no
--      quedan expuestas solas con solo crear las políticas de RLS, hace
--      falta este paso aparte (ya pasó antes con "permission denied").
--   4. Carga las 5 categorías actuales con su nombre de hoy, para que el
--      panel y el sitio arranquen mostrando exactamente lo mismo que ya
--      está publicado hasta que alguien edite algún nombre.
--
-- No hace falta tocar nada de esto para agregar categorías nuevas ni
-- para borrar — por ahora el panel solo permite renombrar las 5 que ya
-- existen.
-- ============================================================================

create table if not exists public.categorias (
  id text primary key,
  nombre text not null,
  updated_at timestamptz not null default now()
);

drop trigger if exists categorias_set_updated_at on public.categorias;
create trigger categorias_set_updated_at
  before update on public.categorias
  for each row execute function public.set_updated_at();

-- Row Level Security -----------------------------------------------------

alter table public.categorias enable row level security;

drop policy if exists "Lectura pública de categorías" on public.categorias;
create policy "Lectura pública de categorías"
  on public.categorias for select
  using (true);

drop policy if exists "Usuarios logueados pueden editar categorías" on public.categorias;
create policy "Usuarios logueados pueden editar categorías"
  on public.categorias for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Permisos explícitos (además de RLS) -------------------------------------

grant select on public.categorias to anon, authenticated;
grant update on public.categorias to authenticated;

-- Carga inicial: las 5 categorías actuales --------------------------------

insert into public.categorias (id, nombre)
values
  ('panaderia', 'Panadería'),
  ('pasteleria', 'Pastelería'),
  ('petit-fours-tartitas', 'Petit fours y tartitas'),
  ('salados', 'Salados'),
  ('almacen', 'Almacén')
on conflict (id) do nothing;
