/**
 * Panel de administración de Pichona.
 * Login con Supabase Auth + edición de precio y foto de cada producto,
 * guardando directo en la tabla "productos" de Supabase (la misma que
 * lee el sitio público en vivo — ver js/app.js → cargarProductosEnVivo).
 */
(function () {
  "use strict";

  const MAX_BYTES = 15 * 1024 * 1024; // 15 MB
  const LADO_FOTO = 1200; // px — lado del cuadrado que se sube a Storage

  const vistas = {
    sinConfigurar: document.getElementById("vista-sin-configurar"),
    login: document.getElementById("vista-login"),
    panel: document.getElementById("vista-panel")
  };
  const btnLogout = document.getElementById("btn-logout");

  function mostrarVista(nombre) {
    Object.entries(vistas).forEach(([key, el]) => {
      el.hidden = key !== nombre;
    });
    btnLogout.hidden = nombre !== "panel";
  }

  const config = window.SUPABASE_CONFIG;
  if (!config || !config.url || !config.anonKey) {
    mostrarVista("sinConfigurar");
    return;
  }

  if (typeof window.supabase === "undefined") {
    document.getElementById("sin-configurar-titulo").textContent = "No se pudo cargar el panel";
    document.getElementById("sin-configurar-texto").textContent =
      "No se pudo cargar el sistema de login (puede ser un problema de conexión). Revisá tu internet y recargá la página.";
    mostrarVista("sinConfigurar");
    return;
  }

  const sb = window.supabase.createClient(config.url, config.anonKey);

  // ------------------------------------------------------------------
  // LOGIN / SESIÓN
  // ------------------------------------------------------------------
  const formLogin = document.getElementById("form-login");
  const loginError = document.getElementById("login-error");
  const btnLogin = document.getElementById("btn-login");

  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.textContent = "";
    btnLogin.disabled = true;
    btnLogin.textContent = "Ingresando...";

    const email = formLogin.email.value.trim();
    const password = formLogin.password.value;

    const { error } = await sb.auth.signInWithPassword({ email, password });

    btnLogin.disabled = false;
    btnLogin.textContent = "Ingresar";

    if (error) {
      loginError.textContent = error.message.includes("Invalid login credentials")
        ? "Usuario o contraseña incorrectos."
        : "No se pudo ingresar: " + error.message;
    }
  });

  btnLogout.addEventListener("click", () => sb.auth.signOut());

  sb.auth.onAuthStateChange((_event, session) => {
    if (session) {
      mostrarVista("panel");
      cargarProductos();
      cargarImagenesDelSitio();
    } else {
      mostrarVista("login");
      formLogin.reset();
    }
  });

  // ------------------------------------------------------------------
  // CATÁLOGO EDITABLE
  // ------------------------------------------------------------------
  const listaEl = document.getElementById("admin-lista");
  const cargandoEl = document.getElementById("admin-cargando");
  const tabsEl = document.getElementById("admin-tabs");
  const buscadorEl = document.getElementById("admin-buscador");

  let productos = [];
  let categoriaActiva = "todas";
  let termino = "";

  async function cargarProductos() {
    cargandoEl.hidden = false;
    listaEl.innerHTML = "";

    const { data, error } = await sb.from("productos").select("*").order("categoria").order("nombre");

    cargandoEl.hidden = true;

    if (error) {
      cargandoEl.hidden = false;
      cargandoEl.textContent = "No se pudo cargar el catálogo: " + error.message;
      return;
    }

    productos = data || [];
    renderTabs();
    renderLista();
  }

  function renderTabs() {
    const todas = [{ id: "todas", nombre: "Todas" }, ...(typeof PICHONA !== "undefined" ? PICHONA.categorias : [])];
    tabsEl.innerHTML = todas
      .map(
        (cat) => `
        <button type="button" class="tab-btn" role="tab"
          aria-selected="${cat.id === categoriaActiva}"
          data-categoria="${cat.id}">${cat.nombre}</button>`
      )
      .join("");

    tabsEl.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        categoriaActiva = btn.dataset.categoria;
        renderTabs();
        renderLista();
      });
    });
  }

  buscadorEl.addEventListener("input", (e) => {
    termino = e.target.value;
    renderLista();
  });

  function nombreCategoria(id) {
    const cat = (typeof PICHONA !== "undefined" ? PICHONA.categorias : []).find((c) => c.id === id);
    return cat ? cat.nombre : id;
  }

  /**
   * Las fotos "de fábrica" que todavía no se reemplazaron desde el panel
   * guardan una ruta relativa (ej. "assets/img/budines.jpg"), pensada para
   * el sitio público que vive en la raíz. Esta página vive en /admin/, un
   * nivel más adentro, así que esa misma ruta sin ajustar apunta a
   * /admin/assets/... y rompe (ícono de imagen rota). Las URLs reales de
   * Supabase Storage (https://...) no se tocan.
   */
  function rutaImagenAdmin(imagen) {
    if (!imagen) return imagen;
    if (/^([a-z]+:)?\/\//i.test(imagen) || imagen.startsWith("/")) return imagen;
    return "../" + imagen;
  }

  function fotoSlotHTML(imagen, alt) {
    return imagen
      ? `<img class="admin-fila__foto" src="${rutaImagenAdmin(imagen)}" alt="${alt}">`
      : `<div class="admin-fila__foto admin-fila__foto--vacia">Sin foto</div>`;
  }

  function filaHTML(p) {
    return `
      <div class="admin-fila" data-id="${p.id}">
        <div class="admin-fila__foto-wrap">
          <div class="admin-fila__foto-slot" data-rol="foto-slot">${fotoSlotHTML(p.imagen, p.nombre)}</div>
          <input type="file" accept="image/*" data-rol="input-foto" hidden>
          <button type="button" class="btn btn--outline admin-fila__cambiar-foto" data-rol="btn-foto">Cambiar foto</button>
        </div>
        <div class="admin-fila__info">
          <h3>${p.nombre}</h3>
          <p class="admin-fila__categoria">${nombreCategoria(p.categoria)}</p>
          <div class="admin-fila__precio-row">
            <span>$</span>
            <input type="number" min="0" step="1" inputmode="numeric"
              value="${p.precio == null ? "" : p.precio}"
              placeholder="Consultar"
              data-rol="input-precio"
              aria-label="Precio de ${p.nombre}">
            <span class="admin-fila__unidad">/ ${p.unidad}</span>
          </div>
        </div>
        <div class="admin-fila__acciones">
          <button type="button" class="btn btn--primary admin-fila__guardar" data-rol="btn-guardar">Guardar precio</button>
          <p class="admin-fila__estado" data-rol="estado"></p>
        </div>
      </div>`;
  }

  function renderLista() {
    const t = termino.trim().toLowerCase();
    const filtrados = productos.filter((p) => {
      const coincideCategoria = categoriaActiva === "todas" || p.categoria === categoriaActiva;
      const coincideBusqueda = !t || p.nombre.toLowerCase().includes(t);
      return coincideCategoria && coincideBusqueda;
    });

    if (filtrados.length === 0) {
      listaEl.innerHTML = `<p class="admin-vacio">No hay productos que coincidan.</p>`;
      return;
    }

    listaEl.innerHTML = filtrados.map(filaHTML).join("");

    listaEl.querySelectorAll(".admin-fila").forEach((fila) => {
      const id = fila.dataset.id;
      const producto = productos.find((p) => p.id === id);

      fila.querySelector('[data-rol="btn-guardar"]').addEventListener("click", () => guardarPrecio(fila, producto));
      fila.querySelector('[data-rol="btn-foto"]').addEventListener("click", () => {
        fila.querySelector('[data-rol="input-foto"]').click();
      });
      fila.querySelector('[data-rol="input-foto"]').addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) cambiarFoto(fila, producto, file);
        e.target.value = "";
      });
    });
  }

  function setEstado(fila, texto, tipo) {
    const el = fila.querySelector('[data-rol="estado"]');
    el.textContent = texto;
    el.className = "admin-fila__estado" + (tipo ? " admin-fila__estado--" + tipo : "");
  }

  async function guardarPrecio(fila, producto) {
    const input = fila.querySelector('[data-rol="input-precio"]');
    const btn = fila.querySelector('[data-rol="btn-guardar"]');
    const valorTexto = input.value.trim();

    let nuevoPrecio = null;
    if (valorTexto !== "") {
      nuevoPrecio = Number(valorTexto);
      if (!Number.isFinite(nuevoPrecio) || nuevoPrecio < 0) {
        setEstado(fila, "Ingresá un precio válido (o dejalo vacío para \"Consultar precio\").", "error");
        return;
      }
    }

    btn.disabled = true;
    setEstado(fila, "Guardando...", "");

    const { error } = await sb.from("productos").update({ precio: nuevoPrecio }).eq("id", producto.id);

    btn.disabled = false;

    if (error) {
      setEstado(fila, "No se pudo guardar: " + error.message, "error");
      return;
    }

    producto.precio = nuevoPrecio;
    setEstado(fila, "Precio guardado ✓", "ok");
  }

  async function cambiarFoto(fila, producto, file) {
    if (!file.type.startsWith("image/")) {
      setEstado(fila, "Elegí un archivo de imagen (JPG, PNG, etc).", "error");
      return;
    }
    if (file.size > MAX_BYTES) {
      const pesoMB = (file.size / (1024 * 1024)).toFixed(1);
      setEstado(fila, `La imagen pesa ${pesoMB} MB, el máximo es 15 MB. Elegí otra foto o bajale la calidad.`, "error");
      return;
    }

    const btnFoto = fila.querySelector('[data-rol="btn-foto"]');
    btnFoto.disabled = true;
    setEstado(fila, "Preparando la imagen...", "");

    let blob;
    try {
      blob = await recortarCuadrado(file, LADO_FOTO);
    } catch (err) {
      btnFoto.disabled = false;
      setEstado(fila, "No pudimos abrir esa imagen. Probá con otra foto (JPG o PNG).", "error");
      return;
    }

    setEstado(fila, "Subiendo foto...", "");

    const ruta = `${producto.id}-${Date.now()}.jpg`;
    const { error: errorSubida } = await sb.storage
      .from("productos-fotos")
      .upload(ruta, blob, { contentType: "image/jpeg", upsert: true });

    if (errorSubida) {
      btnFoto.disabled = false;
      setEstado(fila, "No se pudo subir la foto: " + errorSubida.message, "error");
      return;
    }

    const { data: urlData } = sb.storage.from("productos-fotos").getPublicUrl(ruta);
    const urlPublica = urlData.publicUrl;

    const { error: errorUpdate } = await sb.from("productos").update({ imagen: urlPublica }).eq("id", producto.id);

    btnFoto.disabled = false;

    if (errorUpdate) {
      setEstado(fila, "La foto se subió pero no se pudo guardar en el producto: " + errorUpdate.message, "error");
      return;
    }

    producto.imagen = urlPublica;
    fila.querySelector('[data-rol="foto-slot"]').innerHTML = fotoSlotHTML(producto.imagen, producto.nombre);
    setEstado(fila, "Foto actualizada ✓", "ok");
  }

  /**
   * Recorta el centro de la imagen en un cuadrado y la reduce a `lado`
   * píxeles, devolviendo un Blob JPEG — así todas las fotos de producto
   * quedan con la misma proporción (1:1) que usa la grilla del catálogo,
   * sin importar la foto que suba la dueña desde el celular.
   */
  function recortarCuadrado(file, lado) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        const origen = Math.min(img.naturalWidth, img.naturalHeight);
        const sx = (img.naturalWidth - origen) / 2;
        const sy = (img.naturalHeight - origen) / 2;
        const destino = Math.min(lado, origen);

        const canvas = document.createElement("canvas");
        canvas.width = destino;
        canvas.height = destino;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, sx, sy, origen, origen, 0, 0, destino, destino);

        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("toBlob devolvió vacío"))),
          "image/jpeg",
          0.85
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("No se pudo leer la imagen"));
      };
      img.src = url;
    });
  }

  // ------------------------------------------------------------------
  // IMÁGENES DEL SITIO (decorativas, no son fotos de producto)
  //
  // Las 4 fotos de la galería debajo del hero (petit-fours-1, tartitas-1,
  // vitrina, budines) viven en la tabla "site_images", con una fila fija
  // por slot. Reutiliza el mismo mecanismo de recorte y subida que las
  // fotos de producto, guardando en la misma tabla que lee el sitio
  // público en vivo (ver js/app.js → cargarImagenesDelSitioEnVivo).
  //
  // La foto del hero (la persiana) queda afuera a propósito: no tiene
  // fila acá ni botón — se reemplaza a mano en el código.
  // ------------------------------------------------------------------
  const imagenesGridEl = document.getElementById("admin-imagenes-grid");
  let imagenesSitio = [];

  async function cargarImagenesDelSitio() {
    const { data, error } = await sb.from("site_images").select("*").order("id");

    if (error) {
      imagenesGridEl.innerHTML = `<p class="admin-vacio">No se pudieron cargar las imágenes del sitio: ${error.message}</p>`;
      return;
    }

    imagenesSitio = data || [];
    renderImagenesSitio();
  }

  function imagenCardHTML(fila) {
    return `
      <div class="admin-imagen-card" data-id="${fila.id}">
        <div class="admin-imagen-card__foto-slot" data-rol="foto-slot">${fotoSlotHTML(fila.imagen, fila.label)}</div>
        <div class="admin-imagen-card__info">
          <p class="admin-imagen-card__label">${fila.label}</p>
          <input type="file" accept="image/*" data-rol="input-foto" hidden>
          <button type="button" class="btn btn--outline admin-fila__cambiar-foto" data-rol="btn-foto">Cambiar foto</button>
          <p class="admin-imagen-card__estado" data-rol="estado"></p>
        </div>
      </div>`;
  }

  function renderImagenesSitio() {
    if (imagenesSitio.length === 0) {
      imagenesGridEl.innerHTML = `<p class="admin-vacio">Todavía no hay imágenes del sitio cargadas (falta correr sql/site_images.sql).</p>`;
      return;
    }

    imagenesGridEl.innerHTML = imagenesSitio.map(imagenCardHTML).join("");

    imagenesGridEl.querySelectorAll(".admin-imagen-card").forEach((card) => {
      const id = card.dataset.id;
      const fila = imagenesSitio.find((f) => f.id === id);

      card.querySelector('[data-rol="btn-foto"]').addEventListener("click", () => {
        card.querySelector('[data-rol="input-foto"]').click();
      });
      card.querySelector('[data-rol="input-foto"]').addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) cambiarImagenSitio(card, fila, file);
        e.target.value = "";
      });
    });
  }

  function setEstadoImagen(card, texto, tipo) {
    const el = card.querySelector('[data-rol="estado"]');
    el.textContent = texto;
    el.className = "admin-imagen-card__estado" + (tipo ? " admin-imagen-card__estado--" + tipo : "");
  }

  async function cambiarImagenSitio(card, fila, file) {
    if (!file.type.startsWith("image/")) {
      setEstadoImagen(card, "Elegí un archivo de imagen (JPG, PNG, etc).", "error");
      return;
    }
    if (file.size > MAX_BYTES) {
      const pesoMB = (file.size / (1024 * 1024)).toFixed(1);
      setEstadoImagen(card, `La imagen pesa ${pesoMB} MB, el máximo es 15 MB. Elegí otra foto o bajale la calidad.`, "error");
      return;
    }

    const btnFoto = card.querySelector('[data-rol="btn-foto"]');
    btnFoto.disabled = true;
    setEstadoImagen(card, "Preparando la imagen...", "");

    let blob;
    try {
      blob = await recortarCuadrado(file, LADO_FOTO);
    } catch (err) {
      btnFoto.disabled = false;
      setEstadoImagen(card, "No pudimos abrir esa imagen. Probá con otra foto (JPG o PNG).", "error");
      return;
    }

    setEstadoImagen(card, "Subiendo foto...", "");

    // Prefijo "site-" para no pisar los archivos de fotos de producto que
    // viven en el mismo bucket.
    const ruta = `site-${fila.id}-${Date.now()}.jpg`;
    const { error: errorSubida } = await sb.storage
      .from("productos-fotos")
      .upload(ruta, blob, { contentType: "image/jpeg", upsert: true });

    if (errorSubida) {
      btnFoto.disabled = false;
      setEstadoImagen(card, "No se pudo subir la foto: " + errorSubida.message, "error");
      return;
    }

    const { data: urlData } = sb.storage.from("productos-fotos").getPublicUrl(ruta);
    const urlPublica = urlData.publicUrl;

    const { error: errorUpdate } = await sb.from("site_images").update({ imagen: urlPublica }).eq("id", fila.id);

    btnFoto.disabled = false;

    if (errorUpdate) {
      setEstadoImagen(card, "La foto se subió pero no se pudo guardar: " + errorUpdate.message, "error");
      return;
    }

    fila.imagen = urlPublica;
    card.querySelector('[data-rol="foto-slot"]').innerHTML = fotoSlotHTML(fila.imagen, fila.label);
    setEstadoImagen(card, "Foto actualizada ✓", "ok");
  }
})();
