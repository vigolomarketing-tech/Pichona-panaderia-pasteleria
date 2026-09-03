/**
 * ============================================================================
 * PICHONA — Panadería y Pastelería — datos del sitio
 * ============================================================================
 *
 * ESTE ES EL ÚNICO ARCHIVO QUE HAY QUE TOCAR PARA CAMBIAR PRECIOS Y PRODUCTOS.
 * No hay precios escritos en el HTML: todo el sitio lee de acá.
 *
 * Si en el futuro esto se conecta a una base de datos (Supabase) y a un
 * panel de administración, cada producto ya tiene la forma que necesita:
 * id, nombre, precio, unidad, descripcion, categoria, imagen, destacado,
 * disponible. Ese día, en vez de leer el array PICHONA.productos de acá,
 * la página va a pedirle los mismos campos a la base de datos.
 *
 * Al final del archivo hay una guía para agregar o editar productos sin
 * saber programar.
 * ============================================================================
 */

const PICHONA = {

  // --------------------------------------------------------------------
  // DATOS DEL NEGOCIO
  // --------------------------------------------------------------------
  negocio: {
    nombre: "Pichona",
    subtitulo: "Panadería y pastelería artesanal",
    duena: "Euge",
    frase: "Soy panadera y pastelera de alma. Creo recetas únicas para que conviertas cualquier momento en algo especial.",
    direccion: "Mitre 1997, José Mármol, Buenos Aires",
    direccionDetalle: "A media cuadra de la estación de José Mármol, del lado de Adrogué.",
    telefono: "5491161963603",
    telefonoVisible: "11 6196-3603",
    whatsapp: "https://wa.me/5491161963603",
    instagram: "https://instagram.com/eugeecocina",
    instagramUsuario: "@eugeecocina",
    mapaEmbed: "https://www.google.com/maps?q=Mitre+1997,+Jos%C3%A9+M%C3%A1rmol,+Buenos+Aires&output=embed",
    geo: { lat: -34.8181, lng: -58.3922 },
    horarios: [
      { dias: "Martes a sábados", horario: "8:30 a 13:30 y 16:00 a 20:00" },
      { dias: "Domingos", horario: "9:00 a 13:30" },
      { dias: "Lunes", horario: "Cerrado" }
    ]
  },

  // --------------------------------------------------------------------
  // CATEGORÍAS DEL CATÁLOGO (para las tabs/filtros)
  // El "id" tiene que coincidir con el campo "categoria" de cada producto.
  // --------------------------------------------------------------------
  categorias: [
    { id: "panaderia", nombre: "Panadería" },
    { id: "pasteleria", nombre: "Pastelería" },
    { id: "petit-fours-tartitas", nombre: "Petit fours y tartitas" },
    { id: "salados", nombre: "Salados" },
    { id: "almacen", nombre: "Almacén" }
  ],

  // --------------------------------------------------------------------
  // CATÁLOGO DE PRODUCTOS
  // --------------------------------------------------------------------
  productos: [

    // ---------- PANADERÍA ----------
    { id: "pan-campo", nombre: "Pan de campo", precio: 2200, unidad: "unidad", descripcion: "Pan de campo artesanal, corteza crocante y miga tierna.", categoria: "panaderia", imagen: "assets/img/vitrina.jpg", destacado: false, disponible: true },
    { id: "pan-integral", nombre: "Pan integral", precio: 3800, unidad: "unidad", descripcion: "Pan integral de harinas seleccionadas.", categoria: "panaderia", imagen: "assets/img/vitrina.jpg", destacado: false, disponible: true },
    { id: "pan-frances", nombre: "Pan francés", precio: 3600, unidad: "kilo", descripcion: "Clásico pan francés, ideal para toda ocasión.", categoria: "panaderia", imagen: "assets/img/vitrina.jpg", destacado: false, disponible: true },
    { id: "figacitas", nombre: "Figacitas", precio: 5000, unidad: "kilo", descripcion: "Figacitas surtidas, todas las variedades.", categoria: "panaderia", imagen: "assets/img/vitrina.jpg", destacado: false, disponible: true },
    { id: "pan-relleno", nombre: "Pan relleno", precio: 8000, unidad: "unidad", descripcion: "Sabores: panceta y cebolla / puerro y roquefort / ajo y manteca / caprese.", categoria: "panaderia", imagen: "assets/img/panes-rellenos.jpg", destacado: true, disponible: true },
    { id: "cremona-manteca", nombre: "Cremona de manteca", precio: 12000, unidad: "kilo", descripcion: "Cremona bien mantecosa, hojaldrada.", categoria: "panaderia", imagen: "assets/img/vitrina.jpg", destacado: false, disponible: true },
    { id: "cremona-grasa", nombre: "Cremona de grasa", precio: 9000, unidad: "kilo", descripcion: "Cremona tradicional de grasa.", categoria: "panaderia", imagen: "assets/img/vitrina.jpg", destacado: false, disponible: true },
    { id: "facturas", nombre: "Facturas", precio: 14000, unidad: "docena", descripcion: "Surtidas. También se venden por unidad a $1.500 hasta media docena.", categoria: "panaderia", imagen: "assets/img/vitrina.jpg", destacado: true, disponible: true },
    { id: "chipa", nombre: "Chipá", precio: 8000, unidad: "cuarto kilo", descripcion: "Chipá recién horneado.", categoria: "panaderia", imagen: "assets/img/vitrina.jpg", destacado: false, disponible: true },
    { id: "pan-chocolate", nombre: "Pan de chocolate", precio: 3000, unidad: "unidad", descripcion: "Pan relleno con chocolate.", categoria: "panaderia", imagen: "assets/img/vitrina.jpg", destacado: false, disponible: true },

    // ---------- PASTELERÍA ----------
    { id: "budines", nombre: "Budines", precio: 9000, unidad: "unidad", descripcion: "Naranja / limón / mandarina con chips de chocolate 80% / algarroba con banana y dulce de leche inyectado / vainilla.", categoria: "pasteleria", imagen: "assets/img/budines.jpg", destacado: true, disponible: true },
    { id: "budines-especiales", nombre: "Budines especiales", precio: 11000, unidad: "unidad", descripcion: "Carrot con nuez / zapallo / batata y chocolate.", categoria: "pasteleria", imagen: "assets/img/budines.jpg", destacado: false, disponible: true },
    { id: "alfajores-euge", nombre: "Alfajores by Euge", precio: 3000, unidad: "unidad", descripcion: "Blanco y negro.", categoria: "pasteleria", imagen: "assets/img/alfajores-blanco.jpg", destacado: true, disponible: true },
    { id: "alfajores-cocon", nombre: "Alfajores Café Gran Cocon", precio: 3000, unidad: "unidad", descripcion: "Directo desde Chubut.", categoria: "pasteleria", imagen: "assets/img/alfajores-negro.jpg", destacado: false, disponible: true },
    { id: "crumble-frutos-rojos", nombre: "Crumble de frutos rojos", precio: 5000, unidad: "porción", descripcion: "Crumble casero con frutos rojos.", categoria: "pasteleria", imagen: "assets/img/vitrina.jpg", destacado: false, disponible: true },
    { id: "brownies-con-nuez", nombre: "Brownies con nuez", precio: 6000, unidad: "unidad", descripcion: "Brownie húmedo con nuez.", categoria: "pasteleria", imagen: "assets/img/vitrina.jpg", destacado: false, disponible: true },
    { id: "brownies-sin-nuez", nombre: "Brownies sin nuez", precio: 5000, unidad: "unidad", descripcion: "Brownie húmedo sin nuez.", categoria: "pasteleria", imagen: "assets/img/vitrina.jpg", destacado: false, disponible: true },
    { id: "torta-avellanas", nombre: "Torta de avellanas", precio: 6000, unidad: "100 gr", descripcion: "Torta de avellanas.", categoria: "pasteleria", imagen: "assets/img/vitrina.jpg", destacado: false, disponible: true },
    { id: "stollen", nombre: "Stollen", precio: 20000, unidad: "medio kilo", descripcion: "Pan dulce alemán con frutos secos y azúcar impalpable.", categoria: "pasteleria", imagen: "assets/img/pan-dulce.jpg", destacado: false, disponible: true },
    { id: "barritas-limon-coco", nombre: "Barritas de limón / coco", precio: 2500, unidad: "unidad", descripcion: "Barritas de limón o de coco.", categoria: "pasteleria", imagen: "assets/img/vitrina.jpg", destacado: false, disponible: true },
    { id: "florentinos-cascaritas", nombre: "Florentinos y cascaritas", precio: 6000, unidad: "100 gr", descripcion: "Florentinos y cascaritas confitadas.", categoria: "pasteleria", imagen: "assets/img/vitrina.jpg", destacado: false, disponible: true },
    { id: "biscotti", nombre: "Biscotti", precio: 2500, unidad: "50 gr", descripcion: "Biscotti crocante.", categoria: "pasteleria", imagen: "assets/img/vitrina.jpg", destacado: false, disponible: true },
    { id: "bombones-nuez-datiles", nombre: "Bombones de nuez y dátiles", precio: 8000, unidad: "100 gr", descripcion: "Bombones artesanales de nuez y dátiles.", categoria: "pasteleria", imagen: "assets/img/vitrina.jpg", destacado: false, disponible: true },
    { id: "pan-dulce-genoves", nombre: "Pan dulce genovés Pichona", precio: null, unidad: "medio kilo", descripcion: "Receta de Teresa Lanzillotta, campeona nacional FITEHP 2024. Presentación especial Pichona de medio kilo. Producto de temporada — consultar disponibilidad y precio.", categoria: "pasteleria", imagen: "assets/img/pan-dulce.jpg", destacado: true, disponible: false },

    // Tortas de 20 cm para mesa dulce
    { id: "torta-bomba", nombre: "Torta bomba (20 cm)", precio: 60000, unidad: "unidad", descripcion: "Torta bomba para mesa dulce, 20 cm.", categoria: "pasteleria", imagen: "assets/img/vitrina.jpg", destacado: false, disponible: true },
    { id: "torta-franui", nombre: "Torta Franui (20 cm)", precio: 70000, unidad: "unidad", descripcion: "Torta Franui para mesa dulce, 20 cm.", categoria: "pasteleria", imagen: "assets/img/vitrina.jpg", destacado: false, disponible: true },
    { id: "torta-cheesecake", nombre: "Torta cheesecake (20 cm)", precio: 60000, unidad: "unidad", descripcion: "Cheesecake para mesa dulce, 20 cm.", categoria: "pasteleria", imagen: "assets/img/vitrina.jpg", destacado: false, disponible: true },
    { id: "torta-ricota-pastafrola", nombre: "Torta de ricota / pastafrola (20 cm)", precio: 35000, unidad: "unidad", descripcion: "Torta de ricota o pastafrola, 20 cm.", categoria: "pasteleria", imagen: "assets/img/vitrina.jpg", destacado: false, disponible: true },
    { id: "torta-crumble", nombre: "Torta crumble (20 cm)", precio: 45000, unidad: "unidad", descripcion: "Torta crumble para mesa dulce, 20 cm.", categoria: "pasteleria", imagen: "assets/img/vitrina.jpg", destacado: false, disponible: true },
    { id: "torta-lemon-pie", nombre: "Torta lemon pie (20 cm)", precio: 45000, unidad: "unidad", descripcion: "Torta lemon pie para mesa dulce, 20 cm.", categoria: "pasteleria", imagen: "assets/img/vitrina.jpg", destacado: false, disponible: true },
    { id: "torta-ganache-dulce-leche", nombre: "Torta ganache con dulce de leche (20 cm)", precio: 45000, unidad: "unidad", descripcion: "Torta de ganache con dulce de leche, 20 cm.", categoria: "pasteleria", imagen: "assets/img/vitrina.jpg", destacado: false, disponible: true },
    { id: "torta-coco-dulce-leche", nombre: "Torta coco y dulce de leche (20 cm)", precio: 45000, unidad: "unidad", descripcion: "Torta de coco y dulce de leche, 20 cm.", categoria: "pasteleria", imagen: "assets/img/vitrina.jpg", destacado: false, disponible: true },
    { id: "torta-pastelera-frutilla", nombre: "Torta pastelera y frutilla (20 cm)", precio: 45000, unidad: "unidad", descripcion: "Torta de crema pastelera y frutilla, 20 cm.", categoria: "pasteleria", imagen: "assets/img/vitrina.jpg", destacado: false, disponible: true },

    // ---------- PETIT FOURS Y TARTITAS ----------
    { id: "petit-fours", nombre: "Petit fours", precio: 50000, unidad: "kilo", descripcion: "Surtido de petit fours artesanales.", categoria: "petit-fours-tartitas", imagen: "assets/img/petit-fours-1.jpg", destacado: true, disponible: true },
    { id: "tartita-ricota", nombre: "Tartita individual de ricota", precio: 6000, unidad: "unidad", descripcion: "Tartita individual de ricota.", categoria: "petit-fours-tartitas", imagen: "assets/img/tartitas-1.jpg", destacado: false, disponible: true },
    { id: "tartita-crumble", nombre: "Tartita individual de crumble", precio: 10000, unidad: "unidad", descripcion: "Tartita individual de crumble.", categoria: "petit-fours-tartitas", imagen: "assets/img/tartitas-1.jpg", destacado: false, disponible: true },
    { id: "tartita-ganache", nombre: "Tartita individual de ganache", precio: 10000, unidad: "unidad", descripcion: "Tartita individual de ganache.", categoria: "petit-fours-tartitas", imagen: "assets/img/tartitas-1.jpg", destacado: false, disponible: true },
    { id: "tartita-chocolate", nombre: "Tartita individual de chocolate", precio: 10000, unidad: "unidad", descripcion: "Tartita individual de chocolate.", categoria: "petit-fours-tartitas", imagen: "assets/img/tartitas-2.jpg", destacado: false, disponible: true },
    { id: "tartita-dulce-leche", nombre: "Tartita individual de dulce de leche", precio: 10000, unidad: "unidad", descripcion: "Tartita individual de dulce de leche.", categoria: "petit-fours-tartitas", imagen: "assets/img/tartitas-2.jpg", destacado: false, disponible: true },
    { id: "tartita-lemon-pie", nombre: "Tartita individual de lemon pie", precio: 11000, unidad: "unidad", descripcion: "Tartita individual de lemon pie.", categoria: "petit-fours-tartitas", imagen: "assets/img/tartitas-2.jpg", destacado: false, disponible: true },
    { id: "tartita-cheesecake", nombre: "Tartita individual de cheesecake", precio: 11000, unidad: "unidad", descripcion: "Tartita individual de cheesecake.", categoria: "petit-fours-tartitas", imagen: "assets/img/tartitas-2.jpg", destacado: false, disponible: true },
    { id: "tartita-bomba", nombre: "Tartita individual bomba", precio: 11000, unidad: "unidad", descripcion: "Tartita individual bomba.", categoria: "petit-fours-tartitas", imagen: "assets/img/tartitas-1.jpg", destacado: false, disponible: true },
    { id: "tartita-franui", nombre: "Tartita individual Franui", precio: 14000, unidad: "unidad", descripcion: "Tartita individual Franui.", categoria: "petit-fours-tartitas", imagen: "assets/img/tartitas-1.jpg", destacado: true, disponible: true },

    // ---------- SALADOS (galletitas y salados) ----------
    { id: "scones-roquefort", nombre: "Scones de queso roquefort", precio: 8000, unidad: "cuarto kilo", descripcion: "Scones de queso roquefort.", categoria: "salados", imagen: "assets/img/snacks-salados.jpg", destacado: false, disponible: true },
    { id: "galletas-hierbas", nombre: "Galletas de hierbas", precio: 3500, unidad: "100 gr", descripcion: "Galletas saladas de hierbas.", categoria: "salados", imagen: "assets/img/snacks-salados.jpg", destacado: false, disponible: true },
    { id: "galletas-miel", nombre: "Galletas de miel", precio: 4500, unidad: "cuarto kilo", descripcion: "Galletas de miel.", categoria: "salados", imagen: "assets/img/snacks-salados.jpg", destacado: false, disponible: true },
    { id: "bizcochitos", nombre: "Bizcochitos", precio: 4000, unidad: "cuarto kilo", descripcion: "Bizcochitos tradicionales.", categoria: "salados", imagen: "assets/img/snacks-salados.jpg", destacado: false, disponible: true },
    { id: "palmeritas", nombre: "Palmeritas", precio: 4000, unidad: "150 gr", descripcion: "Palmeritas hojaldradas.", categoria: "salados", imagen: "assets/img/snacks-salados.jpg", destacado: false, disponible: true },
    { id: "tostadas-focaccia", nombre: "Tostadas de focaccia", precio: 3500, unidad: "150 gr", descripcion: "Tostadas de focaccia crocantes.", categoria: "salados", imagen: "assets/img/focaccia.jpg", destacado: false, disponible: true },
    { id: "snacks-frutos-secos", nombre: "Snacks salados de frutos secos", precio: 8000, unidad: "100 gr", descripcion: "Snacks salados de frutos secos.", categoria: "salados", imagen: "assets/img/snacks-salados.jpg", destacado: false, disponible: true },
    { id: "prepizza-tomate", nombre: "Prepizza de tomate", precio: 2000, unidad: "unidad", descripcion: "Prepizza con salsa de tomate.", categoria: "salados", imagen: "assets/img/snacks-salados.jpg", destacado: false, disponible: true },
    { id: "prepizza-cebolla", nombre: "Prepizza de cebolla", precio: 2500, unidad: "unidad", descripcion: "Prepizza de cebolla.", categoria: "salados", imagen: "assets/img/snacks-salados.jpg", destacado: false, disponible: true },
    { id: "prepizza-mixta", nombre: "Prepizza mixta", precio: 2300, unidad: "unidad", descripcion: "Prepizza mixta.", categoria: "salados", imagen: "assets/img/snacks-salados.jpg", destacado: false, disponible: true },
    { id: "tarta-verdura-individual", nombre: "Tarta de verdura individual", precio: 6000, unidad: "unidad", descripcion: "Zapallito y zanahoria / espinaca / zapallo y puerro.", categoria: "salados", imagen: "assets/img/snacks-salados.jpg", destacado: false, disponible: true },
    { id: "tarta-verdura-hongos", nombre: "Tarta de verdura con hongos", precio: 7000, unidad: "unidad", descripcion: "Tarta de verdura con hongos.", categoria: "salados", imagen: "assets/img/snacks-salados.jpg", destacado: false, disponible: true },
    { id: "focaccia", nombre: "Focaccia", precio: 6000, unidad: "unidad", descripcion: "Focaccia artesanal.", categoria: "salados", imagen: "assets/img/focaccia.jpg", destacado: true, disponible: true },
    { id: "sandwiches-miga", nombre: "Sándwiches de miga", precio: 4000, unidad: "unidad", descripcion: "Sándwiches de miga surtidos.", categoria: "salados", imagen: "assets/img/snacks-salados.jpg", destacado: false, disponible: true },
    { id: "fosforitos", nombre: "Fosforitos de jamón y queso", precio: 5000, unidad: "unidad", descripcion: "Fosforitos de jamón y queso.", categoria: "salados", imagen: "assets/img/snacks-salados.jpg", destacado: false, disponible: true },
    { id: "medialunas-jyq", nombre: "Medialunas con jamón y queso", precio: 3000, unidad: "unidad", descripcion: "Medialunas rellenas de jamón y queso.", categoria: "salados", imagen: "assets/img/snacks-salados.jpg", destacado: false, disponible: true },

    // ---------- ALMACÉN ----------
    { id: "dulce-frutos-rojos", nombre: "Dulce casero de frutos rojos / frambuesa", precio: 12000, unidad: "unidad", descripcion: "Dulce casero de frutos rojos o frambuesa.", categoria: "almacen", imagen: "assets/img/dulces-caseros.jpg", destacado: false, disponible: true },
    { id: "dulce-frutilla", nombre: "Dulce casero de frutilla", precio: 10000, unidad: "unidad", descripcion: "Dulce casero de frutilla.", categoria: "almacen", imagen: "assets/img/dulces-caseros.jpg", destacado: false, disponible: true },
    { id: "berenjenas-agridulces", nombre: "Berenjenas agridulces", precio: 6000, unidad: "unidad", descripcion: "Berenjenas agridulces caseras.", categoria: "almacen", imagen: "assets/img/dulces-caseros.jpg", destacado: false, disponible: true },
    { id: "girgolas-encargo", nombre: "Gírgolas (por encargo)", precio: 6000, unidad: "caja de un cuarto", descripcion: "Gírgolas frescas, por encargo.", categoria: "almacen", imagen: "assets/img/dulces-caseros.jpg", destacado: false, disponible: true },
    { id: "girgolas-escabeche", nombre: "Gírgolas en escabeche", precio: 7000, unidad: "unidad", descripcion: "Gírgolas en escabeche casero.", categoria: "almacen", imagen: "assets/img/dulces-caseros.jpg", destacado: false, disponible: true }
  ],

  // --------------------------------------------------------------------
  // CATERING PARA EVENTOS
  // --------------------------------------------------------------------
  catering: {

    intro: "Para reuniones, cumpleaños, eventos de empresa o la mesa dulce de tu casamiento: armamos propuestas a medida combinando dulce y salado según el evento.",

    condiciones: [
      "Encargos con 1 semana de anticipación.",
      "Retiro por el local (Mitre 1997, José Mármol).",
      "Las propuestas se arman a medida combinando dulce y salado según el evento."
    ],

    // Combos armados — se muestran como cards destacadas
    combos: [
      {
        id: "lunch-box-20",
        nombre: "Lunch Box 20 personas",
        precio: 280000,
        unidad: "combo",
        descripcion: "Ideal para reuniones familiares o laborales.",
        incluye: [
          "1 docena de medialunas de jamón y queso",
          "1 docena de medialunas de jamón crudo y rúcula",
          "2 docenas de sándwiches de peceto y tomate",
          "2 docenas de pizzetas con tomate",
          "2 docenas de empanaditas de carne",
          "60 bocaditos calientes",
          "60 bocaditos fríos"
        ],
        imagen: "assets/img/bocaditos-frios.jpg",
        destacado: true
      },
      {
        id: "caja-30-bocaditos",
        nombre: "Caja de 30 bocaditos",
        precio: 60000,
        unidad: "caja",
        descripcion: "Tres variedades por caja, comen 3 personas. Para eventos, picadas o reuniones.",
        incluye: ["3 variedades de bocaditos a elección"],
        imagen: "assets/img/bocaditos-calientes.jpg",
        destacado: false
      },
      {
        id: "toque-gourmet",
        nombre: "Un toque gourmet",
        precio: 25000,
        unidad: "10 unidades",
        descripcion: "Experiencia premium que se puede agregar a cualquier propuesta.",
        incluye: [
          "Roll de pan de miga con salmón rosado y palta",
          "Langostinos bahianos con salsa tamarindo"
        ],
        imagen: "assets/img/bocaditos-frios.jpg",
        destacado: true
      },
      {
        id: "mesa-dulce",
        nombre: "Mesa dulce",
        precio: null,
        unidad: "a medida",
        descripcion: "Armamos tu mesa dulce combinando nuestras tortas de 20 cm, petit fours y tartitas individuales. Consultanos según cantidad de invitados.",
        incluye: ["Tortas de 20 cm a elección", "Petit fours", "Tartitas individuales"],
        imagen: "assets/img/petit-fours-2.jpg",
        destacado: false
      }
    ],

    // Pedidos personalizados por unidad
    pedidosPersonalizados: [
      { id: "sandwiches-figacitas", nombre: "Sándwiches de figacitas (x12)", precio: 25000, unidad: "docena", descripcion: "Pan de 6 cm. Jamón y queso / pollo y apio / peceto y tomate / berenjenas, tomate, albahaca y queso." },
      { id: "medialunas-rellenas", nombre: "Medialunas rellenas (x12)", precio: 30000, unidad: "docena", descripcion: "Jamón y queso / crudo y rúcula / caprese." },
      { id: "pizzetas", nombre: "Pizzetas (x12)", precio: 12000, unidad: "docena", descripcion: "Pizzetas para picada o evento." },
      { id: "empanadas-copetin", nombre: "Empanadas de copetín (x12)", precio: 14000, unidad: "docena", descripcion: "Empanadas de copetín." }
    ],

    // Listado de bocaditos fríos (para catering, sin precio individual — van en cajas/combos)
    bocaditosFrios: [
      { nombre: "Rolls de pan de miga", variedades: "Rúcula y crudo / jamón y queso / jamón y ananá" },
      { nombre: "Scones de hierbas", variedades: "Roquefort y nuez / queso crema y crudo" },
      { nombre: "Pinchos", variedades: "Caprese / berenjenas asadas y queso / dátiles con queso crema y crudo / palmitos, ananá y jamón cocido" },
      { nombre: "Frutas gourmet", variedades: "Dátiles con queso y páprika / higos con roquefort / ciruelas con queso crema y almendras tostadas" },
      { nombre: "Pudding", variedades: "Puerro y jamón crudo / dátiles con queso brie" }
    ],

    // Listado de bocaditos calientes
    bocaditosCalientes: [
      { nombre: "Croquetas de papa" },
      { nombre: "Buñuelos de espinaca" },
      { nombre: "Pinchos de pollo con panceta y ciruela" },
      { nombre: "Pinchos de lomo con panceta y verduras" },
      { nombre: "Crispi de pollo con barbacoa" },
      { nombre: "Tartitas de champiñón" },
      { nombre: "Tartitas de espinaca y ciruela" },
      { nombre: "Fosforitos de jamón y queso" },
      { nombre: "Paquetitos de carne especiada" }
    ]
  },

  // --------------------------------------------------------------------
  // TESTIMONIOS (texto real de clientes — no capturas de pantalla)
  // --------------------------------------------------------------------
  testimonios: [
    { autor: "@juancu74", texto: "Siii apetecible!! El sábado pasé y no sabía qué llevarme, entonces me llevé masitas, petit, biscochitos, pan de campo también, alfajores. ¡Todo rico! Felicitaciones @eugeecocina." },
    { autor: "@estelabalbinaallende", texto: "¡Excelente! Lo que me llevé: pan de campo, medialunas de manteca y grasa, unas galletitas con hierbas, y unos redonditos con un dulce especial. ¡Lo más!" },
    { autor: "Clienta del local", texto: "Ayer fue mi compañera a comprar y trajo medialunas, pancitos y unas galletas que tenían orégano. ¡Todo riquísimo! Las medialunas de otro nivel." },
    { autor: "Clienta del local", texto: "Ayer compré budín de banana, muy bueno, recién lo estamos desayunando." }
  ]
};

/**
 * ============================================================================
 * GUÍA RÁPIDA PARA EUGE: cómo agregar o editar un producto (sin programar)
 * ============================================================================
 *
 * 1. CAMBIAR UN PRECIO
 *    Buscá el producto en la lista de arriba (por su nombre) y cambiá el
 *    número que está después de "precio:". No pongas puntos ni la palabra
 *    "pesos", solo el número. Por ejemplo, para pasar el pan de campo de
 *    $2.200 a $2.500, cambiá:
 *        precio: 2200,     →     precio: 2500,
 *
 * 2. AGREGAR UN PRODUCTO NUEVO
 *    Copiá una línea completa parecida (una que empiece con "{ id:" y
 *    termine con "},") y pegala dentro de la categoría que corresponda,
 *    dentro de PICHONA.productos. Después cambiá estos datos:
 *      - id: un nombre corto y único, sin espacios ni acentos (ej: "torta-oreo")
 *      - nombre: el nombre que se va a ver en la página
 *      - precio: el número, sin puntos ni el signo $
 *      - unidad: "unidad", "kilo", "docena", "porción", etc.
 *      - descripcion: una frase corta
 *      - categoria: una de estas, tal cual: "panaderia", "pasteleria",
 *        "petit-fours-tartitas", "salados", "almacen"
 *      - imagen: el nombre del archivo de foto dentro de assets/img/
 *      - destacado: true si querés que aparezca resaltado, si no false
 *      - disponible: false si por ahora no se puede pedir (no se muestra
 *        el botón de pedir, y puede aclarar "de temporada" o similar)
 *
 * 3. SACAR UN PRODUCTO DE LA VENTA (sin borrarlo)
 *    Cambiá disponible: true por disponible: false. El producto va a
 *    dejar de mostrarse en el catálogo hasta que lo vuelvas a poner en true.
 *
 * 4. BORRAR UN PRODUCTO DEFINITIVAMENTE
 *    Borrá el bloque completo, desde el "{" hasta el "}," que le sigue.
 *
 * 5. IMPORTANTE
 *    - Cada línea de producto tiene que terminar en coma "," (menos la
 *      última de cada lista).
 *    - Si algo se rompe (la página deja de mostrar productos), lo más
 *      común es que falte una coma o una llave "}". Fijate que la
 *      cantidad de "{" y "}" sea la misma.
 *    - Guardá el archivo y actualizá la página del navegador para ver
 *      el cambio.
 * ============================================================================
 */
