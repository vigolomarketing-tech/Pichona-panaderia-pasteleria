# Pichona — sitio web

Sitio de la panadería y pastelería **Pichona** (Mitre 1997, José Mármol). Es HTML, CSS y JavaScript puro: no hace falta instalar nada ni tener internet para abrirlo. Alcanza con hacer doble clic en `index.html` y se abre en el navegador.

## Panel para cambiar precios y fotos sin tocar código

Ahora existe una pantalla en `/admin/` donde, con un usuario y contraseña, podés:
- Cambiar el precio de cualquier producto.
- Cambiar la foto de cualquier producto (subiéndola desde el celular o la compu — se recorta sola, no hace falta editarla antes).

Los cambios se ven al toque en el sitio para cualquiera que lo visite, sin que nadie tenga que tocar una línea de código. Pedile el link y la contraseña a Santiago. (Si todavía no te la dieron, es porque falta un paso técnico de configuración de su lado — mirá `ADMIN-SETUP.md` si sos vos quien tiene que hacerlo.)

Todo lo que sigue de acá para abajo (editar `js/data.js` a mano) sigue funcionando igual y es útil para agregar productos nuevos, cambiar textos, horarios, o combos de catering — cosas que el panel de `/admin/` todavía no cubre.

## ¿Cómo cambio un precio?

Todo lo que se ve en la página (productos, precios, combos de catering, horarios, textos) sale de **un solo archivo**: `js/data.js`. No hay ningún precio escrito en el diseño ni en ningún otro lado.

1. Abrí el archivo `js/data.js` con cualquier editor de texto (hasta con el Bloc de notas funciona, aunque se ve más cómodo con algo como VS Code o Notepad++).
2. Buscá el nombre del producto (por ejemplo "Pan de campo", con Ctrl+F).
3. Vas a ver una línea así:
   ```
   { id: "pan-campo", nombre: "Pan de campo", precio: 2200, unidad: "unidad", ... }
   ```
4. Cambiá el número que sigue a `precio:`. Por ejemplo, para pasarlo a $2.500:
   ```
   precio: 2500,
   ```
   **Importante:** el número va sin puntos ni el signo `$`. Solo el número.
5. Guardá el archivo y actualizá la página del navegador (F5). Listo, ya se ve el precio nuevo.

Podés hacer lo mismo con los combos de catering (`PICHONA.catering.combos`) y con los pedidos personalizados.

## ¿Cómo agrego un producto nuevo?

> **Importante si ya está configurado el panel de `/admin/`:** una vez que el panel está conectado a la base de datos, el sitio público muestra el catálogo que está en esa base, no el de `js/data.js`. Agregar un producto solo acá, en `data.js`, **no lo va a mostrar en el sitio** (los precios y fotos de los productos que ya existen sí siguen funcionando desde el panel). Para sumar un producto nuevo en ese caso, hay que agregarlo directamente en Supabase (Table Editor → tabla `productos` → Insert row) con los mismos campos que se explican abajo. Si el panel todavía no está configurado (ver `ADMIN-SETUP.md`), agregarlo acá en `data.js` funciona normalmente.

1. En `js/data.js`, buscá la categoría donde va (por ejemplo, dentro del comentario `// ---------- PANADERÍA ----------`).
2. Copiá una línea de producto que ya exista (una que empiece con `{ id:` y termine en `},`) y pegala justo debajo, dentro de la misma lista.
3. Cambiá estos datos del producto que copiaste:
   - `id`: un nombre corto único, sin espacios ni acentos (ej: `"torta-oreo"`).
   - `nombre`: el nombre que va a ver el cliente.
   - `precio`: el número, sin puntos ni `$`.
   - `unidad`: por ejemplo `"unidad"`, `"kilo"`, `"docena"`, `"porción"`.
   - `descripcion`: una frase corta.
   - `categoria`: tiene que ser una de estas, escrita tal cual (con las comillas):
     `"panaderia"`, `"pasteleria"`, `"petit-fours-tartitas"`, `"salados"`, `"almacen"`.
   - `imagen`: el nombre del archivo de foto que está adentro de la carpeta `assets/img/` (por ejemplo `"assets/img/torta-oreo.jpg"`). Si todavía no tenés la foto, dejalo con cualquier imagen existente y cambiala después.
   - `destacado`: poné `true` si querés que aparezca con la etiqueta "Destacado", o `false` si no.
   - `disponible`: poné `true` si se puede pedir ahora, o `false` si por ahora no (por ejemplo, un producto de temporada). Cuando está en `false`, no aparece el botón de "Pedir".
4. Guardá y actualizá la página.

### Sacar un producto de la venta sin borrarlo

Cambiá `disponible: true` por `disponible: false`. El producto deja de mostrar el botón de pedido, sin necesidad de borrar toda su información (útil para productos de temporada, como el pan dulce).

### Borrar un producto para siempre

Borrá el bloque completo, desde la `{` hasta la `},` que le sigue.

### Si algo se rompe

Si guardás el archivo y la página deja de mostrar productos, lo más probable es que se haya borrado una coma `,` o una llave `{` `}` sin querer. Fijate que:
- Cada producto termine en coma `,` (menos el último de cada lista, que puede o no tenerla).
- La cantidad de `{` sea igual a la cantidad de `}`.

Si no encontrás el error, lo más simple es deshacer el último cambio (Ctrl+Z) y volver a intentar con más cuidado.

## ¿Dónde cambio los horarios, el WhatsApp o la dirección?

Todo eso está arriba de todo en `js/data.js`, dentro de `PICHONA.negocio`. Ahí están el teléfono, el link de WhatsApp, la dirección y los horarios de atención.

## ¿Cómo agrego o cambio fotos?

Las fotos van dentro de la carpeta `assets/img/`. Tienen que tener el mismo nombre de archivo que está puesto en `imagen:` dentro de `js/data.js` (por ejemplo `assets/img/pan-dulce.jpg`). Si subís una foto con otro nombre, tenés que actualizar también el nombre en `data.js`.

Mirá el archivo `IMAGENES-PENDIENTES.md` para ver qué fotos reales todavía faltan y qué tamaño conviene que tengan.

## Estructura del proyecto

```
index.html              → la página (secciones, textos fijos, estructura)
css/styles.css          → todo el diseño (colores, tipografías, tamaños)
js/data.js              → productos, precios y datos del negocio (catálogo de respaldo)
js/app.js               → arma el catálogo, el catering y el formulario; intenta traer precios/fotos en vivo de Supabase
js/supabase-config.js   → credenciales de conexión a Supabase (URL + clave pública)
admin/                  → panel para cambiar precio y foto de cada producto (login + edición)
sql/schema.sql          → script para crear la base de datos en Supabase (correr una sola vez)
assets/img/             → fotos y favicon
IMAGENES-PENDIENTES.md  → lista de fotos reales que faltan reemplazar
ADMIN-SETUP.md          → instrucciones técnicas para configurar Supabase y el panel
```

## Nota técnica (para quien continúe el desarrollo)

Los productos en `js/data.js` tienen la forma `{ id, nombre, precio, unidad, descripcion, categoria, imagen, destacado, disponible }`. Esa forma ya se migró a una tabla `productos` en Supabase (ver `sql/schema.sql` y `ADMIN-SETUP.md`): `js/app.js` intenta cargar el catálogo en vivo desde ahí y, si `js/supabase-config.js` no está configurado o falla la conexión, usa el array de `data.js` como respaldo. El panel de `admin/` permite editar precio y foto de cada producto ya existente en la base; agregar productos nuevos o editar el resto de sus campos (nombre, descripción, categoría) todavía se hace a mano, directamente en la tabla de Supabase o en `data.js` según corresponda (ver la nota en "¿Cómo agrego un producto nuevo?" más arriba).
