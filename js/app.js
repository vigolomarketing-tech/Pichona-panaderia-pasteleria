/**
 * Pichona — lógica del sitio.
 * Todo lo que ves acá lee los datos de js/data.js (objeto PICHONA).
 * No hay precios ni textos de productos hardcodeados en este archivo.
 */
(function () {
  "use strict";

  const fmtPrecio = (valor) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(valor);

  const linkWhatsApp = (mensaje) =>
    `${PICHONA.negocio.whatsapp}?text=${encodeURIComponent(mensaje)}`;

  // ------------------------------------------------------------------
  // CATÁLOGO: tabs, buscador y grilla
  // ------------------------------------------------------------------
  const gridProductos = document.getElementById("grid-productos");
  const tabsWrap = document.getElementById("tabs-categorias");
  const buscadorInput = document.getElementById("buscador-input");
  const catalogoVacio = document.getElementById("catalogo-vacio");

  let categoriaActiva = "todas";
  let terminoBusqueda = "";

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

    const mensaje = `Hola Euge! Quería encargar: ${p.nombre}`;
    const botonPedir = p.disponible
      ? `<a class="btn btn--whatsapp btn--small" href="${linkWhatsApp(mensaje)}" target="_blank" rel="noopener">Pedir</a>`
      : `<span class="badge-agotado">De temporada</span>`;

    return `
      <article class="producto-card${p.destacado ? " producto-card--destacado" : ""}">
        <div class="producto-card__img">
          <img src="${p.imagen}" alt="${p.nombre}" loading="lazy" width="600" height="600">
        </div>
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
    const filtrados = PICHONA.productos.filter((p) => {
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
  // CATERING: combos, bocaditos, personalizados, condiciones
  // ------------------------------------------------------------------
  document.getElementById("catering-intro").textContent = PICHONA.catering.intro;

  document.getElementById("catering-combos").innerHTML = PICHONA.catering.combos
    .map((c) => {
      const precioHTML = c.precio == null
        ? `<p class="combo-card__precio">Consultar</p>`
        : `<p class="combo-card__precio">${fmtPrecio(c.precio)} <span style="font-weight:400;color:#CBBEA9;font-size:0.8rem;"> / ${c.unidad}</span></p>`;
      return `
      <article class="combo-card${c.destacado ? " combo-card--destacado" : ""}">
        <div class="combo-card__img">
          <img src="${c.imagen}" alt="${c.nombre}" loading="lazy" width="600" height="450">
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
    })
    .join("");

  document.getElementById("bocaditos-frios").innerHTML = PICHONA.catering.bocaditosFrios
    .map((b) => `<li><strong>${b.nombre}</strong><span>${b.variedades}</span></li>`)
    .join("");

  document.getElementById("bocaditos-calientes").innerHTML = PICHONA.catering.bocaditosCalientes
    .map((b) => `<li><strong>${b.nombre}</strong></li>`)
    .join("");

  document.getElementById("catering-personalizados").innerHTML = PICHONA.catering.pedidosPersonalizados
    .map(
      (p) => `<li><strong>${p.nombre}</strong><span>${p.descripcion}</span> <span class="precio-pers">${fmtPrecio(p.precio)}</span></li>`
    )
    .join("");

  document.getElementById("catering-condiciones").innerHTML = PICHONA.catering.condiciones
    .map((c) => `<li>${c}</li>`)
    .join("");

  document.getElementById("cat-combos-checkboxes").innerHTML = PICHONA.catering.combos
    .map(
      (c) => `
      <label class="checkbox-item">
        <input type="checkbox" name="interes" value="${c.nombre}">
        ${c.nombre}
      </label>`
    )
    .join("");

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
