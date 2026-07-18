document.addEventListener('DOMContentLoaded', () => {
    const contenedorProductos = document.getElementById('contenedor-productos');
    const loadMoreContainer = document.getElementById('load-more-container');
    
    window.catalogoActual = []; 
    let categoriasDisponibles = [];

    async function inicializarTienda() {
        const cacheBuster = new Date().getTime();
        try {
            const indexRes = await fetch(`assets/json/categorias_index.json?v=${cacheBuster}`);
            if (!indexRes.ok) throw new Error('No se pudo cargar el índice de categorías');
            
            const indexData = await indexRes.json();
            categoriasDisponibles = indexData.categorias || [];

            generarBotonesFiltro(categoriasDisponibles);

            const urlParams = new URLSearchParams(window.location.search);
            const categoriaFiltro = urlParams.get('categoria') || 'todos';

            actualizarEstadoBotonesFiltro(categoriaFiltro);
            await cargarDatosCategoria(categoriaFiltro);

        } catch (error) {
            console.error('Error:', error);
            if(contenedorProductos) contenedorProductos.innerHTML = '<p style="color:red; padding:20px; font-weight:900;">Error de conexión con el servidor.</p>';
        }
    }

    window.cargarDatosCategoria = async function(categoria) {
        const cacheBuster = new Date().getTime();
        let urlsToFetch = [];

        if (categoria === 'todos') {
            urlsToFetch = categoriasDisponibles.map(cat => `assets/json/${cat}.json?v=${cacheBuster}`);
        } else {
            urlsToFetch = [`assets/json/${categoria}.json?v=${cacheBuster}`];
        }

        try {
            const responses = await Promise.all(urlsToFetch.map(url => fetch(url)));
            const dataArrays = await Promise.all(responses.map(res => res.json()));

            window.catalogoActual = dataArrays.flatMap(data => data.catalogo || []);
            if(contenedorProductos) contenedorProductos.innerHTML = '';
            
            renderizarPagina();
        } catch (error) {
            console.error("Error cargando productos:", error);
            if(contenedorProductos) contenedorProductos.innerHTML = '<p style="padding:20px; font-weight:900;">Error al cargar la categoría.</p>';
        }
    };

    function renderizarPagina() {
        if (window.catalogoActual.length === 0) {
            if(contenedorProductos) contenedorProductos.innerHTML = '<p style="padding:20px; font-weight:900;">No hay prendas en este drop.</p>';
            if(loadMoreContainer) loadMoreContainer.style.display = 'none';
            return;
        }

        // Renderizamos TODO el catálogo sin límites
        window.renderizarTarjetasHTML(window.catalogoActual);

        // Ocultamos el botón "Cargar Más" porque ya se muestra todo
        if (loadMoreContainer) {
            loadMoreContainer.style.display = 'none'; 
        }
    }

    function generarBotonesFiltro(categorias) {
        const contenedorFiltros = document.getElementById('filtros-diseno');
        if (!contenedorFiltros) return;

        let botonesHtml = `<button class="btn-brutalist filter-btn" onclick="cambiarFiltroManual('todos')">Todos</button>`;
        categorias.forEach(tipo => {
            const tipoCapitalizado = tipo.charAt(0).toUpperCase() + tipo.slice(1);
            botonesHtml += `<button class="btn-brutalist filter-btn" onclick="cambiarFiltroManual('${tipo}')">${tipoCapitalizado}</button>`;
        });
        contenedorFiltros.innerHTML = botonesHtml;
    }

    window.cambiarFiltroManual = function(tipoSeleccionado) {
        actualizarEstadoBotonesFiltro(tipoSeleccionado);
        const url = new URL(window.location);
        url.searchParams.set('categoria', tipoSeleccionado);
        window.history.pushState({}, '', url);
        cargarDatosCategoria(tipoSeleccionado);
    };

    function actualizarEstadoBotonesFiltro(tipoSeleccionado) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            const btnText = btn.innerText.toLowerCase();
            if (btnText === tipoSeleccionado.toLowerCase() || (tipoSeleccionado === 'todos' && btnText === 'todos')) {
                btn.classList.add('active');
            }
        });
    }

    inicializarTienda();
});

window.renderizarTarjetasHTML = function(productos) {
    const contenedorProductos = document.getElementById('contenedor-productos');
    if(!contenedorProductos) return;
    
    let htmlContent = '';

    productos.forEach(diseno => {
        const tiposDePrenda = Object.keys(diseno.variaciones);
        if (tiposDePrenda.length === 0) return;

        const tipoPorDefecto = tiposDePrenda.includes('oversize') ? 'oversize' : tiposDePrenda[0];

        let carruselHtml = `<div class="carousel-track" id="track-${diseno.id}" data-index="0" data-total="0"></div>`;
        let botonesCarruselHtml = `
            <button class="carousel-btn prev" style="display: none;" onclick="moverCarrusel(event, '${diseno.id}', -1)">◀</button>
            <button class="carousel-btn next" style="display: none;" onclick="moverCarrusel(event, '${diseno.id}', 1)">▶</button>
        `;

        let tiposHtml = '';
        tiposDePrenda.forEach(tipo => {
            const checked = tipo === tipoPorDefecto ? 'checked' : '';
            const tipoCapitalizado = tipo.charAt(0).toUpperCase() + tipo.slice(1);
            tiposHtml += `
                <input type="radio" id="tipo-${diseno.id}-${tipo}" name="tipo-${diseno.id}" value="${tipo}" ${checked} class="hidden-selector" 
                       onchange="cambiarTipoPrenda('${diseno.id}', '${tipo}')">
                <label for="tipo-${diseno.id}-${tipo}" class="type-badge" title="Seleccionar ${tipoCapitalizado}">${tipoCapitalizado}</label>
            `;
        });

        htmlContent += `
            <article class="product-card" id="card-${diseno.id}" onclick="irAlDetalle(event, '${diseno.id}')" style="cursor: pointer;">
                <div class="card-image-container" id="img-container-${diseno.id}">
                    <div class="discount-badge" id="badge-${diseno.id}" style="display:none;"></div>
                    ${carruselHtml}
                    ${botonesCarruselHtml}
                </div>
                <div class="card-info">
                    <h2 class="product-name">${diseno.titulo}</h2>
                    <div class="price-container" id="price-${diseno.id}"></div>
                    <div class="options-section">
                        <div class="types-wrapper" style="margin-bottom: 15px; display: flex; gap: 8px; flex-wrap: wrap;">
                            ${tiposHtml}
                        </div>
                        <div class="colors-wrapper" id="colors-${diseno.id}" style="margin-bottom: 10px;"></div>
                        <div class="sizes-wrapper" id="sizes-${diseno.id}"></div>
                    </div>
                    <div class="card-actions">
                        <button type="button" class="btn-brutalist btn-details" onclick="irAlDetalle(event, '${diseno.id}')">
                            Ver Más
                        </button>
                        <button type="button" class="btn-brutalist btn-cart" title="Añadir al carrito" onclick="agregarAlCarritoDesdeTarjeta(event, '${diseno.id}')">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square" stroke-linejoin="miter">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </article>
        `;
    });

    contenedorProductos.insertAdjacentHTML('beforeend', htmlContent);

    productos.forEach(diseno => {
        const tiposDePrenda = Object.keys(diseno.variaciones);
        if (tiposDePrenda.length > 0) {
            const tipoPorDefecto = tiposDePrenda.includes('oversize') ? 'oversize' : tiposDePrenda[0];
            cambiarTipoPrenda(diseno.id, tipoPorDefecto);
        }
    });
};

window.generarHTMLColores = function(idDiseno, colores) {
    if (!colores) return '';
    let html = '';
    colores.forEach((color, index) => {
        const checked = index === 0 ? 'checked' : '';
        const imagenesStr = color.imagenes.join(',');
        html += `
            <input type="radio" id="color-${idDiseno}-${index}" name="color-${idDiseno}" value="${color.nombre}" ${checked} class="hidden-selector" 
                   onchange="cambiarColorPrenda('${idDiseno}', '${imagenesStr}')">
            <label for="color-${idDiseno}-${index}" class="color-box" style="background-color: ${color.codigo_hex};" title="${color.nombre}"></label>
        `;
    });
    return html;
};

window.generarHTMLTallas = function(idDiseno, tallas) {
    if (!tallas) return '';
    let html = '';
    tallas.forEach((talla, index) => {
        const checked = index === 0 ? 'checked' : '';
        html += `
            <input type="radio" id="talla-${idDiseno}-${index}" name="talla-${idDiseno}" value="${talla}" ${checked} class="hidden-selector">
            <label for="talla-${idDiseno}-${index}" class="size-badge">${talla}</label>
        `;
    });
    return html;
};

window.cambiarTipoPrenda = function(idDiseno, tipoPrenda) {
    const diseno = window.catalogoActual.find(d => d.id === idDiseno);
    if (!diseno || !diseno.variaciones[tipoPrenda]) return;

    const detalles = diseno.variaciones[tipoPrenda];
    const formatoMoneda = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

    const containerPrecio = document.getElementById(`price-${idDiseno}`);
    const badgeDescuento = document.getElementById(`badge-${idDiseno}`);
    const preciosInfo = detalles.precios_y_descuentos;

    if (preciosInfo.tiene_descuento) {
        containerPrecio.innerHTML = `
            <span class="price-final">${formatoMoneda.format(preciosInfo.precio_final)}</span>
            <span class="price-regular">${formatoMoneda.format(preciosInfo.precio_regular)}</span>
        `;
        if(badgeDescuento) {
            badgeDescuento.textContent = preciosInfo.texto_badge;
            badgeDescuento.style.display = 'block';
        }
    } else {
        containerPrecio.innerHTML = `<span class="price-final">${formatoMoneda.format(preciosInfo.precio_regular)}</span>`;
        if(badgeDescuento) badgeDescuento.style.display = 'none';
    }

    document.getElementById(`colors-${idDiseno}`).innerHTML = generarHTMLColores(idDiseno, detalles.colores_disponibles);
    document.getElementById(`sizes-${idDiseno}`).innerHTML = generarHTMLTallas(idDiseno, detalles.tallas_disponibles);

    if (detalles.colores_disponibles && detalles.colores_disponibles.length > 0) {
        const imagenesPrimerColor = detalles.colores_disponibles[0].imagenes.join(',');
        cambiarColorPrenda(idDiseno, imagenesPrimerColor);
    }
};

window.cambiarColorPrenda = function(idDiseno, imagenesStr) {
    const track = document.getElementById(`track-${idDiseno}`);
    const card = document.getElementById(`card-${idDiseno}`);
    
    if (!track || !imagenesStr) return;

    const nuevasImagenes = imagenesStr.split(',');
    
    // El loading="lazy" ayuda a que no se cuelgue al cargar todas las camisetas de golpe.
    track.innerHTML = nuevasImagenes.map(img => `<img src="${img}" alt="Prenda Variante" loading="lazy">`).join('');
    track.dataset.index = 0;
    track.dataset.total = nuevasImagenes.length;
    track.style.transform = `translateX(0%)`; 

    const btnPrev = card.querySelector('.carousel-btn.prev');
    const btnNext = card.querySelector('.carousel-btn.next');

    if (btnPrev && btnNext) {
        if (nuevasImagenes.length > 1) {
            btnPrev.style.display = 'flex';
            btnNext.style.display = 'flex';
        } else {
            btnPrev.style.display = 'none';
            btnNext.style.display = 'none';
        }
    }
};

window.moverCarrusel = function(event, idDiseno, direccion) {
    event.stopPropagation(); 
    const track = document.getElementById(`track-${idDiseno}`);
    let currentIndex = parseInt(track.dataset.index);
    const total = parseInt(track.dataset.total);

    currentIndex += direccion;
    if (currentIndex < 0) currentIndex = total - 1; 
    if (currentIndex >= total) currentIndex = 0;

    track.dataset.index = currentIndex;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
};

window.agregarAlCarritoDesdeTarjeta = function(event, idDiseno) {
    event.stopPropagation(); 

    const diseno = window.catalogoActual.find(d => d.id === idDiseno);
    if (!diseno) return;

    let tipoPrendaInput = document.querySelector(`input[name="tipo-${idDiseno}"]:checked`) || document.querySelector(`input[name="tipo-${idDiseno}"]`);
    const tipoPrenda = tipoPrendaInput ? tipoPrendaInput.value : 'No especificado';

    let tallaInput = document.querySelector(`input[name="talla-${idDiseno}"]:checked`) || document.querySelector(`input[name="talla-${idDiseno}"]`);
    const talla = tallaInput ? tallaInput.value : 'Única';

    let colorInput = document.querySelector(`input[name="color-${idDiseno}"]:checked`) || document.querySelector(`input[name="color-${idDiseno}"]`);
    let color = 'Único';
    
    const detalles = diseno.variaciones[tipoPrenda];
    
    if (colorInput && detalles) {
        const idParts = colorInput.id.split('-');
        const indexColor = parseInt(idParts[idParts.length - 1]);
        if (!isNaN(indexColor) && detalles.colores_disponibles[indexColor]) {
            color = detalles.colores_disponibles[indexColor].nombre;
        } else {
            color = colorInput.value; 
        }
    }

    if (!detalles) return;

    const preciosInfo = detalles.precios_y_descuentos;
    const precioAplicable = preciosInfo.tiene_descuento ? preciosInfo.precio_final : preciosInfo.precio_regular;

    const track = document.getElementById(`track-${idDiseno}`);
    const primeraImagen = track.querySelector('img') ? track.querySelector('img').src : '';

    const nuevoItem = {
        id: diseno.id,
        titulo: diseno.titulo,
        tipo: tipoPrenda,
        talla: talla,
        color: color,
        precio: precioAplicable,
        cantidad: 1, 
        imagen: primeraImagen
    };

    if (typeof window.rastrearAñadirCarrito === 'function') {
        window.rastrearAñadirCarrito(nuevoItem);
    }

    let carrito = JSON.parse(localStorage.getItem('rubenzCart')) || [];

    const indexExistente = carrito.findIndex(item => 
        String(item.id).trim() === String(nuevoItem.id).trim() && 
        String(item.tipo).trim().toLowerCase() === String(nuevoItem.tipo).trim().toLowerCase() && 
        String(item.talla).trim().toLowerCase() === String(nuevoItem.talla).trim().toLowerCase() && 
        String(item.color).trim().toLowerCase() === String(nuevoItem.color).trim().toLowerCase()
    );

    if (indexExistente !== -1) {
        carrito[indexExistente].cantidad += nuevoItem.cantidad;
    } else {
        carrito.push(nuevoItem);
    }

    localStorage.setItem('rubenzCart', JSON.stringify(carrito));
    
    if (typeof window.actualizarCarritoGlobal === 'function') {
        window.actualizarCarritoGlobal();
    }

    if (typeof window.animarIconoCarrito === 'function') {
        window.animarIconoCarrito(event);
    }
};

window.irAlDetalle = function(event, idDiseno) {
    const elementoClickeado = event.target;
    const esBotonVerMas = elementoClickeado.closest('.btn-details');

    if (!esBotonVerMas && (
        elementoClickeado.closest('.options-section') || 
        elementoClickeado.closest('.card-actions') || 
        elementoClickeado.closest('.carousel-btn') || 
        elementoClickeado.closest('.hidden-selector')
    )) {
        return; 
    }

    const tipoPrendaInput = document.querySelector(`input[name="tipo-${idDiseno}"]:checked`);
    const tipoPrenda = tipoPrendaInput ? tipoPrendaInput.value : '';

    const colorInput = document.querySelector(`input[name="color-${idDiseno}"]:checked`);
    let colorIndex = 0; 
    if (colorInput) {
        const idParts = colorInput.id.split('-');
        colorIndex = idParts[idParts.length - 1]; 
    }

    const tallaInput = document.querySelector(`input[name="talla-${idDiseno}"]:checked`);
    const tallaSeleccionada = tallaInput ? tallaInput.value : '';

    const diseno = window.catalogoActual.find(d => d.id === idDiseno);
    if (diseno && typeof window.rastrearVerProducto === 'function') {
        window.rastrearVerProducto(idDiseno, diseno.titulo, tipoPrenda);
    }

    const urlDestino = `detalle_producto.html?id=${idDiseno}&tipo=${tipoPrenda}&color=${colorIndex}&talla=${tallaSeleccionada}`;
    setTimeout(() => window.location.href = urlDestino, 150); 
};

// ---- FUNCIÓN INFALIBLE PARA AGRANDAR/REDUCIR TARJETAS ----
window.alternarVista = function() {
    const grid = document.getElementById('contenedor-productos');
    const btn = document.getElementById('view-toggle-btn');
    
    if (grid && btn) {
        grid.classList.toggle('single-view');
        
        if (grid.classList.contains('single-view')) {
            btn.innerText = "Ver Varias ⊞";
        } else {
            btn.innerText = "Ver Una ⊟";
        }
    }
};