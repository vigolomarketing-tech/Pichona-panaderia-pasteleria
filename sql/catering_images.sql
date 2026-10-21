-- ============================================================================
-- Pichona — panel administrativo: imágenes de catering
-- ============================================================================
-- Migración incremental — correr UNA sola vez, DESPUÉS de sql/schema.sql y
-- sql/site_images.sql, en: Supabase Dashboard → tu proyecto → SQL Editor
-- → pegar todo este archivo → Run.
--
-- Qué hace:
--   1. Agrega las columnas `aspecto_ancho` / `aspecto_alto` a la tabla
--      `site_images`, para que el panel sepa con qué proporción recortar
--      cada imagen al subirla (las 4 que ya existían son cuadradas 1:1 —
--      quedan con ese valor por default, no hace falta tocarlas).
--   2. Carga 3 filas nuevas para las fotos de catering que todavía eran
--      placeholders sin editor: "Lunch Box 20 personas" y "Un toque
--      gourmet" comparten la misma foto de fábrica (bocaditos-frios.jpg),
--      así que comparten también la misma fila — subir una foto nueva
--      actualiza las dos tarjetas de catering a la vez. "Caja de 30
--      bocaditos" y "Mesa dulce" tienen cada una la suya.
--      Estas 3 son rectangulares 4:3 (la proporción real con la que se
--      muestran las tarjetas de combo en el sitio, sin importar el
--      tamaño del placeholder original).
-- ============================================================================

alter table public.site_images
  add column if not exists aspecto_ancho integer not null default 1,
  add column if not exists aspecto_alto integer not null default 1;

insert into public.site_images (id, label, imagen, aspecto_ancho, aspecto_alto)
values
  ('bocaditos-frios', 'Catering — Bocaditos fríos (Lunch Box 20 personas / Un toque gourmet)', 'assets/img/bocaditos-frios.jpg', 4, 3),
  ('bocaditos-calientes', 'Catering — Bocaditos calientes (Caja de 30 bocaditos)', 'assets/img/bocaditos-calientes.jpg', 4, 3),
  ('petit-fours-2', 'Catering — Mesa dulce', 'assets/img/petit-fours-2.jpg', 4, 3)
on conflict (id) do nothing;
