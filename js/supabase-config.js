/**
 * Configuración de Supabase para Pichona.
 *
 * Completar los dos valores de abajo con los de tu proyecto de Supabase:
 * Dashboard → Project Settings → API → "Project URL" y "anon public" key
 * (Supabase le renombró esta segunda a "Publishable key" — es la misma).
 *
 * Estos dos valores NO son secretos: están pensados para vivir en el
 * navegador de cualquier visitante (por eso se llaman "anon" / públicos).
 * La seguridad real la dan las políticas de Row Level Security definidas
 * en sql/schema.sql (lectura pública, edición solo con usuario logueado).
 *
 * NUNCA pongas acá la "service_role" key — esa sí es secreta y da acceso
 * total a la base, saltándose todas las políticas de seguridad.
 *
 * Mientras estos dos campos queden vacíos, el sitio funciona igual que
 * antes (usando el catálogo fijo de js/data.js) y el panel de admin
 * muestra un aviso pidiendo que se completen.
 */
window.SUPABASE_CONFIG = {
  url: "https://prrarkqulgfvgvdaajlo.supabase.co",
  anonKey: "sb_publishable_PrTgdayr57GICFQiQvkHIA__muIktpU"
};
