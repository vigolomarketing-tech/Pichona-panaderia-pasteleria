-- ============================================================================
-- Pichona — panel administrativo: catering editable (combos y pedidos)
-- ============================================================================
-- Migración incremental — correr UNA sola vez, DESPUÉS de sql/schema.sql,
-- en: Supabase Dashboard → tu proyecto → SQL Editor → pegar todo este
-- archivo → Run.
--
-- Qué hace:
--   1. Crea la tabla `catering_combos` (Lunch Box 20 personas, Caja de 30
--      bocaditos, Un toque gourmet, Mesa dulce) y `catering_pedidos`
--      (sándwiches de figacitas, medialunas rellenas, pizzetas, empanadas
--      de copetín) — los dos bloques de texto de la sección de catering
--      que hoy están fijos en js/data.js.
--      El `id` de cada fila es el mismo identificador interno que ya
--      usaba cada combo/pedido en el código — no cambia nunca desde el
--      panel, solo sus campos de texto/precio. La columna `orden` es la
--      que define en qué posición se muestra cada uno (no se reordena
--      desde el panel por ahora, pero queda lista la columna).
--      `incluye` (solo en combos) guarda la lista de ítems como texto
--      plano con un ítem por línea (separados por salto de línea), igual
--      que se edita en el textarea del panel.
--   2. Activa Row Level Security: lectura pública, edición solo
--      autenticado (mismo criterio que el resto de las tablas).
--   3. Suma los GRANT explícitos de select (anon + authenticated) y
--      update (authenticated) — en este proyecto una tabla nueva no
--      queda expuesta sola con solo crear las políticas de RLS, hace
--      falta este paso aparte (ya pasó antes con "permission denied").
--   4. Carga el contenido actual tal cual está hoy en js/data.js —
--      INCLUIDOS los precios actuales, a propósito: no se tocan acá,
--      se corrigen después desde el panel (o los pasa la clienta y los
--      cargo yo).
--
-- Las fotos de los combos NO viven acá — se siguen manejando desde la
-- tabla `site_images` (sección "Imágenes del sitio" del panel), tal
-- como ya funcionaba.
--
-- No hace falta tocar nada de esto para agregar o borrar combos/pedidos
-- — por ahora el panel solo permite editar el contenido de los que ya
-- existen.
-- ============================================================================

-- 1) Tablas ------------------------------------------------------------------

create table if not exists public.catering_combos (
  id text primary key,
  nombre text not null,
  precio numeric,
  unidad text not null,
  descripcion text,
  incluye text not null default '',
  orden integer not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.catering_pedidos (
  id text primary key,
  nombre text not null,
  precio numeric,
  descripcion text,
  orden integer not null,
  updated_at timestamptz not null default now()
);

drop trigger if exists catering_combos_set_updated_at on public.catering_combos;
create trigger catering_combos_set_updated_at
  before update on public.catering_combos
  for each row execute function public.set_updated_at();

drop trigger if exists catering_pedidos_set_updated_at on public.catering_pedidos;
create trigger catering_pedidos_set_updated_at
  before update on public.catering_pedidos
  for each row execute function public.set_updated_at();

-- 2) Row Level Security -------------------------------------------------------

alter table public.catering_combos enable row level security;
alter table public.catering_pedidos enable row level security;

drop policy if exists "Lectura pública de combos de catering" on public.catering_combos;
create policy "Lectura pública de combos de catering"
  on public.catering_combos for select
  using (true);

drop policy if exists "Usuarios logueados pueden editar combos de catering" on public.catering_combos;
create policy "Usuarios logueados pueden editar combos de catering"
  on public.catering_combos for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Lectura pública de pedidos personalizados de catering" on public.catering_pedidos;
create policy "Lectura pública de pedidos personalizados de catering"
  on public.catering_pedidos for select
  using (true);

drop policy if exists "Usuarios logueados pueden editar pedidos de catering" on public.catering_pedidos;
create policy "Usuarios logueados pueden editar pedidos de catering"
  on public.catering_pedidos for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 3) Permisos explícitos (además de RLS) --------------------------------------

grant select on public.catering_combos to anon, authenticated;
grant update on public.catering_combos to authenticated;

grant select on public.catering_pedidos to anon, authenticated;
grant update on public.catering_pedidos to authenticated;

-- 4) Carga inicial: el contenido actual, precios incluidos --------------------

insert into public.catering_combos (id, nombre, precio, unidad, descripcion, incluye, orden)
values
  (
    'lunch-box-20',
    'Lunch Box 20 personas',
    280000,
    'combo',
    'Ideal para reuniones familiares o laborales.',
    '1 docena de medialunas de jamón y queso
1 docena de medialunas de jamón crudo y rúcula
2 docenas de sándwiches de peceto y tomate
2 docenas de pizzetas con tomate
2 docenas de empanaditas de carne
60 bocaditos calientes
60 bocaditos fríos',
    1
  ),
  (
    'caja-30-bocaditos',
    'Caja de 30 bocaditos',
    60000,
    'caja',
    'Tres variedades por caja, comen 3 personas. Para eventos, picadas o reuniones.',
    '3 variedades de bocaditos a elección',
    2
  ),
  (
    'toque-gourmet',
    'Un toque gourmet',
    25000,
    '10 unidades',
    'Experiencia premium que se puede agregar a cualquier propuesta.',
    'Roll de pan de miga con salmón rosado y palta
Langostinos bahianos con salsa tamarindo',
    3
  ),
  (
    'mesa-dulce',
    'Mesa dulce',
    null,
    'a medida',
    'Armamos tu mesa dulce combinando nuestras tortas de 20 cm, petit fours y tartitas individuales. Consultanos según cantidad de invitados.',
    'Tortas de 20 cm a elección
Petit fours
Tartitas individuales',
    4
  )
on conflict (id) do nothing;

insert into public.catering_pedidos (id, nombre, precio, descripcion, orden)
values
  ('sandwiches-figacitas', 'Sándwiches de figacitas (x12)', 25000, 'Pan de 6 cm. Jamón y queso / pollo y apio / peceto y tomate / berenjenas, tomate, albahaca y queso.', 1),
  ('medialunas-rellenas', 'Medialunas rellenas (x12)', 30000, 'Jamón y queso / crudo y rúcula / caprese.', 2),
  ('pizzetas', 'Pizzetas (x12)', 12000, 'Pizzetas para picada o evento.', 3),
  ('empanadas-copetin', 'Empanadas de copetín (x12)', 14000, 'Empanadas de copetín.', 4)
on conflict (id) do nothing;
