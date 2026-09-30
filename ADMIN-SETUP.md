# Panel de administración — puesta en marcha (para Santiago)

Este documento es técnico, para vos. El `README.md` del repo tiene la versión en criollo para Euge.

## Qué se construyó

- `admin/index.html` + `admin/admin.css` + `admin/admin.js` — el panel: login (Supabase Auth) + edición de precio y foto de cada producto.
- `js/supabase-config.js` — el único archivo con las credenciales de conexión (hoy vacío, hay que completarlo).
- `sql/schema.sql` — crea la tabla `productos`, las políticas de seguridad (RLS), el bucket de fotos y carga los 64 productos que ya estaban en `js/data.js` con sus precios y fotos actuales.
- `js/app.js` — el sitio público ahora intenta traer el catálogo en vivo desde Supabase; si `supabase-config.js` está vacío o falla la conexión, sigue mostrando el catálogo fijo de `js/data.js` como hasta ahora (no rompe nada si todavía no hiciste este setup).

**No creé ningún proyecto de Supabase** — no tengo forma de acceder a una cuenta de Supabase tuya, así que ese paso es tuyo. Tampoco toqué `js/data.js` ni el resto del sitio salvo lo necesario para conectar esto (agregar el script de Supabase en `index.html` y el link a `/admin/` en el footer).

## Paso 1 — Crear el proyecto de Supabase

1. Andá a [supabase.com](https://supabase.com) y creá una cuenta (o entrá si ya tenés una).
2. Creá un proyecto nuevo (el plan gratuito alcanza de sobra para esto). Elegí una contraseña de base de datos y guardala en algún lugar seguro — no se vuelve a usar acá pero convine tenerla.
3. Esperá a que termine de aprovisionarse (1-2 minutos).

## Paso 2 — Conectar el sitio con el proyecto

1. En el dashboard del proyecto: **Project Settings → API**.
2. Copiá dos valores:
   - **Project URL** (algo como `https://xxxxxxxxxxxx.supabase.co`)
   - **anon public** key (una clave larga tipo JWT)
3. Pegalos en `js/supabase-config.js`:
   ```js
   window.SUPABASE_CONFIG = {
     url: "https://xxxxxxxxxxxx.supabase.co",
     anonKey: "eyJhbGciOi..."
   };
   ```
4. **Estos dos valores no son secretos** — están diseñados para vivir en el navegador de cualquier visitante del sitio (por eso se llaman "anon"/públicos). La seguridad la dan las políticas de Row Level Security del paso 3, no el secreto de esta clave.
5. **Nunca** pegues acá la clave `service_role` del mismo panel — esa sí es secreta, da acceso total saltándose todas las reglas de seguridad, y no la necesitamos para nada de esto.

## Paso 3 — Crear la tabla, las políticas y cargar el catálogo

1. En el dashboard: **SQL Editor → New query**.
2. Abrí el archivo `sql/schema.sql` de este repo, copiá **todo** su contenido, y pegalo en el editor.
3. Click en **Run**.
4. Si salió bien, deberías ver una tabla `productos` con 64 filas en **Table Editor**, y un bucket `productos-fotos` en **Storage**.

Este script es seguro de correr una sola vez; si lo corrés de nuevo no duplica los productos (usa `on conflict (id) do nothing`), pero si ya hiciste cambios de precios desde el panel, correrlo de nuevo **no los pisa** tampoco, porque el `insert` solo actúa si el `id` no existe todavía.

## Paso 4 — Crear el usuario de Euge

Vos das de alta el usuario desde el dashboard — no hace falta tocar código para esto, y es la forma más segura (evita tener que exponer nada en el sitio para que alguien se registre solo):

1. **Authentication → Users → Add user → Create new user**.
2. Completá su email y una contraseña.
3. **Importante:** tildá la opción **"Auto Confirm User"** (o equivalente, según la versión del dashboard). Si no la tildás, Supabase le va a pedir confirmar el mail por un link antes de dejarla entrar — y como el sitio no tiene flujo de registro/confirmación, quedaría trabada sin poder loguearse.
4. Guardá. Con eso ya existe el único usuario admin.

Si el día de mañana Euge quiere cambiar su contraseña, se hace desde el mismo lugar (**Authentication → Users → click en su usuario → Reset password**), no hace falta tocar código.

## Paso 5 — Publicar

Los cambios de `js/supabase-config.js` (con las credenciales reales) tienen que estar en la versión publicada del sitio para que tanto el catálogo público como `/admin/` funcionen en producción. Hacé el commit/push o el deploy que uses normalmente para este sitio.

## Paso 6 — Probar todo el flujo antes de pasárselo a Euge

1. Entrá a `https://tu-dominio/admin/` (o la URL de preview que estés usando).
2. Deberías ver la pantalla de login (si en cambio ves "Todavía no está configurado", revisá el Paso 2).
3. Ingresá con el email y contraseña que creaste en el Paso 4.
4. Deberías ver la lista completa del catálogo, con tabs por categoría y buscador.
5. Cambiá el precio de un producto de prueba y tocá "Guardar precio" → tiene que aparecer "Precio guardado ✓".
6. Subí una foto de prueba con "Cambiar foto" (desde el celular o la compu) → tiene que aparecer "Foto actualizada ✓" y el thumbnail se actualiza al toque.
7. Abrí el sitio público (`/index.html` o la home) en otra pestaña o en el celular, **recargá la página**, y confirmá que el precio/foto que cambiaste en el panel ya se ve ahí. Esa es la prueba de que quedó todo conectado de punta a punta.
8. Cerrá sesión con el botón del panel y confirmá que vuelve a pedir login.

Si algo de esto no pasa, lo más probable es un typo en `js/supabase-config.js` o que el script SQL no se haya corrido — no hace falta tocar nada más del código.

## Notas de seguridad y alcance

- Hay un solo usuario administrador (no hay sistema de roles ni multiusuario) — cualquiera que tenga ese email/contraseña puede editar cualquier producto. Esto es intencional, según lo pedido.
- La tabla `productos` es de lectura pública (cualquiera puede *ver* el catálogo, lógicamente — es lo que muestra el sitio) pero solo un usuario logueado puede *editar* precio o foto (política RLS `for update using (auth.role() = 'authenticated')`).
- El límite de tamaño de foto es 15 MB por archivo, validado en el navegador antes de intentar subir nada — si se supera, se muestra un error claro en el panel, no falla en silencio.
- Cada foto subida se recorta automáticamente al centro en un cuadrado de hasta 1200×1200 px antes de subirse, para que coincida con la proporción 1:1 que usa la grilla de productos del catálogo público — no hace falta que la dueña recorte nada de su lado.
