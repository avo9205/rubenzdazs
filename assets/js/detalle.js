document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const urlTipo = urlParams.get('tipo');
    const urlColor = urlParams.get('color');
    const urlTalla = urlParams.get('talla');

    if (!productId) {
        mostrarError("No se especificó ningún producto.");
        return;
    }

    let productoActual = null;
    
    // ==========================================
    // POPUP (ZOOM) DE LA IMAGEN PRINCIPAL
    // ==========================================
    const imageModalHTML = `
        <div id="image-zoom-modal" class="modal-overlay hidden" style="z-index: 10000; background: rgba(0,0,0,0.9);">
            <span id="close-zoom-modal" class="btn-close-image" title="Cerrar">&times;</span>
            <img id="zoomed-image" src="" class="image-popup-content" alt="Zoom Producto">
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', imageModalHTML);

    const zoomModal = document.getElementById('image-zoom-modal');
    const zoomedImage = document.getElementById('zoomed-image');
    const closeZoomModal = document.getElementById('close-zoom-modal');
    const mainImageElement = document.getElementById('main-image');

    const ocultarZoomModal = () => {
        zoomModal.classList.add('hidden');
        document.body.classList.remove('no-scroll'); 
    };

    mainImageElement.addEventListener('click', () => {
        zoomedImage.src = mainImageElement.src; 
        zoomModal.classList.remove('hidden');
        document.body.classList.add('no-scroll'); 
    });

    closeZoomModal.addEventListener('click', ocultarZoomModal);

    zoomModal.addEventListener('click', (e) => {
        if (e.target === zoomModal) {
            ocultarZoomModal();
        }
    });

    async function cargarProducto() {
        const cacheBuster = new Date().getTime();
        try {
            const indexRes = await fetch(`assets/json/categorias_index.json?v=${cacheBuster}`);
            const indexData = await indexRes.json();
            const categorias = indexData.categorias || [];

            const urls = categorias.map(cat => `assets/json/${cat}.json?v=${cacheBuster}`);
            const responses = await Promise.all(urls.map(url => fetch(url)));
            const dataArrays = await Promise.all(responses.map(res => res.json()));
            
            const catalogoCompleto = dataArrays.flatMap(data => data.catalogo || []);
            
            productoActual = catalogoCompleto.find(p => p.id === productId);

            if (productoActual) {
                document.getElementById('loading-state').style.display = 'none';
                document.getElementById('product-container').style.display = 'flex';
                inicializarInterfaz();
            } else {
                mostrarError("Producto no encontrado en el catálogo.");
            }

        } catch (error) {
            console.error("Error:", error);
            mostrarError("Error al cargar la información.");
        }
    }

    function mostrarError(mensaje) {
        document.getElementById('loading-state').style.display = 'none';
        const errorDiv = document.getElementById('error-state');
        errorDiv.style.display = 'block';
        errorDiv.innerText = mensaje;
    }

    // ==========================================
    // FUNCIÓN PARA ACTUALIZAR EL ENLACE EN VIVO
    // ==========================================
    function actualizarURL() {
        if (!productoActual) return;

        const tipoSeleccionado = document.querySelector('input[name="detail-tipo"]:checked');
        const tipo = tipoSeleccionado ? tipoSeleccionado.value : '';

        const tallaSeleccionada = document.querySelector('input[name="detail-talla"]:checked');
        const talla = tallaSeleccionada ? tallaSeleccionada.value : '';

        const colorSeleccionado = document.querySelector('input[name="detail-color"]:checked');
        const color = colorSeleccionado ? colorSeleccionado.value : 0; 

        const url = new URL(window.location);
        url.searchParams.set('id', productoActual.id);
        if (tipo) url.searchParams.set('tipo', tipo);
        if (color !== '') url.searchParams.set('color', color);
        if (talla) url.searchParams.set('talla', talla);

        // Modifica la barra de direcciones de forma silenciosa
        window.history.replaceState({}, '', url);
    }

    function inicializarInterfaz() {
        document.getElementById('detail-title').innerText = productoActual.titulo;
        document.getElementById('detail-ref').innerText = `REF: ${productoActual.id}`;
        document.getElementById('desc-diseno').innerText = productoActual.descripcion_diseno;

        const tiposDisponibles = Object.keys(productoActual.variaciones);
        if (tiposDisponibles.length === 0) return;

        let tipoInicial = tiposDisponibles[0];
        if (urlTipo && tiposDisponibles.includes(urlTipo)) {
            tipoInicial = urlTipo;
        }

        // ----- INYECCIÓN DE ANALÍTICAS GTM -----
        if (typeof window.rastrearVerProducto === 'function') {
            window.rastrearVerProducto(productoActual.id, productoActual.titulo, tipoInicial);
        }

        let tiposHtml = '';
        tiposDisponibles.forEach((tipo) => {
            const tipoCapitalizado = tipo.charAt(0).toUpperCase() + tipo.slice(1);
            const isChecked = tipo === tipoInicial ? 'checked' : '';
            tiposHtml += `
                <input type="radio" id="dtipo-${tipo}" name="detail-tipo" value="${tipo}" class="hidden-selector" ${isChecked}>
                <label for="dtipo-${tipo}" class="type-badge">${tipoCapitalizado}</label>
            `;
        });
        document.getElementById('detail-types').innerHTML = tiposHtml;

        document.querySelectorAll('input[name="detail-tipo"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                actualizarVistaVariacion(e.target.value, false);
                actualizarURL();
            });
        });

        actualizarVistaVariacion(tipoInicial, true);
    }

    function actualizarVistaVariacion(tipoPrenda, esCargaInicial = false) {
        const detallesVariacion = productoActual.variaciones[tipoPrenda];
        if(!detallesVariacion) return;

        const formatoMoneda = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
        const precios = detallesVariacion.precios_y_descuentos;
        
        let htmlPrecio = '';
        if (precios.tiene_descuento) {
            htmlPrecio = `
                <span class="price-final">${formatoMoneda.format(precios.precio_final)}</span>
                <span class="price-regular">${formatoMoneda.format(precios.precio_regular)}</span>
                <span class="discount-badge">${precios.texto_badge}</span>
            `;
        } else {
            htmlPrecio = `<span class="price-final">${formatoMoneda.format(precios.precio_regular)}</span>`;
        }
        document.getElementById('detail-price').innerHTML = htmlPrecio;

        let tallasHtml = '';
        detallesVariacion.tallas_disponibles.forEach((talla, index) => {
            let isChecked = index === 0 ? 'checked' : '';
            if (esCargaInicial && urlTalla && detallesVariacion.tallas_disponibles.includes(urlTalla)) {
                isChecked = talla === urlTalla ? 'checked' : '';
            }

            tallasHtml += `
                <input type="radio" id="dtalla-${talla}" name="detail-talla" value="${talla}" class="hidden-selector" ${isChecked}>
                <label for="dtalla-${talla}" class="size-badge">${talla}</label>
            `;
        });
        document.getElementById('detail-sizes').innerHTML = tallasHtml;

        document.querySelectorAll('input[name="detail-talla"]').forEach(radio => {
            radio.addEventListener('change', () => actualizarURL());
        });

        let coloresHtml = '';
        detallesVariacion.colores_disponibles.forEach((color, index) => {
            let isChecked = index === 0 ? 'checked' : '';
            if (esCargaInicial && urlColor && parseInt(urlColor) < detallesVariacion.colores_disponibles.length) {
                isChecked = index === parseInt(urlColor) ? 'checked' : '';
            }

            coloresHtml += `
                <input type="radio" id="dcolor-${index}" name="detail-color" value="${index}" class="hidden-selector" ${isChecked}>
                <label for="dcolor-${index}" class="color-box" style="background-color: ${color.codigo_hex};" title="${color.nombre}"></label>
            `;
        });
        document.getElementById('detail-colors').innerHTML = coloresHtml;

        document.querySelectorAll('input[name="detail-color"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const colorSeleccionado = detallesVariacion.colores_disponibles[e.target.value];
                document.getElementById('color-label-name').innerText = colorSeleccionado.nombre;
                actualizarGaleria(colorSeleccionado.imagenes);
                actualizarURL(); 
            });
        });

        if(detallesVariacion.detalles) {
            document.getElementById('desc-prenda').innerText = detallesVariacion.detalles.descripcion_producto;
            document.getElementById('care-prenda').innerText = detallesVariacion.detalles.cuidado_prenda;
            document.getElementById('policy-prenda').innerText = detallesVariacion.detalles.politica_envios_devoluciones;
        }

        if(detallesVariacion.guia_de_tallas) {
            document.getElementById('modal-garment-type').innerText = `Silueta: ${tipoPrenda.toUpperCase()}`;
            document.getElementById('modal-guide-img').src = detallesVariacion.guia_de_tallas.imagen_guia;
        }

        const colorInputChecked = document.querySelector('input[name="detail-color"]:checked');
        if (colorInputChecked) {
            colorInputChecked.dispatchEvent(new Event('change'));
        }
        
        actualizarURL();
    }

    function actualizarGaleria(imagenes) {
        const contenedorThumbnails = document.getElementById('gallery-thumbnails');
        const mainImage = document.getElementById('main-image');

        if(imagenes.length === 0) return;

        mainImage.src = imagenes[0];

        let thumbsHtml = '';
        imagenes.forEach((img, index) => {
            thumbsHtml += `<img src="${img}" class="thumb-img ${index === 0 ? 'active' : ''}" data-index="${index}" alt="miniatura">`;
        });
        contenedorThumbnails.innerHTML = thumbsHtml;

        document.querySelectorAll('.thumb-img').forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                mainImage.src = e.target.src;
                document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    const qtyInput = document.getElementById('qty-input');
    document.getElementById('qty-minus').addEventListener('click', () => {
        let current = parseInt(qtyInput.value);
        if(current > 1) qtyInput.value = current - 1;
    });
    document.getElementById('qty-plus').addEventListener('click', () => {
        let current = parseInt(qtyInput.value);
        qtyInput.value = current + 1;
    });

    const modal = document.getElementById('size-modal');
    const btnOpenModal = document.getElementById('btn-size-guide');
    const btnCloseModal = document.getElementById('close-modal');

    btnOpenModal.addEventListener('click', () => modal.classList.remove('hidden'));
    btnCloseModal.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (e) => {
        if(e.target === modal) modal.classList.add('hidden');
    });

    // ==========================================
    // AGREGAR AL CARRITO DE COMPRAS
    // ==========================================
    const btnAddCart = document.getElementById('btn-add-cart');

    btnAddCart.addEventListener('click', (e) => {
        if (!productoActual) return;

        let tipoSeleccionado = document.querySelector('input[name="detail-tipo"]:checked') || document.querySelector('input[name="detail-tipo"]');
        const tipo = tipoSeleccionado ? tipoSeleccionado.value : 'No especificado';

        let tallaSeleccionada = document.querySelector('input[name="detail-talla"]:checked') || document.querySelector('input[name="detail-talla"]');
        const talla = tallaSeleccionada ? tallaSeleccionada.value : 'Única';

        let colorInputChecked = document.querySelector('input[name="detail-color"]:checked') || document.querySelector('input[name="detail-color"]');
        let colorFinal = 'Único';
        let colorIndexSaved = 0; 
        
        if (colorInputChecked && productoActual.variaciones[tipo]) {
            const indexColor = parseInt(colorInputChecked.value);
            colorIndexSaved = indexColor;
            if(!isNaN(indexColor) && productoActual.variaciones[tipo].colores_disponibles[indexColor]) {
                colorFinal = productoActual.variaciones[tipo].colores_disponibles[indexColor].nombre;
            }
        }

        const cantidad = parseInt(document.getElementById('qty-input').value);
        
        const preciosVariante = productoActual.variaciones[tipo].precios_y_descuentos;
        const precioAplicable = preciosVariante.tiene_descuento ? preciosVariante.precio_final : preciosVariante.precio_regular;
        const imagenPrincipal = document.getElementById('main-image').src;

        const nuevoItem = {
            id: productoActual.id,
            titulo: productoActual.titulo,
            tipo: tipo,
            talla: talla,
            color: colorFinal,
            colorIndex: colorIndexSaved, 
            precio: precioAplicable,
            cantidad: cantidad,
            imagen: imagenPrincipal
        };

        // ----- INYECCIÓN DE ANALÍTICAS GTM -----
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
            window.animarIconoCarrito(e);
        }
    });

    // ==========================================
    // COMPRAR AHORA (WHATSAPP)
    // ==========================================
    const btnBuyNow = document.getElementById('btn-buy-now');
    const numeroWhatsApp = "573002535381"; 

    btnBuyNow.addEventListener('click', () => {
        if (!productoActual) return;

        const titulo = productoActual.titulo;
        const referencia = productoActual.id;
        const cantidad = document.getElementById('qty-input').value;

        const tipoSeleccionado = document.querySelector('input[name="detail-tipo"]:checked') || document.querySelector('input[name="detail-tipo"]');
        const tipo = tipoSeleccionado ? tipoSeleccionado.value : 'No especificado';

        const tallaSeleccionada = document.querySelector('input[name="detail-talla"]:checked') || document.querySelector('input[name="detail-talla"]');
        const talla = tallaSeleccionada ? tallaSeleccionada.value : 'Única';

        const color = document.getElementById('color-label-name').innerText || 'No especificado';
        
        // Ahora window.location.href SIEMPRE tendrá la URL actualizada
        const linkProducto = window.location.href; 

        // ----- INYECCIÓN DE ANALÍTICAS GTM -----
        const preciosVariante = productoActual.variaciones[tipo].precios_y_descuentos;
        const precioAplicable = preciosVariante.tiene_descuento ? preciosVariante.precio_final : preciosVariante.precio_regular;
        
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ ecommerce: null }); 
        window.dataLayer.push({
            event: 'begin_checkout', 
            ecommerce: {
                currency: 'COP',
                value: precioAplicable * parseInt(cantidad),
                items: [{
                    item_id: referencia,
                    item_name: titulo,
                    item_category: tipo,
                    item_variant: color,
                    price: precioAplicable,
                    quantity: parseInt(cantidad),
                    item_size: talla
                }]
            }
        });

        const mensaje = `¡Hola RubenzDazs! 🔥 Estoy interesado en comprar directo:\n\n` +
                        `🛍️ *Producto:* ${titulo}\n` +
                        `🔖 *Referencia:* ${referencia}\n` +
                        `👕 *Tipo:* ${tipo.toUpperCase()}\n` +
                        `📏 *Talla:* ${talla}\n` +
                        `🎨 *Color:* ${color}\n` +
                        `📦 *Cantidad:* ${cantidad}\n\n` +
                        `🔗 *Enlace:* ${linkProducto}\n\n` +
                        `¿Me podrían confirmar: Costos de envio, Disponibilidad y Los métodos de pago?`;

        const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
        window.open(urlWhatsApp, '_blank');
    });

    cargarProducto();
});