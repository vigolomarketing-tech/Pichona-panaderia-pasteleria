-- ============================================================================
-- Pichona — panel administrativo: imágenes decorativas del sitio
-- ============================================================================
-- Migración incremental — correr UNA sola vez, DESPUÉS de sql/schema.sql,
-- en: Supabase Dashboard → tu proyecto → SQL Editor → pegar todo este
-- archivo → Run.
--
-- Qué hace:
--   1. Crea la tabla `site_images`, con una fila fija por cada una de las
--      4 imágenes decorativas de la galería debajo del hero (no son fotos
--      de producto, por eso van en su propia tabla y no en `productos`).
--   2. Activa Row Level Security: lectura pública, edición solo
--      autenticado (mismo criterio que `productos`).
--   3. Reutiliza el bucket de Storage `productos-fotos` que ya existe
--      (mismas políticas de lectura pública / subida autenticada —
--      no hace falta crear un bucket nuevo).
--   4. Carga las 4 filas iniciales apuntando a los archivos fijos que ya
--      trae el sitio, para que no se vea nada distinto hasta que alguien
--      suba una foto nueva desde el panel.
--
-- La imagen del hero (la persiana) queda afuera de esto a propósito: no
-- tiene fila acá ni botón en el panel — se sigue reemplazando a mano en
-- el código.
-- ============================================================================

-- 1) Tabla de imágenes del sitio ---------------------------------------------

create table if not exists public.site_images (
  id text primary key,
  label text not null,
  imagen text,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_images_set_updated_at on public.site_images;
create trigger site_images_set_updated_at
  before update on public.site_images
  for each row execute function public.set_updated_at();

-- 2) Row Level Security -------------------------------------------------------

alter table public.site_images enable row level security;

drop policy if exists "Lectura pública de imágenes del sitio" on public.site_images;
create policy "Lectura pública de imágenes del sitio"
  on public.site_images for select
  using (true);

drop policy if exists "Usuarios logueados pueden editar imágenes del sitio" on public.site_images;
create policy "Usuarios logueados pueden editar imágenes del sitio"
  on public.site_images for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 3) Carga inicial: las 4 fotos decorativas -----------------------------------

insert into public.site_images (id, label, imagen)
values
  ('petit-fours-1', 'Galería — Petit fours', 'assets/img/petit-fours-1.jpg'),
  ('tartitas-1', 'Galería — Tartitas individuales', 'assets/img/tartitas-1.jpg'),
  ('vitrina', 'Galería — Vitrina de productos', 'assets/img/vitrina.jpg'),
  ('budines', 'Galería — Budines', 'assets/img/budines.jpg')
on conflict (id) do nothing;
