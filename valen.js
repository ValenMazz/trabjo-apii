const contenedor = document.getElementById('contenedorImagenes');
const botonAleatoria = document.getElementById('botonAleatoria');
const botonSeleccionar = document.getElementById('botonSeleccionar');
const selectorPlantas = document.getElementById('selectorPlantas');

// ---- TU API KEY DE TREFLE ----
const apiKey = 'usr-xiB5J64zW05yyBsUqUS0wFjuTXA_s9cUCFvSDqLeZVc';
const urlBase = 'https://trefle.io/api/v1/plants';

// Proxy alternativo para CORS
const proxyUrl = 'https://api.allorigins.win/raw?url=';

function limpiarContenedor() {
    contenedor.innerHTML = '';
}

function mostrarPlanta(imagen, nombre, descripcion) {
    const img = document.createElement('img');
    img.src = imagen;
    img.alt = nombre;
    img.style.maxWidth = "400px";

    const titulo = document.createElement('h2');
    titulo.textContent = nombre;

    const info = document.createElement('p');
    info.textContent = descripcion || "Información no disponible";

    contenedor.appendChild(img);
    contenedor.appendChild(titulo);
    contenedor.appendChild(info);
}

// Función para obtener una planta válida con imagen
async function obtenerPlantaValida(data) {
    for (let planta of data) {
        if (planta.image_url) {
            return planta;
        }
    }
    return null;
}

// Función auxiliar para fetch con proxy CORS
async function fetchConProxy(url) {
    const res = await fetch(proxyUrl + encodeURIComponent(url));
    return await res.json();
}

// Planta aleatoria
async function obtenerPlantaAleatoria() {
    limpiarContenedor();
    try {
        let plantaValida = null;
        let pagina = 1;
        while (!plantaValida && pagina <= 10) { // intentamos hasta 10 páginas
            const data = await fetchConProxy(`${urlBase}?token=${apiKey}&page=${pagina}&limit=10`);
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
            mostrarPlanta('https://via.placeholder.com/400x300?text=No+hay+imagen', 'Planta no encontrada', 'No hay información disponible');
        }
    } catch (err) {
        console.error("Error al obtener planta aleatoria:", err);
    }
}

// Planta por nombre seleccionada
async function obtenerPlantaPorNombre(nombre) {
    limpiarContenedor();
    try {
        const data = await fetchConProxy(`${urlBase}/search?token=${apiKey}&q=${nombre}`);
        const plantaValida = await obtenerPlantaValida(data.data);
        if (plantaValida) {
            mostrarPlanta(
                plantaValida.image_url,
                plantaValida.common_name || plantaValida.scientific_name,
                plantaValida.family_common_name || "Descripción no disponible"
            );
        } else {
            mostrarPlanta('https://via.placeholder.com/400x300?text=No+hay+imagen', 'Planta no encontrada', 'No hay información disponible');
        }
    } catch (err) {
        console.error("Error al obtener planta:", err);
    }
}

botonAleatoria.onclick = () => obtenerPlantaAleatoria();
botonSeleccionar.onclick = () => {
    const plantaElegida = selectorPlantas.value;
    if (plantaElegida) {
        obtenerPlantaPorNombre(plantaElegida);
    } else {
        alert("Selecciona una planta primero");
    }
};
