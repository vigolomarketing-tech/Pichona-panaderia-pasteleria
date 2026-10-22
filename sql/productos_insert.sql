-- ============================================================================
-- Pichona — panel administrativo: permiso para crear productos
-- ============================================================================
-- Migración incremental — correr UNA sola vez, DESPUÉS de sql/schema.sql,
-- en: Supabase Dashboard → tu proyecto → SQL Editor → pegar todo este
-- archivo → Run.
--
-- Qué hace:
--   sql/schema.sql dejó la tabla `productos` con Row Level Security
--   activado, pero solo con políticas de lectura pública y de UPDATE para
--   usuarios logueados — no existía ninguna política de INSERT, así que
--   Supabase rechazaba cualquier intento de crear un producto nuevo desde
--   el panel ("new row violates row-level security policy"). Esto agrega
--   esa política, con el mismo criterio que ya se usa para editar
--   (cualquier usuario logueado puede insertar — hoy hay una sola dueña).
-- ============================================================================

drop policy if exists "Usuarios logueados pueden crear productos" on public.productos;
create policy "Usuarios logueados pueden crear productos"
  on public.productos for insert
  with check (auth.role() = 'authenticated');
