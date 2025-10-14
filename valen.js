let contenedor = document.getElementById('contenedorImagenes');
let botonAleatoria = document.getElementById('botonAleatoria');
let botonSeleccionar = document.getElementById('botonSeleccionar');
let selectorPlantas = document.getElementById('selectorPlantas');

// ⚠️ IMPORTANTE: reemplazá este token con el tuyo desde https://trefle.io
let apiKey = 'xiB5J64zW05yyBsUqUS0wFjuTXA_s9cUCFvSDqLeZVc';
let urlBase = 'https://trefle.io/api/v1/plants';

// 🔹 Proxy para evitar error CORS
const proxyUrl = "https://api.allorigins.win/raw?url=";

// 🔹 Limpia el contenedor antes de mostrar una nueva planta
function limpiarContenedor() {
    contenedor.innerHTML = '';
}

// 🔹 Muestra imagen, nombre y descripción de la planta
function mostrarPlanta(imagen, nombre, descripcion) {
    const img = document.createElement('img');
    img.src = imagen;
    img.alt = nombre;
    img.style.maxWidth = "400px";
    img.style.borderRadius = "10px";

    let titulo = document.createElement('h2');
    titulo.textContent = nombre;

    let info = document.createElement('p');
    info.textContent = descripcion || "Información no disponible";

    contenedor.appendChild(img);
    contenedor.appendChild(titulo);
    contenedor.appendChild(info);
}

// 🔹 Devuelve la primera planta que tenga imagen
function obtenerPlantaValida(data) {
    for (let planta of data) {
        if (planta.image_url) {
            return planta;
        }
    }
    return null;
}

// 🔹 Hace la petición a la API pasando por el proxy
async function fetchConProxy(url) {
    let res = await fetch(proxyUrl + encodeURIComponent(url));
    return await res.json();
}

// 🔹 Obtiene una planta aleatoria
async function obtenerPlantaAleatoria() {
    limpiarContenedor();
    try {
        let plantaValida = null;
        let pagina = 1;

        while (!plantaValida && pagina <= 10) { 
            let data = await fetchConProxy(`${urlBase}?token=${apiKey}&page=${pagina}&limit=10`);
            plantaValida = await obtenerPlantaValida(data.data);
            pagina++;
        }

        if (plantaValida) {
            mostrarPlanta(
                plantaValida.image_url,
                plantaValida.common_name || plantaValida.scientific_name,
                plantaValida.family_common_name || "Descripción no disponible"
            );
        } else {
            mostrarPlanta(
                'https://via.placeholder.com/400x300?text=No+hay+imagen',
                'Planta no encontrada',
                'No hay información disponible'
            );
        }
    } catch (err) {
        console.error("Error al obtener planta aleatoria:", err);
        mostrarPlanta(
            'https://via.placeholder.com/400x300?text=Error',
            'Error de conexión',
            'No se pudo obtener la planta'
        );
    }
}

// 🔹 Busca planta por nombre
async function obtenerPlantaPorNombre(nombre) {
    limpiarContenedor();
    try {
        let data = await fetchConProxy(`${urlBase}/search?token=${apiKey}&q=${nombre}`);
        let plantaValida = await obtenerPlantaValida(data.data);

        if (plantaValida) {
            mostrarPlanta(
                plantaValida.image_url,
                plantaValida.common_name || plantaValida.scientific_name,
                plantaValida.family_common_name || "Descripción no disponible"
            );
        } else {
            mostrarPlanta(
                'https://via.placeholder.com/400x300?text=No+hay+imagen',
                'Planta no encontrada',
                'No hay información disponible'
            );
        }
    } catch (err) {
        console.error("Error al obtener planta:", err);
        mostrarPlanta(
            'https://via.placeholder.com/400x300?text=Error',
            'Error de conexión',
            'No se pudo obtener la planta'
        );
    }
}

// 🔹 Eventos de botones
botonAleatoria.onclick = () => obtenerPlantaAleatoria();
botonSeleccionar.onclick = () => {
    let plantaElegida = selectorPlantas.value;
    if (plantaElegida) {
        obtenerPlantaPorNombre(plantaElegida);
    } else {
        alert("Selecciona una planta primero");
    }
};
