document.addEventListener('DOMContentLoaded', () => {
    const contenedorProductos = document.getElementById('contenedor-productos');
    
    // SEGURIDAD GLOBAL: Si no hay contenedor de productos, este script se apaga automáticamente
    if (!contenedorProductos) {
        return; 
    }

    const loadMoreContainer = document.getElementById('load-more-container');
    
    window.catalogoGlobal = []; 
    window.catalogoAplanado = []; 
    window.prendasDisponibles = [];
    window.bannersPrendas = {};
    
    const urlParams = new URLSearchParams(window.location.search);
    window.prendaSeleccionada = urlParams.get('prenda') || 'todos';
    window.categoriaSeleccionada = urlParams.get('categoria') || 'todos';

    async function inicializarTienda() {
        try {
            // 1. Lanzar las dos peticiones iniciales AL MISMO TIEMPO (En paralelo)
            const [bannerRes, indexRes] = await Promise.all([
                fetch(`assets/json/banner-ropa.json`).catch(() => null),
                fetch(`assets/json/categorias_index.json`).catch(() => null)
            ]);

            // Procesar Banner
            if (bannerRes && bannerRes.ok) {
                window.bannersPrendas = await bannerRes.json();
            }

            // Procesar Índice de Categorías
            if (!indexRes || !indexRes.ok) throw new Error('No se pudo cargar el índice de categorías');
            
            const indexData = await indexRes.json();
            const categoriasDisponibles = indexData.categorias || [];

            // 2. Cargar TODO el catálogo de forma simultánea
            const urlsToFetch = categoriasDisponibles.map(cat => `assets/json/${cat}.json`);
            const responses = await Promise.all(urlsToFetch.map(url => fetch(url).catch(()=>null)));
            const dataArrays = await Promise.all(
                responses.map(res => (res && res.ok ? res.json() : { catalogo: [] }))
            );

            window.catalogoGlobal = dataArrays.flatMap(data => data.catalogo || []);
            
            // 3. Aplanar el catálogo para separar cada tipo de prenda como un producto independiente
            let prendasSet = new Set();
            window.catalogoAplanado = [];

            window.catalogoGlobal.forEach(diseno => {
                if (diseno.variaciones) {
                    Object.keys(diseno.variaciones).forEach(tipo => {
                        prendasSet.add(tipo);
                        window.catalogoAplanado.push({
                            idProductoUnico: `${diseno.id}-${tipo}`,
                            idDiseno: diseno.id,
                            titulo: diseno.titulo,
                            tipoDiseno: diseno.tipo_diseno || 'otros',
                            tipoPrenda: tipo,
                            variacion: diseno.variaciones[tipo],
                            disenoCompleto: diseno
                        });
                    });
                }
            });

            window.prendasDisponibles = Array.from(prendasSet);

            // 4. Inicializar la vista
            generarFiltrosCategorias();
            actualizarBanner(window.prendaSeleccionada);
            renderizarPaginaFiltrada();

        } catch (error) {
            console.error('Error:', error);
            if(contenedorProductos) contenedorProductos.innerHTML = '<p style="color:red; padding:20px; font-weight:900;">Error de conexión con el servidor.</p>';
        }
    }

    // ==========================================
    // ESTRUCTURA 1: BANNER DINÁMICO (Responsive)
    // ==========================================

window.actualizarBanner = function(prenda) {
    const container = document.getElementById('banner-prenda-container');
    if (!container) return;

    if (window.bannersPrendas && window.bannersPrendas[prenda]) {
        // AQUÍ EL CAMBIO: Añadir fetchpriority="high"
        container.innerHTML = `<img src="${window.bannersPrendas[prenda]}" alt="Banner de ${prenda}" fetchpriority="high">`;
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
        container.innerHTML = '';
    }
};

    // ==========================================
    // ESTRUCTURA 2: BARRA DE FILTROS (Solo Categorías)
    // ==========================================
    window.generarFiltrosCategorias = function() {
        const contenedorFiltros = document.getElementById('filtros-diseno');
        if (!contenedorFiltros) return;

        let categoriasValidas = new Set();
        window.catalogoAplanado.forEach(item => {
            if (window.prendaSeleccionada === 'todos' || item.tipoPrenda === window.prendaSeleccionada) {
                categoriasValidas.add(item.tipoDiseno);
            }
        });

        let botonesHtml = `<button class="btn-brutalist filter-btn ${window.categoriaSeleccionada === 'todos' ? 'active' : ''}" onclick="cambiarFiltroCategoria('todos')">Todas</button>`;
        
        categoriasValidas.forEach(cat => {
            const capitalizado = cat.charAt(0).toUpperCase() + cat.slice(1);
            const isActive = window.categoriaSeleccionada === cat ? 'active' : '';
            botonesHtml += `<button class="btn-brutalist filter-btn ${isActive}" onclick="cambiarFiltroCategoria('${cat}')">${capitalizado}</button>`;
        });

        contenedorFiltros.innerHTML = botonesHtml;
    };

    // ==========================================
    // LÓGICA DE CONTROL DE CAMBIOS
    // ==========================================
    window.cambiarFiltroPrenda = function(event, prenda, elementoClickeado) {
        if(event) event.preventDefault();
        window.prendaSeleccionada = prenda;
        
        let categoriaValida = false;
        if (window.categoriaSeleccionada !== 'todos') {
            categoriaValida = window.catalogoAplanado.some(item => 
                (prenda === 'todos' || item.tipoPrenda === prenda) && item.tipoDiseno === window.categoriaSeleccionada
            );
            if(!categoriaValida) window.categoriaSeleccionada = 'todos';
        }
        
        actualizarUrl();
        generarFiltrosCategorias();
        actualizarBanner(prenda);
        renderizarPaginaFiltrada();

        // Mover la clase 'active' visualmente en el menú de prendas (inyectado por index.js)
        if (elementoClickeado) {
            document.querySelectorAll('.menu-prenda-link').forEach(link => link.classList.remove('active'));
            elementoClickeado.classList.add('active');
        }

        const menuOverlay = document.getElementById('main-nav-menu');
        if (menuOverlay) menuOverlay.classList.remove('show');
    };

    window.cambiarFiltroCategoria = function(categoria) {
        window.categoriaSeleccionada = categoria;
        actualizarUrl();
        generarFiltrosCategorias(); 
        renderizarPaginaFiltrada();
    };

    function actualizarUrl() {
        const url = new URL(window.location);
        if(window.prendaSeleccionada === 'todos') url.searchParams.delete('prenda');
        else url.searchParams.set('prenda', window.prendaSeleccionada);
        
        if(window.categoriaSeleccionada === 'todos') url.searchParams.delete('categoria');
        else url.searchParams.set('categoria', window.categoriaSeleccionada);
        
        window.history.pushState({}, '', url);
    }

    // ==========================================
    // ESTRUCTURA 3: RENDERIZAR PRODUCTOS
    // ==========================================
    window.renderizarPaginaFiltrada = function() {
        if (!contenedorProductos) return;

        const itemsFiltrados = window.catalogoAplanado.filter(item => {
            const pasaPrenda = (window.prendaSeleccionada === 'todos') || (item.tipoPrenda === window.prendaSeleccionada);
            const pasaCat = (window.categoriaSeleccionada === 'todos') || (item.tipoDiseno === window.categoriaSeleccionada);
            return pasaPrenda && pasaCat;
        });

        contenedorProductos.innerHTML = '';

        if (itemsFiltrados.length === 0) {
            contenedorProductos.innerHTML = '<p style="padding:20px; font-weight:900;">No hay prendas en esta selección.</p>';
            if(loadMoreContainer) loadMoreContainer.style.display = 'none';
            return;
        }

        window.renderizarTarjetasHTML(itemsFiltrados);
        if (loadMoreContainer) loadMoreContainer.style.display = 'flex'; 
    };

    inicializarTienda();
});

// ==========================================
// RENDERIZADO DE LAS TARJETAS (CARDS)
// ==========================================
window.renderizarTarjetasHTML = function(items) {
    const contenedorProductos = document.getElementById('contenedor-productos');
    if(!contenedorProductos) return;
    
    let htmlContent = '';

    items.forEach(item => {
        const idUnico = item.idProductoUnico; 
        const tipoCapitalizado = item.tipoPrenda.charAt(0).toUpperCase() + item.tipoPrenda.slice(1);

        let carruselHtml = `<div class="carousel-track" id="track-${idUnico}" data-index="0" data-total="0"></div>`;
        let botonesCarruselHtml = `
            <button class="carousel-btn prev" style="display: none;" onclick="moverCarrusel(event, '${idUnico}', -1)">◀</button>
            <button class="carousel-btn next" style="display: none;" onclick="moverCarrusel(event, '${idUnico}', 1)">▶</button>
        `;

        htmlContent += `
            <article class="product-card" id="card-${idUnico}" onclick="irAlDetalle(event, '${item.idDiseno}', '${item.tipoPrenda}', '${idUnico}')" style="cursor: pointer;">
                <div class="card-image-container" id="img-container-${idUnico}">
                    <div class="discount-badge" id="badge-${idUnico}" style="display:none;"></div>
                    ${carruselHtml}
                    ${botonesCarruselHtml}
                </div>
                <div class="card-info">
                    <h2 class="product-name">${item.titulo} <br><span style="font-size: 0.80em; color: gray; font-weight: normal;">${tipoCapitalizado}</span></h2>
                    <div class="price-container" id="price-${idUnico}"></div>
                    <div class="options-section">
                        <div class="colors-wrapper" id="colors-${idUnico}" style="margin-bottom: 10px;"></div>
                        <div class="sizes-wrapper" id="sizes-${idUnico}"></div>
                    </div>
                    <div class="card-actions">
                        <button type="button" class="btn-brutalist btn-details" onclick="irAlDetalle(event, '${item.idDiseno}', '${item.tipoPrenda}', '${idUnico}')">
                            Ver Más
                        </button>
                        <button type="button" class="btn-brutalist btn-cart" title="Añadir al carrito" onclick="agregarAlCarritoDesdeTarjeta(event, '${item.idDiseno}', '${item.tipoPrenda}', '${idUnico}')">
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

    items.forEach(item => {
        inicializarTarjetaPrenda(item);
    });
};

function inicializarTarjetaPrenda(item) {
    const idUnico = item.idProductoUnico;
    const detalles = item.variacion;
    const formatoMoneda = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

    const containerPrecio = document.getElementById(`price-${idUnico}`);
    const badgeDescuento = document.getElementById(`badge-${idUnico}`);
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

    document.getElementById(`colors-${idUnico}`).innerHTML = window.generarHTMLColores(idUnico, detalles.colores_disponibles);
    document.getElementById(`sizes-${idUnico}`).innerHTML = window.generarHTMLTallas(idUnico, detalles.tallas_disponibles);

    if (detalles.colores_disponibles && detalles.colores_disponibles.length > 0) {
        const imagenesPrimerColor = detalles.colores_disponibles[0].imagenes.join(',');
        window.cambiarColorPrenda(idUnico, imagenesPrimerColor);
    }
}

window.generarHTMLColores = function(idUnico, colores) {
    if (!colores) return '';
    let html = '';
    colores.forEach((color, index) => {
        const checked = index === 0 ? 'checked' : '';
        const imagenesStr = color.imagenes.join(',');
        html += `
            <input type="radio" id="color-${idUnico}-${index}" name="color-${idUnico}" value="${color.nombre}" ${checked} class="hidden-selector" 
                   onchange="cambiarColorPrenda('${idUnico}', '${imagenesStr}')">
            <label for="color-${idUnico}-${index}" class="color-box" style="background-color: ${color.codigo_hex};" title="${color.nombre}"></label>
        `;
    });
    return html;
};

window.generarHTMLTallas = function(idUnico, tallas) {
    if (!tallas) return '';
    let html = '';
    tallas.forEach((talla, index) => {
        const checked = index === 0 ? 'checked' : '';
        html += `
            <input type="radio" id="talla-${idUnico}-${index}" name="talla-${idUnico}" value="${talla}" ${checked} class="hidden-selector">
            <label for="talla-${idUnico}-${index}" class="size-badge">${talla}</label>
        `;
    });
    return html;
};

window.cambiarColorPrenda = function(idUnico, imagenesStr) {
    const track = document.getElementById(`track-${idUnico}`);
    const card = document.getElementById(`card-${idUnico}`);
    
    if (!track || !imagenesStr) return;

    const nuevasImagenes = imagenesStr.split(',');
    
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

window.moverCarrusel = function(event, idUnico, direccion) {
    event.stopPropagation(); 
    const track = document.getElementById(`track-${idUnico}`);
    let currentIndex = parseInt(track.dataset.index);
    const total = parseInt(track.dataset.total);

    currentIndex += direccion;
    if (currentIndex < 0) currentIndex = total - 1; 
    if (currentIndex >= total) currentIndex = 0;

    track.dataset.index = currentIndex;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
};

window.agregarAlCarritoDesdeTarjeta = function(event, idDiseno, tipoPrenda, idUnico) {
    event.stopPropagation(); 

    const itemAplanado = window.catalogoAplanado.find(i => i.idProductoUnico === idUnico);
    if (!itemAplanado) return;
    
    const diseno = itemAplanado.disenoCompleto;
    const detalles = itemAplanado.variacion;

    let tallaInput = document.querySelector(`input[name="talla-${idUnico}"]:checked`) || document.querySelector(`input[name="talla-${idUnico}"]`);
    const talla = tallaInput ? tallaInput.value : 'Única';

    let colorInput = document.querySelector(`input[name="color-${idUnico}"]:checked`) || document.querySelector(`input[name="color-${idUnico}"]`);
    let color = 'Único';
    let colorIndex = 0; 
    
    if (colorInput && detalles) {
        const idParts = colorInput.id.split('-');
        const indexColor = parseInt(idParts[idParts.length - 1]);
        if (!isNaN(indexColor) && detalles.colores_disponibles[indexColor]) {
            color = detalles.colores_disponibles[indexColor].nombre;
            colorIndex = indexColor;
        } else {
            color = colorInput.value;
            if (detalles.colores_disponibles) {
                const foundIndex = detalles.colores_disponibles.findIndex(c => c.nombre === color);
                colorIndex = foundIndex !== -1 ? foundIndex : 0;
            }
        }
    }

    const preciosInfo = detalles.precios_y_descuentos;
    const precioAplicable = preciosInfo.tiene_descuento ? preciosInfo.precio_final : preciosInfo.precio_regular;

    const track = document.getElementById(`track-${idUnico}`);
    const primeraImagen = track.querySelector('img') ? track.querySelector('img').src : '';

    const nuevoItem = {
        id: diseno.id,
        titulo: diseno.titulo,
        tipo: tipoPrenda,
        talla: talla,
        color: color,
        colorIndex: colorIndex, 
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
        carrito[indexExistente].colorIndex = colorIndex;
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

window.irAlDetalle = function(event, idDiseno, tipoPrenda, idUnico) {
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

    const colorInput = document.querySelector(`input[name="color-${idUnico}"]:checked`);
    let colorIndex = 0; 
    if (colorInput) {
        const idParts = colorInput.id.split('-');
        colorIndex = idParts[idParts.length - 1]; 
    }

    const tallaInput = document.querySelector(`input[name="talla-${idUnico}"]:checked`);
    const tallaSeleccionada = tallaInput ? tallaInput.value : '';

    const itemAplanado = window.catalogoAplanado.find(i => i.idProductoUnico === idUnico);
    if (itemAplanado && typeof window.rastrearVerProducto === 'function') {
        window.rastrearVerProducto(itemAplanado.idDiseno, itemAplanado.titulo, tipoPrenda);
    }

    const colorIndexNum = parseInt(colorIndex) || 0;
    const urlDestino = `detalle_producto.html?id=${idDiseno}&tipo=${tipoPrenda}&color=${colorIndexNum}&talla=${tallaSeleccionada}`;
    setTimeout(() => window.location.href = urlDestino, 150); 
};