/**
 * Agrega (o actualiza) un query string "?v=<sha corto>" a los <link> y
 * <script> locales de index.html y admin/index.html — así, cuando algo
 * cambia de verdad en un deploy, la URL del archivo cambia y tanto el
 * navegador de cada visitante como el CDN de GitHub Pages se ven
 * obligados a traer la versión nueva en vez de servir una copia vieja
 * cacheada (que era justo el problema con el menú hamburguesa).
 *
 * Lo corre .github/workflows/cache-bust.yml en cada push a main que
 * toque HTML/CSS/JS, pasando el SHA de ese commit. No hace falta
 * correrlo a mano, y es seguro correrlo de nuevo con el mismo valor:
 * si no cambia nada, no toca los archivos.
 *
 * Ojo: esto es solo para los archivos de código (CSS/JS) referenciados
 * desde el HTML con una ruta fija. Las fotos de producto y las
 * imágenes del sitio que se suben desde el panel de admin ya tienen
 * este problema resuelto de otra forma (cada subida genera un nombre
 * de archivo único en Supabase Storage), así que no hace falta
 * tocarlas acá.
 */
const fs = require("fs");
const path = require("path");

const versionCompleta = process.env.CACHE_BUST_VERSION;
if (!versionCompleta) {
  console.error("Falta la variable de entorno CACHE_BUST_VERSION (el SHA del commit).");
  process.exit(1);
}
const v = versionCompleta.slice(0, 7);

// Para cada archivo HTML, las rutas locales (tal cual aparecen en el
// atributo href/src) a las que hay que agregarles "?v=<sha>". Los
// recursos externos (CDN de supabase-js, Google Fonts) no van acá: esos
// ya tienen su propia estrategia de cache del lado del proveedor.
const objetivos = {
  "index.html": ["css/styles.css", "js/supabase-config.js", "js/data.js", "js/app.js"],
  "admin/index.html": ["../css/styles.css", "admin.css", "../js/supabase-config.js", "../js/data.js", "admin.js"]
};

let huboCambios = false;

for (const [archivoRelativo, rutas] of Object.entries(objetivos)) {
  const rutaArchivo = path.join(__dirname, "..", archivoRelativo);
  const original = fs.readFileSync(rutaArchivo, "utf8");
  let contenido = original;

  for (const rutaAsset of rutas) {
    const escapada = rutaAsset.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Reemplaza "ruta" o "ruta?v=loquesea" (de una corrida anterior) por
    // "ruta?v=<sha nuevo>", conservando el mismo tipo de comilla.
    const regex = new RegExp(`(["'])${escapada}(?:\\?v=[0-9a-f]+)?\\1`, "g");
    contenido = contenido.replace(regex, `$1${rutaAsset}?v=${v}$1`);
  }

  if (contenido !== original) {
    fs.writeFileSync(rutaArchivo, contenido);
    huboCambios = true;
    console.log(`${archivoRelativo} -> actualizado a la versión ${v}`);
  } else {
    console.log(`${archivoRelativo} -> sin cambios (ya estaba en la versión ${v}).`);
  }
}

if (!huboCambios) {
  console.log("Nada para commitear: todos los archivos ya tenían esta versión.");
}
