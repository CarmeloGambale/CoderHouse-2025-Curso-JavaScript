const CARGO_POR_DIA = 250;

const JUEGOS_INICIALES = [
    { id: 1, titulo: "Call of Duty: Modern Warfare II", desarrollador: "Infinity Ward", genero: "Shooter", disponible: true, imagen: "🎯" },
    { id: 2, titulo: "Counter-Strike 2", desarrollador: "Valve", genero: "Shooter", disponible: true, imagen: "💥" },
    { id: 3, titulo: "The Last of Us Part II", desarrollador: "Naughty Dog", genero: "Aventura", disponible: true, imagen: "🧟" },
    { id: 4, titulo: "Grand Theft Auto V", desarrollador: "Rockstar Games", genero: "Acción", disponible: true, imagen: "🚗" },
    { id: 5, titulo: "EA FC 25", desarrollador: "EA Sports", genero: "Futbol", disponible: true, imagen: "⚽" },
    { id: 6, titulo: "Red Dead Redemption 2", desarrollador: "Rockstar Games", genero: "Aventura", disponible: true, imagen: "🤠" },
    { id: 7, titulo: "Fortnite", desarrollador: "Epic Games", genero: "Shooter", disponible: true, imagen: "🏝️" },
    { id: 8, titulo: "Elden Ring", desarrollador: "FromSoftware", genero: "RPG", disponible: true, imagen: "⚔️" },
    { id: 9, titulo: "God of War", desarrollador: "Santa Monica Studio", genero: "Acción", disponible: true, imagen: "👑" },
    { id: 10, titulo: "The Witcher 3: Wild Hunt", desarrollador: "CD Projekt Red", genero: "RPG", disponible: true, imagen: "🧙‍♂️" },
    { id: 11, titulo: "League of Legends", desarrollador: "Riot Games", genero: "MOBA", disponible: true, imagen: "🏆" },
    { id: 12, titulo: "Minecraft", desarrollador: "Mojang Studios", genero: "Aventura", disponible: true, imagen: "🎮" },
    { id: 13, titulo: "Overwatch 2", desarrollador: "Blizzard Entertainment", genero: "Shooter", disponible: true, imagen: "🎯" },
    { id: 14, titulo: "Valorant", desarrollador: "Riot Games", genero: "Shooter", disponible: true, imagen: "🎯" },
    { id: 15, titulo: "Apex Legends", desarrollador: "Respawn Entertainment", genero: "Shooter", disponible: true, imagen: "🎯" },
    { id: 16, titulo: "Rainbow Six Siege", desarrollador: "Ubisoft Montreal", genero: "Shooter", disponible: true, imagen: "🎯" },
];

let juegos = [];
let jugadores = [];
let reservas = [];
let historialMultas = [];


function guardarEnStorage(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
}

function obtenerDeStorage(clave) {
    let datos = localStorage.getItem(clave);
    if (datos) {
        return JSON.parse(datos);
    }
    return null;
}

function cargarDatos() {
    let juegosGuardados = obtenerDeStorage("biblioteca_juegos");
    if (juegosGuardados) {
        juegos = juegosGuardados;
    } else {
        juegos = JUEGOS_INICIALES.slice();
        guardarEnStorage("biblioteca_juegos", juegos);
    }
    
    let jugadoresGuardados = obtenerDeStorage("biblioteca_jugadores");
    jugadores = jugadoresGuardados || [];
    
    let reservasGuardadas = obtenerDeStorage("biblioteca_reservas");
    reservas = reservasGuardadas || [];
    
    let historialGuardado = obtenerDeStorage("biblioteca_historial_multas");
    historialMultas = historialGuardado || [];
}

function guardarTodo() {
    guardarEnStorage("biblioteca_juegos", juegos);
    guardarEnStorage("biblioteca_jugadores", jugadores);
    guardarEnStorage("biblioteca_reservas", reservas);
    guardarEnStorage("biblioteca_historial_multas", historialMultas);
}


function generarId(lista) {
    if (lista.length === 0) {
        return 1;
    }
    let ids = lista.map(function(item) {
        return item.id;
    });
    let maxId = Math.max.apply(null, ids);
    return maxId + 1;
}

function formatearFecha(fechaISO) {
    let fecha = new Date(fechaISO);
    return fecha.toLocaleDateString("es-AR");
}

function calcularMultaPorRetraso(dias) {
    if (dias <= 0) {
        return 0;
    }
    return dias * CARGO_POR_DIA;
}

function crearJugador(id, nombre, apellido, correo, usuario) {
    return {
        id: id,
        nombre: nombre,
        apellido: apellido,
        correo: correo,
        usuario: usuario || "gamer_" + id,
        fechaRegistro: new Date().toISOString()
    };
}

function crearReserva(id, jugadorId, juegoId, dias) {
    let fechaDevolucion = new Date();
    fechaDevolucion.setDate(fechaDevolucion.getDate() + dias);
    
    return {
        id: id,
        jugadorId: jugadorId,
        juegoId: juegoId,
        diasPrestamo: dias,
        fechaReserva: new Date().toISOString(),
        fechaDevolucion: fechaDevolucion.toISOString(),
        activa: true
    };
}


function mostrarToast(mensaje, tipo) {
    let container = document.getElementById("toast-container");
    
    let toast = document.createElement("div");
    toast.className = "toast " + tipo;
    
    let icono = "ℹ️";
    if (tipo === "success") icono = "✅";
    if (tipo === "error") icono = "❌";
    if (tipo === "warning") icono = "⚠️";
    
    toast.innerHTML = "<span>" + icono + "</span> " + mensaje;
    container.appendChild(toast);
    
    setTimeout(function() {
        toast.remove();
    }, 3000);
}

function mostrarFeedback(elementoId, mensaje, tipo) {
    let elemento = document.getElementById(elementoId);
    if (elemento) {
        elemento.textContent = mensaje;
        elemento.className = "feedback-message " + tipo;
        
        setTimeout(function() {
            elemento.className = "feedback-message";
        }, 5000);
    }
}


function cambiarSeccion(seccionId) {
    let secciones = document.querySelectorAll(".section");
    for (let i = 0; i < secciones.length; i++) {
        secciones[i].classList.remove("active");
    }
    
    let seccionActiva = document.getElementById(seccionId);
    if (seccionActiva) {
        seccionActiva.classList.add("active");
    }
    
    let botones = document.querySelectorAll(".nav-btn");
    for (let i = 0; i < botones.length; i++) {
        botones[i].classList.remove("active");
        if (botones[i].dataset.section === seccionId) {
            botones[i].classList.add("active");
        }
    }
    
    if (seccionId === "catalogo") {
        mostrarJuegos();
    } else if (seccionId === "reservar") {
        cargarSelectJugadores();
        cargarSelectJuegos();
        mostrarReservas();
    } else if (seccionId === "registrar") {
        mostrarJugadores();
    } else if (seccionId === "multas") {
        mostrarHistorialMultas();
    } else if (seccionId === "admin") {
        mostrarEstadisticas();
    }
}


function mostrarJuegos(listaFiltrada) {
    let grid = document.getElementById("juegos-grid");
    if (!grid) return;
    
    let juegosParaMostrar = listaFiltrada || juegos;
    
    if (juegosParaMostrar.length === 0) {
        grid.innerHTML = '<div class="lista-vacia"><p>No hay juegos con esos filtros, bro 😅</p></div>';
        return;
    }
    
    let html = "";
    for (let i = 0; i < juegosParaMostrar.length; i++) {
        let juego = juegosParaMostrar[i];
        let claseDisponible = juego.disponible ? "" : "no-disponible";
        let estadoTexto = juego.disponible ? "Libre" : "Lo tiene alguien";
        let claseDot = juego.disponible ? "" : "reservado";
        
        html += '<article class="juego-card ' + claseDisponible + '" data-id="' + juego.id + '">';
        html += '  <div class="juego-imagen">' + (juego.imagen || "🎮") + '</div>';
        html += '  <div class="juego-info">';
        html += '    <h3 class="juego-titulo">' + juego.titulo + '</h3>';
        html += '    <p class="juego-desarrollador">' + juego.desarrollador + '</p>';
        html += '    <span class="juego-genero">' + juego.genero + '</span>';
        html += '    <div class="juego-estado">';
        html += '      <span class="estado-dot ' + claseDot + '"></span>';
        html += '      <span>' + estadoTexto + '</span>';
        html += '    </div>';
        html += '  </div>';
        html += '</article>';
    }
    
    grid.innerHTML = html;
}

function filtrarJuegos() {
    let genero = document.getElementById("filtro-genero").value;
    let disponible = document.getElementById("filtro-disponible").value;
    let busqueda = document.getElementById("buscar-juego").value.toLowerCase().trim();
    
    let juegosFiltrados = juegos.slice();
    
    if (genero !== "") {
        juegosFiltrados = juegosFiltrados.filter(function(j) {
            return j.genero === genero;
        });
    }
    
    if (disponible !== "") {
        let disponibleBool = (disponible === "true");
        juegosFiltrados = juegosFiltrados.filter(function(j) {
            return j.disponible === disponibleBool;
        });
    }
    
    if (busqueda !== "") {
        juegosFiltrados = juegosFiltrados.filter(function(j) {
            return j.titulo.toLowerCase().includes(busqueda) || 
                   j.desarrollador.toLowerCase().includes(busqueda);
        });
    }
    
    mostrarJuegos(juegosFiltrados);
}


function mostrarJugadores() {
    let lista = document.getElementById("jugadores-lista");
    if (!lista) return;
    
    if (jugadores.length === 0) {
        lista.innerHTML = '<div class="lista-vacia"><p>Todavía no hay nadie anotado. ¡Sé el primero, pa!</p></div>';
        return;
    }
    
    let html = "";
    for (let i = 0; i < jugadores.length; i++) {
        let jugador = jugadores[i];
        html += '<div class="lista-item" data-id="' + jugador.id + '">';
        html += '  <div class="lista-item-info">';
        html += '    <span class="lista-item-titulo">' + jugador.nombre + ' ' + jugador.apellido + '</span>';
        html += '    <span class="lista-item-subtitulo">@' + jugador.usuario + ' · ' + jugador.correo + '</span>';
        html += '    <span class="lista-item-fecha">Se anotó el: ' + formatearFecha(jugador.fechaRegistro) + '</span>';
        html += '  </div>';
        html += '</div>';
    }
    
    lista.innerHTML = html;
}

function registrarJugador(evento) {
    evento.preventDefault();
    
    let nombre = document.getElementById("reg-nombre").value.trim();
    let apellido = document.getElementById("reg-apellido").value.trim();
    let correo = document.getElementById("reg-correo").value.trim();
    let usuario = document.getElementById("reg-usuario").value.trim();
    
    if (!nombre || !apellido || !correo) {
        mostrarFeedback("registro-feedback", "Che, completá todos los campos con * porfa", "error");
        mostrarToast("Faltan datos, fijate", "error");
        return;
    }
    
    let yaExiste = false;
    for (let i = 0; i < jugadores.length; i++) {
        if (jugadores[i].correo.toLowerCase() === correo.toLowerCase()) {
            yaExiste = true;
            break;
        }
    }
    
    if (yaExiste) {
        mostrarFeedback("registro-feedback", "Ese mail ya está registrado, probá con otro", "error");
        mostrarToast("Mail repetido", "error");
        return;
    }
    
    let nuevoId = generarId(jugadores);
    let nuevoJugador = crearJugador(nuevoId, nombre, apellido, correo, usuario);
    
    jugadores.push(nuevoJugador);
    guardarEnStorage("biblioteca_jugadores", jugadores);
    
    mostrarFeedback("registro-feedback", "¡Genial " + nombre + "! Ya estás adentro 🎮", "success");
    mostrarToast(nombre + " se sumó a la banda", "success");
    
    evento.target.reset();
    mostrarJugadores();
}


function cargarSelectJugadores() {
    let select = document.getElementById("reserva-jugador");
    if (!select) return;
    
    select.innerHTML = '<option value="">-- ¿Quién sos? --</option>';
    
    for (let i = 0; i < jugadores.length; i++) {
        let jugador = jugadores[i];
        let option = document.createElement("option");
        option.value = jugador.id;
        option.textContent = jugador.nombre + " " + jugador.apellido + " (@" + jugador.usuario + ")";
        select.appendChild(option);
    }
}

function cargarSelectJuegos() {
    let select = document.getElementById("reserva-juego");
    if (!select) return;
    
    select.innerHTML = '<option value="">-- ¿Qué querés llevarte? --</option>';
    
    for (let i = 0; i < juegos.length; i++) {
        let juego = juegos[i];
        if (juego.disponible) {
            let option = document.createElement("option");
            option.value = juego.id;
            option.textContent = juego.titulo + " (" + juego.genero + ")";
            select.appendChild(option);
        }
    }
}

function mostrarReservas() {
    let lista = document.getElementById("reservas-lista");
    if (!lista) return;
    
    let reservasActivas = reservas.filter(function(r) {
        return r.activa;
    });
    
    if (reservasActivas.length === 0) {
        lista.innerHTML = '<div class="lista-vacia"><p>No hay juegos prestados ahora mismo</p></div>';
        return;
    }
    
    let html = "";
    for (let i = 0; i < reservasActivas.length; i++) {
        let reserva = reservasActivas[i];
        
        let jugador = null;
        let juego = null;
        
        for (let j = 0; j < jugadores.length; j++) {
            if (jugadores[j].id === reserva.jugadorId) {
                jugador = jugadores[j];
                break;
            }
        }
        
        for (let j = 0; j < juegos.length; j++) {
            if (juegos[j].id === reserva.juegoId) {
                juego = juegos[j];
                break;
            }
        }
        
        let nombreJuego = juego ? juego.titulo : "Juego borrado";
        let nombreJugador = jugador ? (jugador.nombre + " " + jugador.apellido) : "Usuario borrado";
        
        html += '<div class="lista-item" data-id="' + reserva.id + '">';
        html += '  <div class="lista-item-info">';
        html += '    <span class="lista-item-titulo">' + nombreJuego + '</span>';
        html += '    <span class="lista-item-subtitulo">Lo tiene: ' + nombreJugador + '</span>';
        html += '    <span class="lista-item-fecha">Del ' + formatearFecha(reserva.fechaReserva) + ' al ' + formatearFecha(reserva.fechaDevolucion) + '</span>';
        html += '  </div>';
        html += '  <button class="btn-devolver" onclick="devolverJuego(' + reserva.id + ')">Devolver</button>';
        html += '</div>';
    }
    
    lista.innerHTML = html;
}

function procesarReserva(evento) {
    evento.preventDefault();
    
    let jugadorId = parseInt(document.getElementById("reserva-jugador").value);
    let juegoId = parseInt(document.getElementById("reserva-juego").value);
    let dias = parseInt(document.getElementById("reserva-dias").value);
    
    if (!jugadorId || !juegoId) {
        mostrarFeedback("reserva-feedback", "Elegí quién sos y qué juego querés", "error");
        mostrarToast("Te falta elegir algo", "error");
        return;
    }
    
    if (dias < 3 || dias > 14) {
        mostrarFeedback("reserva-feedback", "Los días tienen que ser entre 3 y 14, dale", "error");
        mostrarToast("Días mal puestos", "error");
        return;
    }
    
    let juego = null;
    for (let i = 0; i < juegos.length; i++) {
        if (juegos[i].id === juegoId) {
            juego = juegos[i];
            break;
        }
    }
    
    if (!juego || !juego.disponible) {
        mostrarFeedback("reserva-feedback", "Uh, ese juego ya se lo llevó otro", "error");
        mostrarToast("Juego no disponible", "error");
        cargarSelectJuegos();
        return;
    }
    
    let nuevoId = generarId(reservas);
    let nuevaReserva = crearReserva(nuevoId, jugadorId, juegoId, dias);
    
    juego.disponible = false;
    
    reservas.push(nuevaReserva);
    guardarTodo();
    
    let jugador = null;
    for (let i = 0; i < jugadores.length; i++) {
        if (jugadores[i].id === jugadorId) {
            jugador = jugadores[i];
            break;
        }
    }
    
    mostrarFeedback("reserva-feedback", "¡Listo! " + juego.titulo + " es tuyo por " + dias + " días. ¡A viciar!", "success");
    mostrarToast(jugador.nombre + " se llevó " + juego.titulo, "success");
    
    evento.target.reset();
    document.getElementById("reserva-dias").value = 7;
    cargarSelectJuegos();
    mostrarReservas();
}

function devolverJuego(reservaId) {
    let reserva = null;
    for (let i = 0; i < reservas.length; i++) {
        if (reservas[i].id === reservaId) {
            reserva = reservas[i];
            break;
        }
    }
    
    if (!reserva) {
        mostrarToast("No encontré esa reserva", "error");
        return;
    }
    
    reserva.activa = false;
    
    let juego = null;
    for (let i = 0; i < juegos.length; i++) {
        if (juegos[i].id === reserva.juegoId) {
            juego = juegos[i];
            juego.disponible = true;
            break;
        }
    }
    
    guardarTodo();
    
    let nombreJuego = juego ? juego.titulo : "El juego";
    mostrarToast(nombreJuego + " devuelto, ¡gracias!", "success");
    
    cargarSelectJuegos();
    mostrarReservas();
    mostrarJuegos();
}


function calcularMulta(evento) {
    evento.preventDefault();
    
    let dias = parseInt(document.getElementById("multa-dias").value) || 0;
    let monto = calcularMultaPorRetraso(dias);
    
    let resultadoDiv = document.getElementById("multa-resultado");
    let valorSpan = resultadoDiv.querySelector(".resultado-valor");
    
    valorSpan.textContent = "$" + monto.toLocaleString("es-AR");
    
    if (monto > 0) {
        valorSpan.className = "resultado-valor con-multa";
    } else {
        valorSpan.className = "resultado-valor";
    }
    
    if (dias > 0) {
        let registro = {
            id: generarId(historialMultas),
            diasRetraso: dias,
            monto: monto,
            fecha: new Date().toISOString()
        };
        historialMultas.unshift(registro);
        guardarEnStorage("biblioteca_historial_multas", historialMultas);
        mostrarHistorialMultas();
    }
    
    if (monto === 0) {
        mostrarToast("¡De una! Devolviste a tiempo, no debés nada", "success");
    } else {
        mostrarToast("Uff, te salió $" + monto + " de multa", "warning");
    }
}

function mostrarHistorialMultas() {
    let lista = document.getElementById("historial-multas");
    if (!lista) return;
    
    if (historialMultas.length === 0) {
        lista.innerHTML = '<div class="lista-vacia"><p>No hay multas calculadas todavía</p></div>';
        return;
    }
    
    let ultimas = historialMultas.slice(0, 10);
    
    let html = "";
    for (let i = 0; i < ultimas.length; i++) {
        let registro = ultimas[i];
        html += '<div class="lista-item">';
        html += '  <div class="lista-item-info">';
        html += '    <span class="lista-item-titulo">$' + registro.monto.toLocaleString("es-AR") + '</span>';
        html += '    <span class="lista-item-subtitulo">' + registro.diasRetraso + ' día(s) de atraso</span>';
        html += '    <span class="lista-item-fecha">' + formatearFecha(registro.fecha) + '</span>';
        html += '  </div>';
        html += '</div>';
    }
    
    lista.innerHTML = html;
}

function limpiarHistorialMultas() {
    historialMultas = [];
    guardarEnStorage("biblioteca_historial_multas", historialMultas);
    mostrarHistorialMultas();
    mostrarToast("Historial limpiado", "info");
}


function agregarJuego(evento) {
    evento.preventDefault();
    
    let titulo = document.getElementById("nuevo-titulo").value.trim();
    let desarrollador = document.getElementById("nuevo-desarrollador").value.trim();
    let genero = document.getElementById("nuevo-genero").value;
    let imagen = document.getElementById("nuevo-imagen").value.trim();
    
    if (!titulo || !desarrollador || !genero) {
        mostrarFeedback("admin-feedback", "Completá los campos obligatorios", "error");
        mostrarToast("Faltan datos", "error");
        return;
    }
    
    let existe = false;
    for (let i = 0; i < juegos.length; i++) {
        if (juegos[i].titulo.toLowerCase() === titulo.toLowerCase()) {
            existe = true;
            break;
        }
    }
    
    if (existe) {
        mostrarFeedback("admin-feedback", "Ya tenemos ese juego, fijate", "error");
        mostrarToast("Juego repetido", "error");
        return;
    }
    
    let emojisPorGenero = {
        "Shooter": "🎯",
        "Aventura": "🗺️",
        "Acción": "💥",
        "Futbol": "⚽",
        "RPG": "⚔️",
        "Estrategia": "♟️",
        "Carreras": "🏎️"
    };
    
    let nuevoJuego = {
        id: generarId(juegos),
        titulo: titulo,
        desarrollador: desarrollador,
        genero: genero,
        disponible: true,
        imagen: imagen || emojisPorGenero[genero] || "🎮"
    };
    
    juegos.push(nuevoJuego);
    guardarEnStorage("biblioteca_juegos", juegos);
    
    mostrarFeedback("admin-feedback", "¡" + titulo + " agregado al catálogo!", "success");
    mostrarToast("Juego agregado de 10", "success");
    
    evento.target.reset();
    mostrarEstadisticas();
}

function restaurarJuegosOriginales() {
    juegos = JUEGOS_INICIALES.slice();
    
    for (let i = 0; i < reservas.length; i++) {
        reservas[i].activa = false;
    }
    
    guardarTodo();
    mostrarToast("Juegos restaurados a los originales", "info");
    mostrarEstadisticas();
    
    let catalogo = document.getElementById("catalogo");
    if (catalogo && catalogo.classList.contains("active")) {
        mostrarJuegos();
    }
}

function limpiarReservas() {
    for (let i = 0; i < juegos.length; i++) {
        juegos[i].disponible = true;
    }
    
    for (let i = 0; i < reservas.length; i++) {
        reservas[i].activa = false;
    }
    
    guardarTodo();
    mostrarToast("Todas las reservas limpiadas", "info");
    mostrarEstadisticas();
}

function limpiarTodo() {
    localStorage.removeItem("biblioteca_juegos");
    localStorage.removeItem("biblioteca_jugadores");
    localStorage.removeItem("biblioteca_reservas");
    localStorage.removeItem("biblioteca_historial_multas");
    
    cargarDatos();
    
    mostrarToast("Todo borrado, empezamos de cero", "warning");
    mostrarEstadisticas();
}

function mostrarEstadisticas() {
    let container = document.getElementById("estadisticas");
    if (!container) return;
    
    let disponibles = 0;
    let reservados = 0;
    for (let i = 0; i < juegos.length; i++) {
        if (juegos[i].disponible) {
            disponibles++;
        } else {
            reservados++;
        }
    }
    
    let reservasActivas = 0;
    for (let i = 0; i < reservas.length; i++) {
        if (reservas[i].activa) {
            reservasActivas++;
        }
    }
    
    let html = '';
    html += '<div class="stat-card"><div class="stat-valor">' + juegos.length + '</div><div class="stat-label">Juegos Totales</div></div>';
    html += '<div class="stat-card"><div class="stat-valor">' + disponibles + '</div><div class="stat-label">Libres</div></div>';
    html += '<div class="stat-card"><div class="stat-valor">' + reservados + '</div><div class="stat-label">Prestados</div></div>';
    html += '<div class="stat-card"><div class="stat-valor">' + jugadores.length + '</div><div class="stat-label">Gamers</div></div>';
    html += '<div class="stat-card"><div class="stat-valor">' + reservasActivas + '</div><div class="stat-label">Préstamos Activos</div></div>';
    html += '<div class="stat-card"><div class="stat-valor">' + historialMultas.length + '</div><div class="stat-label">Multas Calculadas</div></div>';
    
    container.innerHTML = html;
}


function configurarEventos() {
    let botonesNav = document.querySelectorAll(".nav-btn");
    for (let i = 0; i < botonesNav.length; i++) {
        botonesNav[i].addEventListener("click", function() {
            let seccion = this.dataset.section;
            if (seccion) {
                cambiarSeccion(seccion);
            }
        });
    }
    
    let filtroGenero = document.getElementById("filtro-genero");
    let filtroDisponible = document.getElementById("filtro-disponible");
    let buscarJuego = document.getElementById("buscar-juego");
    
    if (filtroGenero) filtroGenero.addEventListener("change", filtrarJuegos);
    if (filtroDisponible) filtroDisponible.addEventListener("change", filtrarJuegos);
    if (buscarJuego) buscarJuego.addEventListener("input", filtrarJuegos);
    
    let formRegistro = document.getElementById("form-registro");
    if (formRegistro) formRegistro.addEventListener("submit", registrarJugador);
    
    let formReserva = document.getElementById("form-reserva");
    if (formReserva) formReserva.addEventListener("submit", procesarReserva);
    
    let formMulta = document.getElementById("form-multa");
    if (formMulta) formMulta.addEventListener("submit", calcularMulta);
    
    let btnLimpiarHistorial = document.getElementById("limpiar-historial");
    if (btnLimpiarHistorial) btnLimpiarHistorial.addEventListener("click", limpiarHistorialMultas);
    
    let formAgregarJuego = document.getElementById("form-agregar-juego");
    if (formAgregarJuego) formAgregarJuego.addEventListener("submit", agregarJuego);
    
    let btnReset = document.getElementById("btn-reset-juegos");
    if (btnReset) btnReset.addEventListener("click", restaurarJuegosOriginales);
    
    let btnLimpiarReservas = document.getElementById("btn-limpiar-reservas");
    if (btnLimpiarReservas) btnLimpiarReservas.addEventListener("click", limpiarReservas);
    
    let btnLimpiarTodo = document.getElementById("btn-limpiar-todo");
    if (btnLimpiarTodo) btnLimpiarTodo.addEventListener("click", limpiarTodo);
}


function iniciarApp() {
    cargarDatos();
    configurarEventos();
    mostrarJuegos();
    
    setTimeout(function() {
        mostrarToast("¡Buenasss! Bienvenido a la Biblioteca Gamer 🎮", "success");
    }, 500);
}

document.addEventListener("DOMContentLoaded", iniciarApp);
