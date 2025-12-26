

// === CONSTANTES ===
const CARGO_POR_DIA = 250;
const URL_JUEGOS = "data/juegos.json";

// === VARIABLES GLOBALES ===
let juegos = [];
let jugadores = [];
let reservas = [];
let historialMultas = [];
let juegosOriginales = []; 

// === FUNCIONES DE STORAGE ===
function guardarEnStorage(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
}

function obtenerDeStorage(clave) {
    const datos = localStorage.getItem(clave);
    return datos ? JSON.parse(datos) : null;
}

// === CARGA DE DATOS DESDE JSON (ASYNC/AWAIT) ===
async function cargarJuegosDesdeJSON() {
    try {
        const response = await fetch(URL_JUEGOS);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        juegosOriginales = data.juegos.map(juego => ({ ...juego })); // Copia profunda
        return data.juegos;
        
    } catch (error) {
        console.error("Error cargando juegos desde JSON:", error);
        mostrarToast("Error al cargar el catálogo. Usando datos locales.", "error");
        return null;
    }
}

async function cargarDatos() {
    const juegosGuardados = obtenerDeStorage("biblioteca_juegos");
    
    if (juegosGuardados && juegosGuardados.length > 0) {
        juegos = juegosGuardados;
        await cargarJuegosDesdeJSON();
    } else {
        const juegosJSON = await cargarJuegosDesdeJSON();
        if (juegosJSON) {
            juegos = juegosJSON.map(juego => ({ ...juego }));
            guardarEnStorage("biblioteca_juegos", juegos);
        } else {
            juegos = [];
        }
    }
    
    // Cargar otros datos del localStorage
    jugadores = obtenerDeStorage("biblioteca_jugadores") || [];
    reservas = obtenerDeStorage("biblioteca_reservas") || [];
    historialMultas = obtenerDeStorage("biblioteca_historial_multas") || [];
}

function guardarTodo() {
    guardarEnStorage("biblioteca_juegos", juegos);
    guardarEnStorage("biblioteca_jugadores", jugadores);
    guardarEnStorage("biblioteca_reservas", reservas);
    guardarEnStorage("biblioteca_historial_multas", historialMultas);
}

// === FUNCIONES UTILITARIAS ===
function generarId(lista) {
    if (lista.length === 0) return 1;
    const ids = lista.map(item => item.id);
    return Math.max(...ids) + 1;
}

function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-AR");
}

function calcularMultaPorRetraso(dias) {
    return dias <= 0 ? 0 : dias * CARGO_POR_DIA;
}

// === FACTORY FUNCTIONS ===
function crearJugador(id, nombre, apellido, correo, usuario) {
    return {
        id,
        nombre,
        apellido,
        correo,
        usuario: usuario || `gamer_${id}`,
        fechaRegistro: new Date().toISOString()
    };
}

function crearReserva(id, jugadorId, juegoId, dias) {
    const fechaDevolucion = new Date();
    fechaDevolucion.setDate(fechaDevolucion.getDate() + dias);
    
    return {
        id,
        jugadorId,
        juegoId,
        diasPrestamo: dias,
        fechaReserva: new Date().toISOString(),
        fechaDevolucion: fechaDevolucion.toISOString(),
        activa: true
    };
}

// === SISTEMA DE NOTIFICACIONES ===
function mostrarToast(mensaje, tipo) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${tipo}`;
    
    const iconos = {
        success: "✅",
        error: "❌",
        warning: "⚠️",
        info: "ℹ️"
    };
    
    toast.innerHTML = `<span>${iconos[tipo] || "ℹ️"}</span> ${mensaje}`;
    container.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}

function mostrarFeedback(elementoId, mensaje, tipo) {
    const elemento = document.getElementById(elementoId);
    if (elemento) {
        elemento.textContent = mensaje;
        elemento.className = `feedback-message ${tipo}`;
        setTimeout(() => elemento.className = "feedback-message", 5000);
    }
}

// === SWEETALERT2 - ALERTAS MEJORADAS ===
function mostrarAlertaExito(titulo, texto) {
    return Swal.fire({
        title: titulo,
        text: texto,
        icon: "success",
        confirmButtonText: "¡Dale!",
        confirmButtonColor: "#00ffc6",
        background: "#131f3d",
        color: "#f1f5ff",
        iconColor: "#00ffc6"
    });
}

function mostrarAlertaError(titulo, texto) {
    return Swal.fire({
        title: titulo,
        text: texto,
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#ef4444",
        background: "#131f3d",
        color: "#f1f5ff"
    });
}

function mostrarAlertaInfo(titulo, texto) {
    return Swal.fire({
        title: titulo,
        text: texto,
        icon: "info",
        confirmButtonText: "OK",
        confirmButtonColor: "#7df9ff",
        background: "#131f3d",
        color: "#f1f5ff",
        iconColor: "#7df9ff"
    });
}

async function confirmarAccion(titulo, texto, textoConfirmar = "Sí, dale") {
    const resultado = await Swal.fire({
        title: titulo,
        text: texto,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#00ffc6",
        cancelButtonColor: "#ef4444",
        confirmButtonText: textoConfirmar,
        cancelButtonText: "No, mejor no",
        background: "#131f3d",
        color: "#f1f5ff",
        iconColor: "#fbbf24"
    });
    
    return resultado.isConfirmed;
}

// === NAVEGACIÓN ===
function cambiarSeccion(seccionId) {
    document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
    document.getElementById(seccionId)?.classList.add("active");
    
    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.section === seccionId);
    });
    
    // Actualizar contenido según la sección
    const acciones = {
        catalogo: mostrarJuegos,
        reservar: () => {
            cargarSelectJugadores();
            cargarSelectJuegos();
            mostrarReservas();
        },
        registrar: mostrarJugadores,
        multas: mostrarHistorialMultas,
        admin: mostrarEstadisticas
    };
    
    if (acciones[seccionId]) acciones[seccionId]();
}

// === CATÁLOGO DE JUEGOS ===
function mostrarJuegos(listaFiltrada) {
    const grid = document.getElementById("juegos-grid");
    if (!grid) return;
    
    const juegosParaMostrar = listaFiltrada || juegos;
    
    if (juegosParaMostrar.length === 0) {
        grid.innerHTML = '<div class="lista-vacia"><p>No hay juegos con esos filtros, bro 😅</p></div>';
        return;
    }
    
    grid.innerHTML = juegosParaMostrar.map((juego, index) => {
        const claseDisponible = juego.disponible ? "" : "no-disponible";
        const estadoTexto = juego.disponible ? "Libre" : "Lo tiene alguien";
        const claseDot = juego.disponible ? "" : "reservado";
        
        return `
            <article class="juego-card ${claseDisponible}" data-id="${juego.id}" style="animation-delay: ${index * 0.05}s">
                <div class="juego-imagen">${juego.imagen || "🎮"}</div>
                <div class="juego-info">
                    <h3 class="juego-titulo">${juego.titulo}</h3>
                    <p class="juego-desarrollador">${juego.desarrollador}</p>
                    <span class="juego-genero">${juego.genero}</span>
                    <div class="juego-estado">
                        <span class="estado-dot ${claseDot}"></span>
                        <span>${estadoTexto}</span>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

function filtrarJuegos() {
    const genero = document.getElementById("filtro-genero").value;
    const disponible = document.getElementById("filtro-disponible").value;
    const busqueda = document.getElementById("buscar-juego").value.toLowerCase().trim();
    
    let juegosFiltrados = [...juegos];
    
    if (genero) {
        juegosFiltrados = juegosFiltrados.filter(j => j.genero === genero);
    }
    
    if (disponible) {
        const disponibleBool = disponible === "true";
        juegosFiltrados = juegosFiltrados.filter(j => j.disponible === disponibleBool);
    }
    
    if (busqueda) {
        juegosFiltrados = juegosFiltrados.filter(j => 
            j.titulo.toLowerCase().includes(busqueda) || 
            j.desarrollador.toLowerCase().includes(busqueda)
        );
    }
    
    mostrarJuegos(juegosFiltrados);
}

// === GESTIÓN DE JUGADORES ===
function mostrarJugadores() {
    const lista = document.getElementById("jugadores-lista");
    if (!lista) return;
    
    if (jugadores.length === 0) {
        lista.innerHTML = '<div class="lista-vacia"><p>Todavía no hay nadie anotado. ¡Sé el primero, pa!</p></div>';
        return;
    }
    
    lista.innerHTML = jugadores.map(jugador => `
        <div class="lista-item" data-id="${jugador.id}">
            <div class="lista-item-info">
                <span class="lista-item-titulo">${jugador.nombre} ${jugador.apellido}</span>
                <span class="lista-item-subtitulo">@${jugador.usuario} · ${jugador.correo}</span>
                <span class="lista-item-fecha">Se anotó el: ${formatearFecha(jugador.fechaRegistro)}</span>
            </div>
        </div>
    `).join("");
}

async function registrarJugador(evento) {
    evento.preventDefault();
    
    const nombre = document.getElementById("reg-nombre").value.trim();
    const apellido = document.getElementById("reg-apellido").value.trim();
    const correo = document.getElementById("reg-correo").value.trim();
    const usuario = document.getElementById("reg-usuario").value.trim();
    
    if (!nombre || !apellido || !correo) {
        await mostrarAlertaError("¡Ey, faltan datos!", "Completá todos los campos con * para poder anotarte.");
        return;
    }
    
    const yaExiste = jugadores.some(j => j.correo.toLowerCase() === correo.toLowerCase());
    
    if (yaExiste) {
        await mostrarAlertaError("Mail repetido", "Ese mail ya está registrado, probá con otro.");
        return;
    }
    
    const nuevoJugador = crearJugador(generarId(jugadores), nombre, apellido, correo, usuario);
    jugadores.push(nuevoJugador);
    guardarEnStorage("biblioteca_jugadores", jugadores);
    
    await mostrarAlertaExito(`¡Bienvenido ${nombre}!`, "Ya estás adentro de la banda gamer. Ahora podés pedir juegos prestados.");
    
    evento.target.reset();
    mostrarJugadores();
}

// === GESTIÓN DE RESERVAS ===
function cargarSelectJugadores() {
    const select = document.getElementById("reserva-jugador");
    if (!select) return;
    
    select.innerHTML = '<option value="">-- ¿Quién sos? --</option>';
    jugadores.forEach(jugador => {
        const option = document.createElement("option");
        option.value = jugador.id;
        option.textContent = `${jugador.nombre} ${jugador.apellido} (@${jugador.usuario})`;
        select.appendChild(option);
    });
}

function cargarSelectJuegos() {
    const select = document.getElementById("reserva-juego");
    if (!select) return;
    
    select.innerHTML = '<option value="">-- ¿Qué querés llevarte? --</option>';
    juegos.filter(j => j.disponible).forEach(juego => {
        const option = document.createElement("option");
        option.value = juego.id;
        option.textContent = `${juego.titulo} (${juego.genero})`;
        select.appendChild(option);
    });
}

function mostrarReservas() {
    const lista = document.getElementById("reservas-lista");
    if (!lista) return;
    
    const reservasActivas = reservas.filter(r => r.activa);
    
    if (reservasActivas.length === 0) {
        lista.innerHTML = '<div class="lista-vacia"><p>No hay juegos prestados ahora mismo</p></div>';
        return;
    }
    
    lista.innerHTML = reservasActivas.map(reserva => {
        const jugador = jugadores.find(j => j.id === reserva.jugadorId);
        const juego = juegos.find(j => j.id === reserva.juegoId);
        
        const nombreJuego = juego?.titulo || "Juego borrado";
        const nombreJugador = jugador ? `${jugador.nombre} ${jugador.apellido}` : "Usuario borrado";
        
        return `
            <div class="lista-item" data-id="${reserva.id}">
                <div class="lista-item-info">
                    <span class="lista-item-titulo">${nombreJuego}</span>
                    <span class="lista-item-subtitulo">Lo tiene: ${nombreJugador}</span>
                    <span class="lista-item-fecha">Del ${formatearFecha(reserva.fechaReserva)} al ${formatearFecha(reserva.fechaDevolucion)}</span>
                </div>
                <button class="btn-devolver" onclick="devolverJuego(${reserva.id})">Devolver</button>
            </div>
        `;
    }).join("");
}

async function procesarReserva(evento) {
    evento.preventDefault();
    
    const jugadorId = parseInt(document.getElementById("reserva-jugador").value);
    const juegoId = parseInt(document.getElementById("reserva-juego").value);
    const dias = parseInt(document.getElementById("reserva-dias").value);
    
    if (!jugadorId || !juegoId) {
        await mostrarAlertaError("Faltan datos", "Elegí quién sos y qué juego querés llevarte.");
        return;
    }
    
    if (dias < 3 || dias > 14) {
        await mostrarAlertaError("Días inválidos", "Los días tienen que ser entre 3 y 14.");
        return;
    }
    
    const juego = juegos.find(j => j.id === juegoId);
    
    if (!juego || !juego.disponible) {
        await mostrarAlertaError("No disponible", "Uh, ese juego ya se lo llevó otro.");
        cargarSelectJuegos();
        return;
    }
    
    const jugador = jugadores.find(j => j.id === jugadorId);
    
    // Confirmar la reserva
    const confirmar = await confirmarAccion(
        "¿Confirmás el préstamo?",
        `${jugador.nombre}, vas a llevarte "${juego.titulo}" por ${dias} días.`,
        "¡Sí, me lo llevo!"
    );
    
    if (!confirmar) return;
    
    const nuevaReserva = crearReserva(generarId(reservas), jugadorId, juegoId, dias);
    juego.disponible = false;
    reservas.push(nuevaReserva);
    guardarTodo();
    
    await mostrarAlertaExito(
        "¡Listo, es tuyo!",
        `${juego.titulo} es tuyo por ${dias} días. ¡A viciar! 🎮`
    );
    
    evento.target.reset();
    document.getElementById("reserva-dias").value = 7;
    cargarSelectJuegos();
    mostrarReservas();
}

async function devolverJuego(reservaId) {
    const reserva = reservas.find(r => r.id === reservaId);
    if (!reserva) {
        mostrarToast("No encontré esa reserva", "error");
        return;
    }
    
    const juego = juegos.find(j => j.id === reserva.juegoId);
    const nombreJuego = juego?.titulo || "El juego";
    
    const confirmar = await confirmarAccion(
        "¿Devolver juego?",
        `¿Confirmás que querés devolver "${nombreJuego}"?`,
        "Sí, lo devuelvo"
    );
    
    if (!confirmar) return;
    
    reserva.activa = false;
    if (juego) juego.disponible = true;
    guardarTodo();
    
    mostrarToast(`${nombreJuego} devuelto, ¡gracias!`, "success");
    
    cargarSelectJuegos();
    mostrarReservas();
    mostrarJuegos();
}

// === CALCULADORA DE MULTAS ===
async function calcularMulta(evento) {
    evento.preventDefault();
    
    const dias = parseInt(document.getElementById("multa-dias").value) || 0;
    const monto = calcularMultaPorRetraso(dias);
    
    const resultadoDiv = document.getElementById("multa-resultado");
    const valorSpan = resultadoDiv.querySelector(".resultado-valor");
    
    valorSpan.textContent = `$${monto.toLocaleString("es-AR")}`;
    valorSpan.className = monto > 0 ? "resultado-valor con-multa" : "resultado-valor";
    
    if (dias > 0) {
        historialMultas.unshift({
            id: generarId(historialMultas),
            diasRetraso: dias,
            monto,
            fecha: new Date().toISOString()
        });
        guardarEnStorage("biblioteca_historial_multas", historialMultas);
        mostrarHistorialMultas();
    }
    
    if (monto === 0) {
        await mostrarAlertaExito("¡Bien ahí!", "Devolviste a tiempo, no debés nada. 👏");
    } else {
        await Swal.fire({
            title: "💸 Tenés multa",
            html: `<p style="font-size: 1.2rem">Por <strong>${dias} día(s)</strong> de atraso te sale:</p>
                   <p style="font-size: 2.5rem; color: #ef4444; font-weight: bold; margin-top: 10px;">$${monto.toLocaleString("es-AR")}</p>`,
            icon: "warning",
            confirmButtonText: "Entendido",
            confirmButtonColor: "#fbbf24",
            background: "#131f3d",
            color: "#f1f5ff"
        });
    }
}

function mostrarHistorialMultas() {
    const lista = document.getElementById("historial-multas");
    if (!lista) return;
    
    if (historialMultas.length === 0) {
        lista.innerHTML = '<div class="lista-vacia"><p>No hay multas calculadas todavía</p></div>';
        return;
    }
    
    lista.innerHTML = historialMultas.slice(0, 10).map(registro => `
        <div class="lista-item">
            <div class="lista-item-info">
                <span class="lista-item-titulo">$${registro.monto.toLocaleString("es-AR")}</span>
                <span class="lista-item-subtitulo">${registro.diasRetraso} día(s) de atraso</span>
                <span class="lista-item-fecha">${formatearFecha(registro.fecha)}</span>
            </div>
        </div>
    `).join("");
}

async function limpiarHistorialMultas() {
    if (historialMultas.length === 0) {
        mostrarToast("No hay historial para borrar", "info");
        return;
    }
    
    const confirmar = await confirmarAccion(
        "¿Borrar historial?",
        "Se van a eliminar todos los cálculos de multas.",
        "Sí, borrar"
    );
    
    if (!confirmar) return;
    
    historialMultas = [];
    guardarEnStorage("biblioteca_historial_multas", historialMultas);
    mostrarHistorialMultas();
    mostrarToast("Historial limpiado", "info");
}

// === PANEL DE ADMINISTRACIÓN ===
async function agregarJuego(evento) {
    evento.preventDefault();
    
    const titulo = document.getElementById("nuevo-titulo").value.trim();
    const desarrollador = document.getElementById("nuevo-desarrollador").value.trim();
    const genero = document.getElementById("nuevo-genero").value;
    const imagen = document.getElementById("nuevo-imagen").value.trim();
    
    if (!titulo || !desarrollador || !genero) {
        await mostrarAlertaError("Faltan datos", "Completá los campos obligatorios para agregar el juego.");
        return;
    }
    
    const existe = juegos.some(j => j.titulo.toLowerCase() === titulo.toLowerCase());
    
    if (existe) {
        await mostrarAlertaError("Juego repetido", "Ya tenemos ese juego en el catálogo.");
        return;
    }
    
    const emojisPorGenero = {
        Shooter: "🎯",
        Aventura: "🗺️",
        Acción: "💥",
        Futbol: "⚽",
        RPG: "⚔️",
        Estrategia: "♟️",
        Carreras: "🏎️"
    };
    
    const nuevoJuego = {
        id: generarId(juegos),
        titulo,
        desarrollador,
        genero,
        disponible: true,
        imagen: imagen || emojisPorGenero[genero] || "🎮"
    };
    
    juegos.push(nuevoJuego);
    guardarEnStorage("biblioteca_juegos", juegos);
    
    await mostrarAlertaExito("¡Juego agregado!", `"${titulo}" ya está en el catálogo.`);
    
    evento.target.reset();
    mostrarEstadisticas();
}

async function restaurarJuegosOriginales() {
    const confirmar = await confirmarAccion(
        "¿Restaurar catálogo?",
        "Esto va a volver a los juegos originales del JSON. Los juegos que agregaste se van a perder.",
        "Sí, restaurar"
    );
    
    if (!confirmar) return;
    
    if (juegosOriginales.length > 0) {
        juegos = juegosOriginales.map(j => ({ ...j }));
    } else {
        // Si por alguna razón no tenemos los originales, recargamos del JSON
        const juegosJSON = await cargarJuegosDesdeJSON();
        if (juegosJSON) {
            juegos = juegosJSON.map(j => ({ ...j }));
        }
    }
    
    reservas.forEach(r => r.activa = false);
    guardarTodo();
    
    mostrarToast("Catálogo restaurado a los originales", "info");
    mostrarEstadisticas();
    
    if (document.getElementById("catalogo")?.classList.contains("active")) {
        mostrarJuegos();
    }
}

async function limpiarReservas() {
    const reservasActivas = reservas.filter(r => r.activa);
    
    if (reservasActivas.length === 0) {
        mostrarToast("No hay préstamos activos", "info");
        return;
    }
    
    const confirmar = await confirmarAccion(
        "¿Cancelar todos los préstamos?",
        `Hay ${reservasActivas.length} préstamo(s) activo(s). Todos los juegos van a quedar libres.`,
        "Sí, cancelar todos"
    );
    
    if (!confirmar) return;
    
    juegos.forEach(j => j.disponible = true);
    reservas.forEach(r => r.activa = false);
    guardarTodo();
    
    mostrarToast("Todas las reservas canceladas", "info");
    mostrarEstadisticas();
}

async function limpiarTodo() {
    const confirmar = await Swal.fire({
        title: "⚠️ ¡Atención!",
        html: `<p>Esto va a <strong>BORRAR TODO</strong>:</p>
               <ul style="text-align: left; margin-top: 10px;">
                 <li>Todos los juegos</li>
                 <li>Todos los jugadores registrados</li>
                 <li>Todas las reservas</li>
                 <li>Todo el historial de multas</li>
               </ul>
               <p style="margin-top: 10px; color: #ef4444;"><strong>Esta acción no se puede deshacer.</strong></p>`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Sí, borrar TODO",
        cancelButtonText: "¡No, cancelar!",
        background: "#131f3d",
        color: "#f1f5ff"
    });
    
    if (!confirmar.isConfirmed) return;
    
    // Doble confirmación por seguridad
    const confirmarDoble = await Swal.fire({
        title: "¿Estás 100% seguro?",
        text: "Última oportunidad para arrepentirte...",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#00ffc6",
        confirmButtonText: "Dale, borrá todo",
        cancelButtonText: "No, mejor no",
        background: "#131f3d",
        color: "#f1f5ff"
    });
    
    if (!confirmarDoble.isConfirmed) {
        mostrarToast("Uff, zafaste 😅", "info");
        return;
    }
    
    localStorage.removeItem("biblioteca_juegos");
    localStorage.removeItem("biblioteca_jugadores");
    localStorage.removeItem("biblioteca_reservas");
    localStorage.removeItem("biblioteca_historial_multas");
    
    await cargarDatos();
    
    mostrarToast("Todo borrado, empezamos de cero", "warning");
    mostrarEstadisticas();
}

function mostrarEstadisticas() {
    const container = document.getElementById("estadisticas");
    if (!container) return;
    
    const disponibles = juegos.filter(j => j.disponible).length;
    const reservados = juegos.length - disponibles;
    const reservasActivas = reservas.filter(r => r.activa).length;
    
    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-valor">${juegos.length}</div>
            <div class="stat-label">Juegos Totales</div>
        </div>
        <div class="stat-card">
            <div class="stat-valor">${disponibles}</div>
            <div class="stat-label">Libres</div>
        </div>
        <div class="stat-card">
            <div class="stat-valor">${reservados}</div>
            <div class="stat-label">Prestados</div>
        </div>
        <div class="stat-card">
            <div class="stat-valor">${jugadores.length}</div>
            <div class="stat-label">Gamers</div>
        </div>
        <div class="stat-card">
            <div class="stat-valor">${reservasActivas}</div>
            <div class="stat-label">Préstamos Activos</div>
        </div>
        <div class="stat-card">
            <div class="stat-valor">${historialMultas.length}</div>
            <div class="stat-label">Multas Calculadas</div>
        </div>
    `;
}

// === CONFIGURACIÓN DE EVENTOS ===
function configurarEventos() {
    // === Sidebar móvil ===
    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebar-overlay");
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const sidebarClose = document.getElementById("sidebar-close");

    function abrirSidebar() {
        sidebar?.classList.add("open");
        sidebarOverlay?.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function cerrarSidebar() {
        sidebar?.classList.remove("open");
        sidebarOverlay?.classList.remove("active");
        document.body.style.overflow = "";
    }

    hamburgerBtn?.addEventListener("click", abrirSidebar);
    sidebarClose?.addEventListener("click", cerrarSidebar);
    sidebarOverlay?.addEventListener("click", cerrarSidebar);

    // Navegación
    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.addEventListener("click", function() {
            if (this.dataset.section) {
                cambiarSeccion(this.dataset.section);
                // Cerrar sidebar en móvil al seleccionar
                if (window.innerWidth <= 1024) {
                    cerrarSidebar();
                }
            }
        });
    });
    
    // Filtros del catálogo
    document.getElementById("filtro-genero")?.addEventListener("change", filtrarJuegos);
    document.getElementById("filtro-disponible")?.addEventListener("change", filtrarJuegos);
    document.getElementById("buscar-juego")?.addEventListener("input", filtrarJuegos);
    
    // Formularios
    document.getElementById("form-registro")?.addEventListener("submit", registrarJugador);
    document.getElementById("form-reserva")?.addEventListener("submit", procesarReserva);
    document.getElementById("form-multa")?.addEventListener("submit", calcularMulta);
    document.getElementById("form-agregar-juego")?.addEventListener("submit", agregarJuego);
    
    // Botones de admin
    document.getElementById("limpiar-historial")?.addEventListener("click", limpiarHistorialMultas);
    document.getElementById("btn-reset-juegos")?.addEventListener("click", restaurarJuegosOriginales);
    document.getElementById("btn-limpiar-reservas")?.addEventListener("click", limpiarReservas);
    document.getElementById("btn-limpiar-todo")?.addEventListener("click", limpiarTodo);
}

// === INICIALIZACIÓN ===
async function iniciarApp() {
    // Mostrar loading mientras carga
    const grid = document.getElementById("juegos-grid");
    if (grid) {
        grid.innerHTML = '<div class="lista-vacia"><p>⏳ Cargando catálogo...</p></div>';
    }
    
    await cargarDatos();
    configurarEventos();
    mostrarJuegos();
    
    // Mensaje de bienvenida con SweetAlert
    setTimeout(() => {
        Swal.fire({
            title: "¡Buenasss! 🎮",
            text: "Bienvenido a la Biblioteca Gamer. ¡Elegí un juego y a viciar!",
            icon: "success",
            confirmButtonText: "¡Vamos!",
            confirmButtonColor: "#00ffc6",
            background: "#131f3d",
            color: "#f1f5ff",
            iconColor: "#00ffc6",
            timer: 4000,
            timerProgressBar: true
        });
    }, 500);
}

// Iniciar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", iniciarApp);