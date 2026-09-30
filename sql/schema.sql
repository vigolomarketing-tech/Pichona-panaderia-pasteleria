-- ============================================================================
-- Pichona — panel administrativo: esquema de Supabase
-- ============================================================================
-- Ejecutar UNA sola vez en: Supabase Dashboard → tu proyecto → SQL Editor
-- → pegar todo este archivo → Run.
--
-- Qué hace:
--   1. Crea la tabla `productos` (mismos campos que ya usaba js/data.js).
--   2. Activa Row Level Security: lectura pública, edición solo autenticado.
--   3. Crea el bucket de Storage para las fotos de producto, con sus
--      políticas (lectura pública, subida solo autenticado).
--   4. Carga los 64 productos actuales con sus precios y fotos actuales,
--      para que el panel arranque mostrando exactamente el mismo catálogo
--      que ya está publicado (no pisa nada si ya corriste esto antes).
-- ============================================================================

-- 1) Tabla de productos ------------------------------------------------------

create table if not exists public.productos (
  id text primary key,
  nombre text not null,
  precio numeric,
  unidad text not null,
  descripcion text,
  categoria text not null,
  imagen text,
  destacado boolean not null default false,
  disponible boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Mantiene updated_at al día en cada edición desde el panel.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists productos_set_updated_at on public.productos;
create trigger productos_set_updated_at
  before update on public.productos
  for each row execute function public.set_updated_at();

-- 2) Row Level Security -------------------------------------------------------

alter table public.productos enable row level security;

drop policy if exists "Lectura pública de productos" on public.productos;
create policy "Lectura pública de productos"
  on public.productos for select
  using (true);

-- Cualquier usuario logueado puede editar (por ahora hay un solo usuario:
-- la dueña del negocio). Si el día de mañana hay más de un usuario y
-- quieren limitarlo, acá es donde se restringe por auth.uid().
drop policy if exists "Usuarios logueados pueden editar productos" on public.productos;
create policy "Usuarios logueados pueden editar productos"
  on public.productos for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 3) Storage: bucket y políticas para las fotos de producto ------------------

insert into storage.buckets (id, name, public)
values ('productos-fotos', 'productos-fotos', true)
on conflict (id) do nothing;

drop policy if exists "Lectura pública de fotos de productos" on storage.objects;
create policy "Lectura pública de fotos de productos"
  on storage.objects for select
  using (bucket_id = 'productos-fotos');

drop policy if exists "Usuarios logueados suben fotos de productos" on storage.objects;
create policy "Usuarios logueados suben fotos de productos"
  on storage.objects for insert
  with check (bucket_id = 'productos-fotos' and auth.role() = 'authenticated');

drop policy if exists "Usuarios logueados reemplazan fotos de productos" on storage.objects;
create policy "Usuarios logueados reemplazan fotos de productos"
  on storage.objects for update
  using (bucket_id = 'productos-fotos' and auth.role() = 'authenticated')
  with check (bucket_id = 'productos-fotos' and auth.role() = 'authenticated');

-- 4) Carga inicial: el catálogo actual (64 productos) ------------------------
-- Las fotos "assets/img/..." son las que ya vienen con el sitio (o los
-- placeholders de "imagen pendiente"). Cuando alguien suba una foto nueva
-- desde el panel, esta columna pasa a tener la URL pública de Supabase
-- Storage — el sitio funciona igual con cualquiera de las dos formas.

insert into public.productos (id, nombre, precio, unidad, descripcion, categoria, imagen, destacado, disponible)
values
  ('pan-campo', 'Pan de campo', 2200, 'unidad', 'Pan de campo artesanal, corteza crocante y miga tierna.', 'panaderia', 'assets/img/vitrina.jpg', false, true),
  ('pan-integral', 'Pan integral', 3800, 'unidad', 'Pan integral de harinas seleccionadas.', 'panaderia', 'assets/img/vitrina.jpg', false, true),
  ('pan-frances', 'Pan francés', 3600, 'kilo', 'Clásico pan francés, ideal para toda ocasión.', 'panaderia', 'assets/img/vitrina.jpg', false, true),
  ('figacitas', 'Figacitas', 5000, 'kilo', 'Figacitas surtidas, todas las variedades.', 'panaderia', 'assets/img/vitrina.jpg', false, true),
  ('pan-relleno', 'Pan relleno', 8000, 'unidad', 'Sabores: panceta y cebolla / puerro y roquefort / ajo y manteca / caprese.', 'panaderia', 'assets/img/panes-rellenos.jpg', true, true),
  ('cremona-manteca', 'Cremona de manteca', 12000, 'kilo', 'Cremona bien mantecosa, hojaldrada.', 'panaderia', 'assets/img/vitrina.jpg', false, true),
  ('cremona-grasa', 'Cremona de grasa', 9000, 'kilo', 'Cremona tradicional de grasa.', 'panaderia', 'assets/img/vitrina.jpg', false, true),
  ('facturas', 'Facturas', 14000, 'docena', 'Surtidas. También se venden por unidad a $1.500 hasta media docena.', 'panaderia', 'assets/img/vitrina.jpg', true, true),
  ('chipa', 'Chipá', 8000, 'cuarto kilo', 'Chipá recién horneado.', 'panaderia', 'assets/img/vitrina.jpg', false, true),
  ('pan-chocolate', 'Pan de chocolate', 3000, 'unidad', 'Pan relleno con chocolate.', 'panaderia', 'assets/img/vitrina.jpg', false, true),
  ('budines', 'Budines', 9000, 'unidad', 'Naranja / limón / mandarina con chips de chocolate 80% / algarroba con banana y dulce de leche inyectado / vainilla.', 'pasteleria', 'assets/img/budines.jpg', true, true),
  ('budines-especiales', 'Budines especiales', 11000, 'unidad', 'Carrot con nuez / zapallo / batata y chocolate.', 'pasteleria', 'assets/img/budines.jpg', false, true),
  ('alfajores-euge', 'Alfajores by Euge', 3000, 'unidad', 'Blanco y negro.', 'pasteleria', 'assets/img/alfajores-blanco.jpg', true, true),
  ('alfajores-cocon', 'Alfajores Café Gran Cocon', 3000, 'unidad', 'Directo desde Chubut.', 'pasteleria', 'assets/img/alfajores-negro.jpg', false, true),
  ('crumble-frutos-rojos', 'Crumble de frutos rojos', 5000, 'porción', 'Crumble casero con frutos rojos.', 'pasteleria', 'assets/img/vitrina.jpg', false, true),
  ('brownies-con-nuez', 'Brownies con nuez', 6000, 'unidad', 'Brownie húmedo con nuez.', 'pasteleria', 'assets/img/vitrina.jpg', false, true),
  ('brownies-sin-nuez', 'Brownies sin nuez', 5000, 'unidad', 'Brownie húmedo sin nuez.', 'pasteleria', 'assets/img/vitrina.jpg', false, true),
  ('torta-avellanas', 'Torta de avellanas', 6000, '100 gr', 'Torta de avellanas.', 'pasteleria', 'assets/img/vitrina.jpg', false, true),
  ('stollen', 'Stollen', 20000, 'medio kilo', 'Pan dulce alemán con frutos secos y azúcar impalpable.', 'pasteleria', 'assets/img/pan-dulce.jpg', false, true),
  ('barritas-limon-coco', 'Barritas de limón / coco', 2500, 'unidad', 'Barritas de limón o de coco.', 'pasteleria', 'assets/img/vitrina.jpg', false, true),
  ('florentinos-cascaritas', 'Florentinos y cascaritas', 6000, '100 gr', 'Florentinos y cascaritas confitadas.', 'pasteleria', 'assets/img/vitrina.jpg', false, true),
  ('biscotti', 'Biscotti', 2500, '50 gr', 'Biscotti crocante.', 'pasteleria', 'assets/img/vitrina.jpg', false, true),
  ('bombones-nuez-datiles', 'Bombones de nuez y dátiles', 8000, '100 gr', 'Bombones artesanales de nuez y dátiles.', 'pasteleria', 'assets/img/vitrina.jpg', false, true),
  ('pan-dulce-genoves', 'Pan dulce genovés Pichona', null, 'medio kilo', 'Receta de Teresa Lanzillotta, campeona nacional FITEHP 2024. Presentación especial Pichona de medio kilo. Producto de temporada — consultar disponibilidad y precio.', 'pasteleria', 'assets/img/pan-dulce.jpg', true, false),
  ('torta-bomba', 'Torta bomba (20 cm)', 60000, 'unidad', 'Torta bomba para mesa dulce, 20 cm.', 'pasteleria', 'assets/img/vitrina.jpg', false, true),
  ('torta-franui', 'Torta Franui (20 cm)', 70000, 'unidad', 'Torta Franui para mesa dulce, 20 cm.', 'pasteleria', 'assets/img/vitrina.jpg', false, true),
  ('torta-cheesecake', 'Torta cheesecake (20 cm)', 60000, 'unidad', 'Cheesecake para mesa dulce, 20 cm.', 'pasteleria', 'assets/img/vitrina.jpg', false, true),
  ('torta-ricota-pastafrola', 'Torta de ricota / pastafrola (20 cm)', 35000, 'unidad', 'Torta de ricota o pastafrola, 20 cm.', 'pasteleria', 'assets/img/vitrina.jpg', false, true),
  ('torta-crumble', 'Torta crumble (20 cm)', 45000, 'unidad', 'Torta crumble para mesa dulce, 20 cm.', 'pasteleria', 'assets/img/vitrina.jpg', false, true),
  ('torta-lemon-pie', 'Torta lemon pie (20 cm)', 45000, 'unidad', 'Torta lemon pie para mesa dulce, 20 cm.', 'pasteleria', 'assets/img/vitrina.jpg', false, true),
  ('torta-ganache-dulce-leche', 'Torta ganache con dulce de leche (20 cm)', 45000, 'unidad', 'Torta de ganache con dulce de leche, 20 cm.', 'pasteleria', 'assets/img/vitrina.jpg', false, true),
  ('torta-coco-dulce-leche', 'Torta coco y dulce de leche (20 cm)', 45000, 'unidad', 'Torta de coco y dulce de leche, 20 cm.', 'pasteleria', 'assets/img/vitrina.jpg', false, true),
  ('torta-pastelera-frutilla', 'Torta pastelera y frutilla (20 cm)', 45000, 'unidad', 'Torta de crema pastelera y frutilla, 20 cm.', 'pasteleria', 'assets/img/vitrina.jpg', false, true),
  ('petit-fours', 'Petit fours', 50000, 'kilo', 'Surtido de petit fours artesanales.', 'petit-fours-tartitas', 'assets/img/petit-fours-1.jpg', true, true),
  ('tartita-ricota', 'Tartita individual de ricota', 6000, 'unidad', 'Tartita individual de ricota.', 'petit-fours-tartitas', 'assets/img/tartitas-1.jpg', false, true),
  ('tartita-crumble', 'Tartita individual de crumble', 10000, 'unidad', 'Tartita individual de crumble.', 'petit-fours-tartitas', 'assets/img/tartitas-1.jpg', false, true),
  ('tartita-ganache', 'Tartita individual de ganache', 10000, 'unidad', 'Tartita individual de ganache.', 'petit-fours-tartitas', 'assets/img/tartitas-1.jpg', false, true),
  ('tartita-chocolate', 'Tartita individual de chocolate', 10000, 'unidad', 'Tartita individual de chocolate.', 'petit-fours-tartitas', 'assets/img/tartitas-2.jpg', false, true),
  ('tartita-dulce-leche', 'Tartita individual de dulce de leche', 10000, 'unidad', 'Tartita individual de dulce de leche.', 'petit-fours-tartitas', 'assets/img/tartitas-2.jpg', false, true),
  ('tartita-lemon-pie', 'Tartita individual de lemon pie', 11000, 'unidad', 'Tartita individual de lemon pie.', 'petit-fours-tartitas', 'assets/img/tartitas-2.jpg', false, true),
  ('tartita-cheesecake', 'Tartita individual de cheesecake', 11000, 'unidad', 'Tartita individual de cheesecake.', 'petit-fours-tartitas', 'assets/img/tartitas-2.jpg', false, true),
  ('tartita-bomba', 'Tartita individual bomba', 11000, 'unidad', 'Tartita individual bomba.', 'petit-fours-tartitas', 'assets/img/tartitas-1.jpg', false, true),
  ('tartita-franui', 'Tartita individual Franui', 14000, 'unidad', 'Tartita individual Franui.', 'petit-fours-tartitas', 'assets/img/tartitas-1.jpg', true, true),
  ('scones-roquefort', 'Scones de queso roquefort', 8000, 'cuarto kilo', 'Scones de queso roquefort.', 'salados', 'assets/img/snacks-salados.jpg', false, true),
  ('galletas-hierbas', 'Galletas de hierbas', 3500, '100 gr', 'Galletas saladas de hierbas.', 'salados', 'assets/img/snacks-salados.jpg', false, true),
  ('galletas-miel', 'Galletas de miel', 4500, 'cuarto kilo', 'Galletas de miel.', 'salados', 'assets/img/snacks-salados.jpg', false, true),
  ('bizcochitos', 'Bizcochitos', 4000, 'cuarto kilo', 'Bizcochitos tradicionales.', 'salados', 'assets/img/snacks-salados.jpg', false, true),
  ('palmeritas', 'Palmeritas', 4000, '150 gr', 'Palmeritas hojaldradas.', 'salados', 'assets/img/snacks-salados.jpg', false, true),
  ('tostadas-focaccia', 'Tostadas de focaccia', 3500, '150 gr', 'Tostadas de focaccia crocantes.', 'salados', 'assets/img/focaccia.jpg', false, true),
  ('snacks-frutos-secos', 'Snacks salados de frutos secos', 8000, '100 gr', 'Snacks salados de frutos secos.', 'salados', 'assets/img/snacks-salados.jpg', false, true),
  ('prepizza-tomate', 'Prepizza de tomate', 2000, 'unidad', 'Prepizza con salsa de tomate.', 'salados', 'assets/img/snacks-salados.jpg', false, true),
  ('prepizza-cebolla', 'Prepizza de cebolla', 2500, 'unidad', 'Prepizza de cebolla.', 'salados', 'assets/img/snacks-salados.jpg', false, true),
  ('prepizza-mixta', 'Prepizza mixta', 2300, 'unidad', 'Prepizza mixta.', 'salados', 'assets/img/snacks-salados.jpg', false, true),
  ('tarta-verdura-individual', 'Tarta de verdura individual', 6000, 'unidad', 'Zapallito y zanahoria / espinaca / zapallo y puerro.', 'salados', 'assets/img/snacks-salados.jpg', false, true),
  ('tarta-verdura-hongos', 'Tarta de verdura con hongos', 7000, 'unidad', 'Tarta de verdura con hongos.', 'salados', 'assets/img/snacks-salados.jpg', false, true),
  ('focaccia', 'Focaccia', 6000, 'unidad', 'Focaccia artesanal.', 'salados', 'assets/img/focaccia.jpg', true, true),
  ('sandwiches-miga', 'Sándwiches de miga', 4000, 'unidad', 'Sándwiches de miga surtidos.', 'salados', 'assets/img/snacks-salados.jpg', false, true),
  ('fosforitos', 'Fosforitos de jamón y queso', 5000, 'unidad', 'Fosforitos de jamón y queso.', 'salados', 'assets/img/snacks-salados.jpg', false, true),
  ('medialunas-jyq', 'Medialunas con jamón y queso', 3000, 'unidad', 'Medialunas rellenas de jamón y queso.', 'salados', 'assets/img/snacks-salados.jpg', false, true),
  ('dulce-frutos-rojos', 'Dulce casero de frutos rojos / frambuesa', 12000, 'unidad', 'Dulce casero de frutos rojos o frambuesa.', 'almacen', 'assets/img/dulces-caseros.jpg', false, true),
  ('dulce-frutilla', 'Dulce casero de frutilla', 10000, 'unidad', 'Dulce casero de frutilla.', 'almacen', 'assets/img/dulces-caseros.jpg', false, true),
  ('berenjenas-agridulces', 'Berenjenas agridulces', 6000, 'unidad', 'Berenjenas agridulces caseras.', 'almacen', 'assets/img/dulces-caseros.jpg', false, true),
  ('girgolas-encargo', 'Gírgolas (por encargo)', 6000, 'caja de un cuarto', 'Gírgolas frescas, por encargo.', 'almacen', 'assets/img/dulces-caseros.jpg', false, true),
  ('girgolas-escabeche', 'Gírgolas en escabeche', 7000, 'unidad', 'Gírgolas en escabeche casero.', 'almacen', 'assets/img/dulces-caseros.jpg', false, true)
on conflict (id) do nothing;
