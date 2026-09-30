/**
 * Ping de mantenimiento para Supabase.
 *
 * El plan free de Supabase pausa el proyecto después de 7 días sin
 * actividad. Este script hace una lectura mínima contra la tabla
 * `productos` (1 fila, sin usar el resultado para nada) para que quede
 * registrada actividad y el proyecto no se pause. Lo corre el workflow
 * de GitHub Actions en .github/workflows/supabase-keepalive.yml.
 *
 * Lee la URL y la clave publicable directo de js/supabase-config.js, así
 * no hace falta duplicarlas ni guardarlas como secret: son las mismas que
 * ya viven en el navegador de cualquier visitante del sitio.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function leerConfig() {
  const archivo = path.join(__dirname, "..", "js", "supabase-config.js");
  const codigo = fs.readFileSync(archivo, "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(codigo, sandbox);
  return sandbox.window.SUPABASE_CONFIG;
}

async function main() {
  const config = leerConfig();

  if (!config || !config.url || !config.anonKey) {
    console.log("js/supabase-config.js todavía no tiene URL/clave cargadas — nada que mantener despierto todavía.");
    return;
  }

  const url = `${config.url}/rest/v1/productos?select=id&limit=1`;

  try {
    const res = await fetch(url, {
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`
      }
    });
    console.log(`Ping a Supabase: HTTP ${res.status}`);
    if (!res.ok) {
      console.log(await res.text());
    }
  } catch (err) {
    // No hacemos fallar el workflow por un problema de red puntual: el
    // objetivo es solo generar actividad, no monitorear uptime.
    console.log("No se pudo contactar a Supabase (puede ser un problema de red transitorio):", err.message);
  }
}

main();
