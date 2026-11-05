/**
 * Pichona — lógica del sitio.
 * La mayoría de los datos (negocio, catering, testimonios, y el catálogo
 * de arranque) viven en js/data.js (objeto PICHONA). El catálogo de
 * productos, además, se intenta refrescar en vivo desde Supabase si el
 * panel de administración está configurado (ver cargarProductosEnVivo).
 * No hay precios ni textos de productos hardcodeados en este archivo.
 */
(function () {
  "use strict";

  const fmtPrecio = (valor) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(valor);

  const linkWhatsApp = (mensaje) =>
    `${PICHONA.negocio.whatsapp}?text=${encodeURIComponent(mensaje)}`;

  // ------------------------------------------------------------------
  // MENÚ MOBILE (hamburguesa) — reusa el mismo <nav> de siempre, solo
  // lo muestra/oculta como dropdown por debajo de 780px.
  // ------------------------------------------------------------------
  const navToggle = document.getElementById("nav-toggle");
  const mainNav = document.getElementById("main-nav");

  function cerrarMenu() {
    mainNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.textContent = "☰";
  }

  navToggle.addEventListener("click", () => {
    const abierto = mainNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(abierto));
    navToggle.textContent = abierto ? "✕" : "☰";
  });

  mainNav.querySelectorAll("a").forEach((a) => a.addEventListener("click", cerrarMenu));

  // ------------------------------------------------------------------
  // CATÁLOGO: tabs, buscador y grilla
  // ------------------------------------------------------------------
  const gridProductos = document.getElementById("grid-productos");
  const tabsWrap = document.getElementById("tabs-categorias");
  const buscadorInput = document.getElementById("buscador-input");
  const catalogoVacio = document.getElementById("catalogo-vacio");

  let categoriaActiva = "todas";
  let terminoBusqueda = "";

  // Arranca con el catálogo fijo de data.js (así la página nunca queda en
  // blanco esperando a la red) y, si hay un panel de Supabase configurado,
  // lo reemplaza por los precios y fotos en vivo apenas llegan.
  let productosActuales = PICHONA.productos;

  function renderTabs() {
    const todas = [{ id: "todas", nombre: "Todas" }, ...PICHONA.categorias];
    tabsWrap.innerHTML = todas
      .map(
        (cat) => `
        <button type="button" class="tab-btn" role="tab"
          aria-selected="${cat.id === categoriaActiva}"
          data-categoria="${cat.id}">${cat.nombre}</button>`
      )
      .join("");

    tabsWrap.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        categoriaActiva = btn.dataset.categoria;
        renderTabs();
        renderProductos();
      });
    });
  }

  function productoCardHTML(p) {
    const precioHTML = p.precio == null
      ? `<span class="producto-card__precio">Consultar precio</span>`
      : `<span class="producto-card__precio">${fmtPrecio(p.precio)} <span>${p.unidad}</span></span>`;

    const botonPedir = p.disponible
      ? `<button type="button" class="btn btn--primary btn--small" data-rol="agregar-carrito" data-id="${p.id}">Agregar</button>`
      : `<span class="badge-agotado">De temporada</span>`;

    // Mientras no haya una foto real cargada, no mostramos ningún espacio
    // de imagen (ni placeholder gris): la tarjeta arranca directo con el
    // nombre. Así se evita el ícono de imagen rota en los productos que
    // todavía no tienen foto.
    const fotoHTML = p.imagen
      ? `<div class="producto-card__img">
          <img src="${p.imagen}" alt="${p.nombre}" loading="lazy" width="600" height="600">
        </div>`
      : "";

    return `
      <article class="producto-card${p.destacado ? " producto-card--destacado" : ""}${p.imagen ? "" : " producto-card--sin-foto"}">
        ${fotoHTML}
        <div class="producto-card__body">
          ${p.destacado ? `<span class="badge-destacado">Destacado</span>` : ""}
          <h3>${p.nombre}</h3>
          <p class="producto-card__desc">${p.descripcion}</p>
          <div class="producto-card__footer">
            ${precioHTML}
            ${botonPedir}
          </div>
        </div>
      </article>`;
  }

  function renderProductos() {
    const termino = terminoBusqueda.trim().toLowerCase();
    const filtrados = productosActuales.filter((p) => {
      const coincideCategoria = categoriaActiva === "todas" || p.categoria === categoriaActiva;
      const coincideBusqueda = !termino || p.nombre.toLowerCase().includes(termino);
      return coincideCategoria && coincideBusqueda;
    });

    // Los productos "de temporada" (no disponibles ahora) van al final
    filtrados.sort((a, b) => (a.disponible === false ? 1 : 0) - (b.disponible === false ? 1 : 0));

    gridProductos.innerHTML = filtrados.map(productoCardHTML).join("");
    catalogoVacio.hidden = filtrados.length !== 0;
  }

  let buscadorTimeout;
  buscadorInput.addEventListener("input", (e) => {
    clearTimeout(buscadorTimeout);
    buscadorTimeout = setTimeout(() => {
      terminoBusqueda = e.target.value;
      renderProductos();
    }, 120);
  });

  renderTabs();
  renderProductos();

  // ------------------------------------------------------------------
  // PRECIOS Y FOTOS EN VIVO (Supabase) — opcional
  //
  // Si js/supabase-config.js tiene URL y anonKey completadas, buscamos
  // el catálogo real en la tabla "productos" de Supabase (la misma que
  // edita el panel de admin) y, si la respuesta llega bien, la usamos en
  // vez de la fija de data.js. Si no está configurado, o falla la red,
  // el sitio sigue funcionando con los datos fijos de siempre.
  // ------------------------------------------------------------------
  function crearClienteSupabase() {
    const config = window.SUPABASE_CONFIG;
    if (!config || !config.url || !config.anonKey) return null;
    if (typeof window.supabase === "undefined") return null;
    return window.supabase.createClient(config.url, config.anonKey);
  }

  async function cargarProductosEnVivo() {
    const sb = crearClienteSupabase();
    if (!sb) return;

    try {
      const { data, error } = await sb.from("productos").select("*");
      if (error) throw error;
      if (!data || data.length === 0) return;

      productosActuales = data;
      renderProductos();
    } catch (err) {
      console.warn("No se pudo cargar el catálogo en vivo de Supabase, se sigue mostrando el catálogo fijo.", err);
    }
  }

  cargarProductosEnVivo();

  // ------------------------------------------------------------------
  // IMÁGENES DEL SITIO EN VIVO (Supabase) — opcional
  //
  // Las 4 fotos decorativas de la galería debajo del hero (petit-fours-1,
  // tartitas-1, vitrina, budines) no son fotos de producto: viven en la
  // tabla "site_images" de Supabase para que se puedan reemplazar desde
  // el panel sin tocar código. Igual que con el catálogo, si no está
  // configurado o falla la red, se siguen mostrando los archivos fijos
  // de assets/img/ que ya trae el HTML.
  // ------------------------------------------------------------------
  async function cargarImagenesDelSitioEnVivo() {
    const sb = crearClienteSupabase();
    if (!sb) return;

    try {
      const { data, error } = await sb.from("site_images").select("*");
      if (error) throw error;
      if (!data) return;

      // Se buscan los elementos recién acá (después del await) y no antes,
      // porque algunos — como las fotos de los combos de catering — todavía
      // no existen en el DOM en este punto del script: se arman más abajo,
      // de forma síncrona, y para cuando esta consulta a Supabase resuelve
      // ya terminaron de renderizarse.
      const imgs = document.querySelectorAll("[data-site-image]");
      if (imgs.length === 0) return;

      const porId = {};
      data.forEach((fila) => { porId[fila.id] = fila; });

      imgs.forEach((img) => {
        const fila = porId[img.dataset.siteImage];
        if (fila && fila.imagen) img.src = fila.imagen;
      });
    } catch (err) {
      console.warn("No se pudieron cargar las imágenes del sitio en vivo de Supabase, se siguen mostrando las fijas.", err);
    }
  }

  cargarImagenesDelSitioEnVivo();

  // ------------------------------------------------------------------
  // NOMBRES DE CATEGORÍAS EN VIVO (Supabase) — opcional
  //
  // Las etiquetas de los filtros (Panadería, Pastelería, etc) se pueden
  // renombrar desde el panel de admin sin tocar código — viven en la
  // tabla "categorias" de Supabase. El id interno de cada categoría (el
  // que usa cada producto) no cambia nunca, solo el nombre que se ve acá.
  // Si no está configurado o falla la red, se siguen mostrando los
  // nombres fijos de js/data.js.
  // ------------------------------------------------------------------
  async function cargarCategoriasEnVivo() {
    const sb = crearClienteSupabase();
    if (!sb) return;

    try {
      const { data, error } = await sb.from("categorias").select("*");
      if (error) throw error;
      if (!data || data.length === 0) return;

      const porId = {};
      data.forEach((fila) => { porId[fila.id] = fila.nombre; });
      PICHONA.categorias.forEach((cat) => {
        if (porId[cat.id] != null) cat.nombre = porId[cat.id];
      });

      renderTabs();
    } catch (err) {
      console.warn("No se pudieron cargar las categorías en vivo de Supabase, se siguen mostrando los nombres fijos.", err);
    }
  }

  cargarCategoriasEnVivo();

  // ------------------------------------------------------------------
  // CARRITO
  //
  // Guarda solo { id, cantidad } por línea — nunca precio ni nombre — así
  // que cada vez que se muestra o se envía el carrito, los datos del
  // producto (precio, nombre, unidad) se buscan de nuevo en
  // "productosActuales" (el catálogo en vivo). Esto resuelve solo, sin
  // código aparte, tanto un precio que cambió desde el panel como un
  // producto nuevo creado ahí: alcanza con que exista en el catálogo.
  // ------------------------------------------------------------------
  const CARRITO_KEY = "pichona-carrito";

  const carritoFlotanteBtn = document.getElementById("carrito-flotante");
  const carritoBadge = document.getElementById("carrito-badge");
  const carritoToast = document.getElementById("carrito-toast");
  const carritoOverlay = document.getElementById("carrito-overlay");
  const carritoPanel = document.getElementById("carrito-panel");
  const carritoCerrarBtn = document.getElementById("carrito-cerrar");
  const carritoVacioEl = document.getElementById("carrito-vacio");
  const carritoAvisoEl = document.getElementById("carrito-aviso");
  const carritoListaEl = document.getElementById("carrito-lista");
  const carritoNotaConsultarEl = document.getElementById("carrito-nota-consultar");
  const carritoNombreInput = document.getElementById("carrito-nombre");
  const carritoComentariosInput = document.getElementById("carrito-comentarios");
  const carritoTotalEl = document.getElementById("carrito-total");
  const carritoEnviarBtn = document.getElementById("carrito-enviar");
  const carritoVaciarBtn = document.getElementById("carrito-vaciar");

  function cargarCarritoGuardado() {
    try {
      const raw = localStorage.getItem(CARRITO_KEY);
      if (!raw) return { items: [], nombre: "", comentarios: "" };
      const datos = JSON.parse(raw);
      const items = Array.isArray(datos.items)
        ? datos.items.filter((it) => it && typeof it.id === "string" && Number.isInteger(it.cantidad) && it.cantidad > 0)
        : [];
      return {
        items,
        nombre: typeof datos.nombre === "string" ? datos.nombre : "",
        comentarios: typeof datos.comentarios === "string" ? datos.comentarios : ""
      };
    } catch (err) {
      console.warn("No se pudo leer el carrito guardado, arranca vacío.", err);
      return { items: [], nombre: "", comentarios: "" };
    }
  }

  function guardarCarrito() {
    try {
      localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
    } catch (err) {
      console.warn("No se pudo guardar el carrito (¿localStorage deshabilitado?). Sigue funcionando en esta sesión.", err);
    }
  }

  let carrito = cargarCarritoGuardado();
  carritoNombreInput.value = carrito.nombre;
  carritoComentariosInput.value = carrito.comentarios;

  function buscarProducto(id) {
    return productosActuales.find((p) => p.id === id) || null;
  }

  function actualizarBadge() {
    const totalUnidades = carrito.items.reduce((acc, it) => acc + it.cantidad, 0);
    carritoBadge.textContent = String(totalUnidades);
    carritoBadge.hidden = totalUnidades === 0;
    carritoFlotanteBtn.setAttribute(
      "aria-label",
      totalUnidades > 0 ? `Ver carrito (${totalUnidades} producto${totalUnidades === 1 ? "" : "s"})` : "Ver carrito"
    );
  }

  // Refleja de entrada la cantidad guardada de una sesión anterior, sin
  // esperar a que se abra el panel (que es donde recién se revalida contra
  // el catálogo).
  actualizarBadge();

  let toastTimeout;
  function mostrarToast(mensaje) {
    carritoToast.textContent = mensaje;
    carritoToast.hidden = false;
    requestAnimationFrame(() => carritoToast.classList.add("is-visible"));
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      carritoToast.classList.remove("is-visible");
      setTimeout(() => { carritoToast.hidden = true; }, 200);
    }, 1600);
  }

  function agregarAlCarrito(id) {
    const producto = buscarProducto(id);
    if (!producto) return;

    const existente = carrito.items.find((it) => it.id === id);
    if (existente) {
      existente.cantidad += 1;
    } else {
      carrito.items.push({ id, cantidad: 1 });
    }
    guardarCarrito();
    actualizarBadge();
    mostrarToast("Agregado ✓");
    if (!carritoPanel.hidden) renderCarrito();
  }

  function cambiarCantidad(id, delta) {
    const item = carrito.items.find((it) => it.id === id);
    if (!item) return;
    item.cantidad = Math.max(1, item.cantidad + delta);
    guardarCarrito();
    renderCarrito();
  }

  function quitarDelCarrito(id) {
    carrito.items = carrito.items.filter((it) => it.id !== id);
    guardarCarrito();
    renderCarrito();
  }

  carritoVaciarBtn.addEventListener("click", () => {
    if (carrito.items.length === 0) return;
    if (!window.confirm("¿Vaciar el carrito?")) return;
    carrito.items = [];
    guardarCarrito();
    renderCarrito();
  });

  // Antes de mostrar o enviar el carrito, se revalida cada línea contra el
  // catálogo en vivo: si un producto ya no existe (lo borraron, o todavía
  // no cargó el catálogo de Supabase), se saca del carrito y se avisa acá
  // mismo en vez de fallar más adelante al armar el mensaje de WhatsApp.
  function revalidarCarrito() {
    const antes = carrito.items.length;
    carrito.items = carrito.items.filter((it) => buscarProducto(it.id) !== null);
    const sacados = antes - carrito.items.length;
    if (sacados > 0) guardarCarrito();
    return sacados;
  }

  function renderCarrito() {
    const sacados = revalidarCarrito();
    carritoAvisoEl.textContent = sacados > 0
      ? `Se sacaron del carrito ${sacados} producto${sacados === 1 ? "" : "s"} que ya no está${sacados === 1 ? "" : "n"} disponible${sacados === 1 ? "" : "s"}.`
      : "";

    actualizarBadge();

    if (carrito.items.length === 0) {
      carritoListaEl.innerHTML = "";
      carritoVacioEl.hidden = false;
      carritoNotaConsultarEl.hidden = true;
      carritoTotalEl.textContent = fmtPrecio(0);
      carritoEnviarBtn.disabled = true;
      carritoVaciarBtn.disabled = true;
      return;
    }

    carritoVacioEl.hidden = true;
    carritoEnviarBtn.disabled = false;
    carritoVaciarBtn.disabled = false;

    let total = 0;
    let hayConsultar = false;

    carritoListaEl.innerHTML = carrito.items
      .map((it) => {
        const p = buscarProducto(it.id);
        const precioHTML = p.precio == null
          ? `<p class="carrito-item__precio">Precio a consultar</p>`
          : `<p class="carrito-item__precio">${fmtPrecio(p.precio)} <span>/ ${p.unidad}</span></p>`;

        let subtotalHTML;
        if (p.precio == null) {
          hayConsultar = true;
          subtotalHTML = `<p class="carrito-item__subtotal carrito-item__subtotal--consultar">A consultar</p>`;
        } else {
          total += p.precio * it.cantidad;
          subtotalHTML = `<p class="carrito-item__subtotal">${fmtPrecio(p.precio * it.cantidad)}</p>`;
        }

        return `
          <li class="carrito-item" data-id="${p.id}">
            <div class="carrito-item__info">
              <p class="carrito-item__nombre">${p.nombre}</p>
              ${precioHTML}
            </div>
            <div class="carrito-item__cantidad">
              <button type="button" class="carrito-item__paso" data-rol="restar" aria-label="Restar una unidad de ${p.nombre}">−</button>
              <span>${it.cantidad}</span>
              <button type="button" class="carrito-item__paso" data-rol="sumar" aria-label="Sumar una unidad de ${p.nombre}">+</button>
            </div>
            ${subtotalHTML}
            <button type="button" class="carrito-item__quitar" data-rol="quitar" aria-label="Quitar ${p.nombre} del carrito">🗑</button>
          </li>`;
      })
      .join("");

    carritoTotalEl.textContent = hayConsultar
      ? (total > 0 ? `${fmtPrecio(total)} + a consultar` : "A consultar")
      : fmtPrecio(total);
    carritoNotaConsultarEl.hidden = !hayConsultar;

    carritoListaEl.querySelectorAll(".carrito-item").forEach((li) => {
      const id = li.dataset.id;
      li.querySelector('[data-rol="restar"]').addEventListener("click", () => cambiarCantidad(id, -1));
      li.querySelector('[data-rol="sumar"]').addEventListener("click", () => cambiarCantidad(id, 1));
      li.querySelector('[data-rol="quitar"]').addEventListener("click", () => quitarDelCarrito(id));
    });
  }

  gridProductos.addEventListener("click", (e) => {
    const btn = e.target.closest('[data-rol="agregar-carrito"]');
    if (!btn) return;
    agregarAlCarrito(btn.dataset.id);
  });

  // ---------------- Abrir / cerrar el panel (accesible) ----------------
  let elementoAntesDeAbrir = null;

  function atraparFoco(e) {
    if (e.key !== "Tab") return;
    const focosPosibles = carritoPanel.querySelectorAll(
      'button:not(:disabled), [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    if (focosPosibles.length === 0) return;
    const primero = focosPosibles[0];
    const ultimo = focosPosibles[focosPosibles.length - 1];
    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  }

  function onCarritoKeydown(e) {
    if (e.key === "Escape") {
      cerrarCarrito();
    } else {
      atraparFoco(e);
    }
  }

  function abrirCarrito() {
    elementoAntesDeAbrir = document.activeElement;
    renderCarrito();
    carritoOverlay.hidden = false;
    carritoPanel.hidden = false;
    requestAnimationFrame(() => {
      carritoOverlay.classList.add("is-open");
      carritoPanel.classList.add("is-open");
    });
    document.body.classList.add("no-scroll");
    carritoCerrarBtn.focus();
    document.addEventListener("keydown", onCarritoKeydown);
  }

  function cerrarCarrito() {
    carritoOverlay.classList.remove("is-open");
    carritoPanel.classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    document.removeEventListener("keydown", onCarritoKeydown);
    setTimeout(() => {
      carritoOverlay.hidden = true;
      carritoPanel.hidden = true;
    }, 250);
    if (elementoAntesDeAbrir && typeof elementoAntesDeAbrir.focus === "function") {
      elementoAntesDeAbrir.focus();
    }
  }

  carritoFlotanteBtn.addEventListener("click", abrirCarrito);
  carritoCerrarBtn.addEventListener("click", cerrarCarrito);
  carritoOverlay.addEventListener("click", cerrarCarrito);

  // ---------------- Enviar el pedido por WhatsApp ----------------
  carritoEnviarBtn.addEventListener("click", () => {
    const sacados = revalidarCarrito();
    if (sacados > 0 || carrito.items.length === 0) {
      // Si se sacó algo del carrito recién ahora, se muestra el aviso y se
      // frena el envío — el cliente ve qué cambió y confirma con un
      // segundo toque, en vez de mandar un pedido que ya no es el que armó.
      renderCarrito();
      return;
    }

    const nombre = carritoNombreInput.value.trim();
    const comentarios = carritoComentariosInput.value.trim();
    carrito.nombre = nombre;
    carrito.comentarios = comentarios;
    guardarCarrito();

    let total = 0;
    let hayConsultar = false;
    const lineasProductos = carrito.items.map((it) => {
      const p = buscarProducto(it.id);
      if (p.precio == null) {
        hayConsultar = true;
        return `${it.cantidad} x ${p.nombre} (${p.unidad}) — precio a consultar`;
      }
      const subtotal = p.precio * it.cantidad;
      total += subtotal;
      return `${it.cantidad} x ${p.nombre} (${p.unidad}) — ${fmtPrecio(subtotal)}`;
    });

    const lineas = ["Hola Euge! Quería hacer este pedido:", "", ...lineasProductos, ""];

    lineas.push(`Total: ${fmtPrecio(total)}${hayConsultar ? " (sin contar los productos a consultar)" : ""}`);

    if (nombre) lineas.push(`Nombre: ${nombre}`);
    if (comentarios) lineas.push(`Comentarios: ${comentarios}`);

    lineas.push("", "Los precios se confirman al responder.");

    window.open(linkWhatsApp(lineas.join("\n")), "_blank", "noopener");
  });

  // ------------------------------------------------------------------
  // CATERING: combos, bocaditos, personalizados, condiciones
  // ------------------------------------------------------------------
  document.getElementById("catering-intro").textContent = PICHONA.catering.intro;

  // El nombre de archivo (sin carpeta ni extensión) de la foto de cada
  // combo es, a la vez, el id de su fila en "site_images" — así, si dos
  // combos comparten la misma foto de fábrica (como Lunch Box y Un toque
  // gourmet, que todavía comparten bocaditos-frios.jpg), compartir el id
  // es automático y no hay que mantener un mapeo aparte.
  function idImagenDesdeRuta(ruta) {
    const match = /([^/]+)\.[a-z0-9]+$/i.exec(ruta || "");
    return match ? match[1] : null;
  }

  // combos, pedidos personalizados y las casillas del form de cotización se
  // arman con funciones (no solo una vez al cargar) porque los tres se
  // vuelven a dibujar cuando llega el contenido en vivo de Supabase más
  // abajo — igual que ya pasaba con los tabs de categorías.
  function comboCardHTML(c) {
    const precioHTML = c.precio == null
      ? `<p class="combo-card__precio">Consultar</p>`
      : `<p class="combo-card__precio">${fmtPrecio(c.precio)} <span style="font-weight:400;color:#CBBEA9;font-size:0.8rem;"> / ${c.unidad}</span></p>`;
    return `
      <article class="combo-card${c.destacado ? " combo-card--destacado" : ""}">
        <div class="combo-card__img">
          <img src="${c.imagen}" alt="${c.nombre}" loading="lazy" width="600" height="450" data-site-image="${idImagenDesdeRuta(c.imagen)}">
        </div>
        <div class="combo-card__body">
          <h3>${c.nombre}</h3>
          ${precioHTML}
          <p class="combo-card__desc">${c.descripcion}</p>
          <ul class="combo-card__incluye">
            ${c.incluye.map((i) => `<li>${i}</li>`).join("")}
          </ul>
        </div>
      </article>`;
  }

  function renderCateringCombos() {
    document.getElementById("catering-combos").innerHTML = PICHONA.catering.combos.map(comboCardHTML).join("");
  }

  function renderCateringPedidos() {
    document.getElementById("catering-personalizados").innerHTML = PICHONA.catering.pedidosPersonalizados
      .map((p) => {
        const precioHTML = p.precio == null ? "Consultar" : fmtPrecio(p.precio);
        return `<li><strong>${p.nombre}</strong><span>${p.descripcion}</span> <span class="precio-pers">${precioHTML}</span></li>`;
      })
      .join("");
  }

  function renderComboCheckboxes() {
    document.getElementById("cat-combos-checkboxes").innerHTML = PICHONA.catering.combos
      .map(
        (c) => `
        <label class="checkbox-item">
          <input type="checkbox" name="interes" value="${c.nombre}">
          ${c.nombre}
        </label>`
      )
      .join("");
  }

  renderCateringCombos();

  document.getElementById("bocaditos-frios").innerHTML = PICHONA.catering.bocaditosFrios
    .map((b) => `<li><strong>${b.nombre}</strong><span>${b.variedades}</span></li>`)
    .join("");

  document.getElementById("bocaditos-calientes").innerHTML = PICHONA.catering.bocaditosCalientes
    .map((b) => `<li><strong>${b.nombre}</strong></li>`)
    .join("");

  renderCateringPedidos();

  document.getElementById("catering-condiciones").innerHTML = PICHONA.catering.condiciones
    .map((c) => `<li>${c}</li>`)
    .join("");

  renderComboCheckboxes();

  // ------------------------------------------------------------------
  // CONTENIDO DE CATERING EN VIVO (Supabase) — opcional
  //
  // Los combos y los pedidos personalizados se pueden editar desde el
  // panel de admin sin tocar código — viven en "catering_combos" y
  // "catering_pedidos". El id interno de cada uno no cambia nunca, solo
  // nombre/precio/unidad/descripción (y, en los combos, la lista de
  // ítems incluidos). Las FOTOS de los combos siguen viniendo de
  // "site_images", no de acá. Si no está configurado o falla la red, se
  // sigue mostrando el contenido fijo de js/data.js.
  // ------------------------------------------------------------------
  async function cargarCateringEnVivo() {
    const sb = crearClienteSupabase();
    if (!sb) return;

    try {
      const [combosRes, pedidosRes] = await Promise.all([
        sb.from("catering_combos").select("*"),
        sb.from("catering_pedidos").select("*")
      ]);
      if (combosRes.error) throw combosRes.error;
      if (pedidosRes.error) throw pedidosRes.error;

      const combosPorId = {};
      (combosRes.data || []).forEach((fila) => { combosPorId[fila.id] = fila; });
      PICHONA.catering.combos.forEach((c) => {
        const fila = combosPorId[c.id];
        if (!fila) return;
        c.nombre = fila.nombre;
        c.precio = fila.precio;
        c.unidad = fila.unidad;
        c.descripcion = fila.descripcion || "";
        c.incluye = (fila.incluye || "").split("\n").map((linea) => linea.trim()).filter(Boolean);
      });

      const pedidosPorId = {};
      (pedidosRes.data || []).forEach((fila) => { pedidosPorId[fila.id] = fila; });
      PICHONA.catering.pedidosPersonalizados.forEach((p) => {
        const fila = pedidosPorId[p.id];
        if (!fila) return;
        p.nombre = fila.nombre;
        p.precio = fila.precio;
        p.descripcion = fila.descripcion || "";
      });

      renderCateringCombos();
      renderCateringPedidos();
      renderComboCheckboxes();
    } catch (err) {
      console.warn("No se pudo cargar el contenido de catering en vivo de Supabase, se sigue mostrando el fijo.", err);
    }
  }

  cargarCateringEnVivo();

  // ------------------------------------------------------------------
  // FORMULARIO DE COTIZACIÓN DE CATERING → WhatsApp
  // ------------------------------------------------------------------
  const formCatering = document.getElementById("form-catering");

  function setError(campoId, mensaje) {
    const span = formCatering.querySelector(`[data-error-for="${campoId}"]`);
    if (span) span.textContent = mensaje || "";
  }

  formCatering.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = formCatering.nombre.value.trim();
    const telefono = formCatering.telefono.value.trim();
    const tipoEvento = formCatering.tipoEvento.value.trim();
    const fecha = formCatering.fecha.value;
    const personas = formCatering.personas.value.trim();
    const comentarios = formCatering.comentarios.value.trim();
    const intereses = Array.from(formCatering.querySelectorAll('input[name="interes"]:checked')).map((i) => i.value);

    let valido = true;
    setError("cat-nombre", ""); setError("cat-telefono", ""); setError("cat-tipo-evento", "");
    setError("cat-fecha", ""); setError("cat-personas", "");

    if (!nombre) { setError("cat-nombre", "Contanos tu nombre."); valido = false; }
    if (!telefono || telefono.length < 6) { setError("cat-telefono", "Dejanos un teléfono de contacto."); valido = false; }
    if (!tipoEvento) { setError("cat-tipo-evento", "¿Qué tipo de evento es?"); valido = false; }
    if (!fecha) { setError("cat-fecha", "Elegí una fecha tentativa."); valido = false; }
    if (!personas || Number(personas) < 1) { setError("cat-personas", "¿Para cuántas personas?"); valido = false; }

    if (!valido) return;

    const fechaLegible = new Date(fecha + "T00:00:00").toLocaleDateString("es-AR", {
      day: "numeric", month: "long", year: "numeric"
    });

    const lineas = [
      "Hola Euge! Quería pedir una cotización para catering.",
      "",
      `Nombre: ${nombre}`,
      `Teléfono: ${telefono}`,
      `Tipo de evento: ${tipoEvento}`,
      `Fecha: ${fechaLegible}`,
      `Cantidad de personas: ${personas}`,
      `Me interesa: ${intereses.length ? intereses.join(", ") : "a definir"}`
    ];

    if (comentarios) {
      lineas.push(`Comentarios: ${comentarios}`);
    }

    window.open(linkWhatsApp(lineas.join("\n")), "_blank", "noopener");
  });

  // ------------------------------------------------------------------
  // TESTIMONIOS
  // ------------------------------------------------------------------
  document.getElementById("grid-testimonios").innerHTML = PICHONA.testimonios
    .map(
      (t) => `
      <blockquote class="testimonio-card">
        <p class="testimonio-card__texto">&ldquo;${t.texto}&rdquo;</p>
        <cite class="testimonio-card__autor">${t.autor}</cite>
      </blockquote>`
    )
    .join("");

  // ------------------------------------------------------------------
  // HORARIOS
  // ------------------------------------------------------------------
  document.getElementById("tabla-horarios-body").innerHTML = PICHONA.negocio.horarios
    .map((h) => `<tr><td>${h.dias}</td><td>${h.horario}</td></tr>`)
    .join("");
})();
