document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // 🔥 INICIALIZAR SESIÓN DE CARRITO
    // =============================================
    function inicializarSesionCarrito() {
        const sessionId = sessionStorage.getItem('rubenzSessionId');
        
        if (!sessionId) {
            // Nueva sesión - Limpiar carrito antiguo
            localStorage.removeItem('rubenzCart');
            sessionStorage.setItem('rubenzSessionId', Date.now().toString());
            console.log('🔄 Nueva sesión - Carrito reiniciado');
        }
    }
    
    inicializarSesionCarrito();

    const menuBtn = document.getElementById('menu-btn');
    const cartBtn = document.getElementById('cart-btn');
    const mainNav = document.getElementById('main-nav-menu');
    const cartNav = document.getElementById('cart-nav-menu');
    const closeNav = document.getElementById('close-nav');
    const closeCart = document.getElementById('close-cart');

    // GENERACIÓN DINÁMICA DEL MENÚ
    const menuCategorias = document.querySelector('#main-nav-menu .menu-items');
    
    if (menuCategorias) {
        const cacheBuster = new Date().getTime();
        fetch(`assets/json/categorias_index.json?v=${cacheBuster}`)
            .then(res => res.json())
            .then(data => {
                const categorias = data.categorias || [];
                let menuHtml = '';
                
                categorias.forEach(tipo => {
                    const tipoCapitalizado = tipo.charAt(0).toUpperCase() + tipo.slice(1);
                    menuHtml += `<li><a href="collection.html?categoria=${tipo}">${tipoCapitalizado}</a></li>`;
                });
                
                menuHtml += `<li style="margin-top: 15px; border-top: 2px solid #fff; padding-top: 10px;">
                                <a href="collection.html?categoria=todos">Ver Todo</a>
                             </li>`;
                
                menuCategorias.innerHTML = menuHtml;
            })
            .catch(error => console.error('Error cargando el menú:', error));
    }
    
    // LÓGICA UI DE MENÚS
    let navTimeout;
    const isDesktop = () => window.matchMedia("(min-width: 992px) and (hover: hover) and (pointer: fine)").matches;

    const updateButtonStates = () => {
        if(menuBtn && mainNav) menuBtn.classList.toggle('is-active', mainNav.classList.contains('show'));
        if(cartBtn && cartNav) cartBtn.classList.toggle('is-active', cartNav.classList.contains('show'));
    };

    if(menuBtn) {
        menuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            mainNav.classList.toggle('show');
            cartNav.classList.remove('show');
            updateButtonStates();
        });
    }

    if(cartBtn) {
        cartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            cartNav.classList.toggle('show'); 
            mainNav.classList.remove('show');
            updateButtonStates();
        });
    }

    if(closeNav) {
        closeNav.addEventListener('click', (e) => {
            e.preventDefault();
            mainNav.classList.remove('show');
            updateButtonStates();
        });
    }

    if(closeCart) {
        closeCart.addEventListener('click', (e) => {
            e.preventDefault();
            cartNav.classList.remove('show');
            updateButtonStates();
        });
    }

    // ==========================================
    // 🗑️ LIMPIAR CARRITO AL CERRAR LA PÁGINA
    // ==========================================
    function limpiarCarritoAlSalir() {
        // Opción 1: Limpiar cuando se cierra la pestaña/navegador
        window.addEventListener('beforeunload', function() {
            localStorage.removeItem('rubenzCart');
            console.log('🧹 Carrito limpiado al salir de la página');
        });

        // Opción 2: Limpiar cuando se recarga la página (opcional)
        // Descomentar si quieres que se borre también al recargar
        /*
        window.addEventListener('unload', function() {
            localStorage.removeItem('rubenzCart');
        });
        */
    }

    limpiarCarritoAlSalir();

    // ==========================================
    // 🛒 USAR sessionStorage como respaldo (opcional)
    // ==========================================
    // Esta función guarda una copia del carrito en sessionStorage
    // para recuperarlo si la página se recarga accidentalmente
    function guardarCopiaEnSesion() {
        const carrito = JSON.parse(localStorage.getItem('rubenzCart')) || [];
        if (carrito.length > 0) {
            sessionStorage.setItem('rubenzCartBackup', JSON.stringify(carrito));
        }
    }

    // Recuperar carrito de sessionStorage si localStorage está vacío
    function recuperarCarritoDeSesion() {
        const carritoLocal = localStorage.getItem('rubenzCart');
        if (!carritoLocal || carritoLocal === '[]') {
            const carritoBackup = sessionStorage.getItem('rubenzCartBackup');
            if (carritoBackup) {
                localStorage.setItem('rubenzCart', carritoBackup);
                sessionStorage.removeItem('rubenzCartBackup');
                console.log('♻️ Carrito recuperado de sessionStorage');
            }
        }
    }

    // Ejecutar recuperación al cargar la página
    recuperarCarritoDeSesion();

    // ==========================================
    // LÓGICA DEL CARRITO DE COMPRAS
    // ==========================================
    const formatoMoneda = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
    let destinoEnvio = 'bogota';

    window.actualizarCarritoGlobal = function() {
        renderizarCarrito(); 
        guardarCopiaEnSesion(); // Guardar copia de seguridad
    };

    function renderizarCarrito() {
        let carrito = JSON.parse(localStorage.getItem('rubenzCart')) || [];
        
        const cartContainer = document.querySelector('.cart-items');
        const cartBadge = document.getElementById('cart-count');
        
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        if (cartBadge) cartBadge.innerText = totalItems;

        if(!cartContainer) return;

        if (carrito.length === 0) {
            cartContainer.innerHTML = `
                <p style="text-align:center; margin-top: 50px;">Tu carrito está vacío.</p>
                <button class="btn-brutalist btn-close-cart-mobile" onclick="cerrarCarritoManual()" style="margin-top: 20px;">Seguir Comprando</button>
            `;
            return;
        }

        let cartHtml = `<div class="cart-product-list">`;
        let subtotal = 0;

        carrito.forEach((item, index) => {
            const itemTotal = item.precio * item.cantidad;
            subtotal += itemTotal;

            cartHtml += `
                <div class="cart-item">
                    <img src="${item.imagen}" alt="${item.titulo}" class="cart-item-img">
                    <div class="cart-item-content">
                        
                        <div class="cart-item-desc">
                            <h4>${item.titulo}</h4>
                            <p class="cart-item-vars">
                                <strong>${item.tipo.toUpperCase()}</strong> | T: <strong>${item.talla}</strong> | C: <strong>${item.color}</strong>
                            </p>
                            <p class="cart-item-price">${formatoMoneda.format(item.precio)}</p>
                        </div>

                        <div class="cart-item-actions">
                            <div class="cart-qty-controls">
                                <button onclick="cambiarCantidad(${index}, -1)">-</button>
                                <span>${item.cantidad}</span>
                                <button onclick="cambiarCantidad(${index}, 1)">+</button>
                            </div>
                            <button class="cart-item-remove" onclick="eliminarDelCarrito(${index})">X</button>
                        </div>
                        
                    </div>
                </div>
            `;
        });
        cartHtml += `</div>`;

        let costoEnvio = 0;
        let textoEnvio = "";
        
        if (subtotal >= 150000) {
            costoEnvio = 0;
            textoEnvio = "¡ENVÍO GRATIS!";
        } else {
            costoEnvio = destinoEnvio === 'bogota' ? 8000 : 12000;
            textoEnvio = formatoMoneda.format(costoEnvio);
        }

        const totalFinal = subtotal + costoEnvio;

        cartHtml += `
            <div class="cart-summary">
                <div class="shipping-selector">
                    <label>📍 Destino de envío:</label>
                    <select id="shipping-select" onchange="cambiarDestino(this.value)">
                        <option value="bogota" ${destinoEnvio === 'bogota' ? 'selected' : ''}>Bogotá ($8.000)</option>
                        <option value="fuera" ${destinoEnvio === 'fuera' ? 'selected' : ''}>Fuera de Bogotá ($12.000)</option>
                    </select>
                    <p style="font-size: 0.7rem; color: #ffea00; margin-top: 5px;">* Envío gratis por compras mayores a $150.000 COP</p>
                </div>
                
                <div class="cart-totals">
                    <p>Subtotal: <span>${formatoMoneda.format(subtotal)}</span></p>
                    <p>Envío: <span>${textoEnvio}</span></p>
                    <h3 class="total-final">TOTAL: <span>${formatoMoneda.format(totalFinal)}</span></h3>
                </div>

                <div class="cart-action-buttons">
                <button class="btn-brutalist btn-checkout-wa" onclick="enviarPedidoWhatsApp(${totalFinal}, ${costoEnvio})">
                    <img src="assets/img/iconos/whatsapp.png" alt="WA" style="width: 30px; margin-right: 8px;">
                    Confirmar Pedido
                </button>
                <button class="btn-brutalist btn-close-cart-mobile" onclick="cerrarCarritoManual()">
                    Seguir Comprando
                </button>
            </div>
            </div>
        `;

        cartContainer.innerHTML = cartHtml;
        
        // Guardar copia en sessionStorage después de renderizar
        guardarCopiaEnSesion();
    }

    window.cambiarCantidad = function(index, delta) {
        let carrito = JSON.parse(localStorage.getItem('rubenzCart')) || []; 
        carrito[index].cantidad += delta;
        if (carrito[index].cantidad <= 0) {
            carrito.splice(index, 1);
        }
        localStorage.setItem('rubenzCart', JSON.stringify(carrito)); 
        renderizarCarrito(); 
    };

    window.eliminarDelCarrito = function(index) {
        let carrito = JSON.parse(localStorage.getItem('rubenzCart')) || []; 
        carrito.splice(index, 1);
        localStorage.setItem('rubenzCart', JSON.stringify(carrito)); 
        renderizarCarrito(); 
    };

    window.cambiarDestino = function(valor) {
        destinoEnvio = valor;
        renderizarCarrito();
    };

    window.cerrarCarritoManual = function() {
        if(cartNav) cartNav.classList.remove('show');
        if(cartBtn) cartBtn.classList.remove('is-active');
    };

    // ANIMACIÓN BURBUJA Y GIF AL AÑADIR
    let animacionCarritoTimeout;
    
    window.animarIconoCarrito = function(event) {
        const cartIcon = document.getElementById('cart-btn');
        if(!cartIcon) return;

        if(!event) {
            activarGifCarrito(cartIcon);
            return;
        }

        const bubble = document.createElement('div');
        bubble.classList.add('flying-bubble');
        document.body.appendChild(bubble);

        const startX = event.clientX;
        const startY = event.clientY;
        bubble.style.left = `${startX}px`;
        bubble.style.top = `${startY}px`;

        void bubble.offsetWidth;

        const cartRect = cartIcon.getBoundingClientRect();
        const endX = cartRect.left + cartRect.width / 2;
        const endY = cartRect.top + cartRect.height / 2;

        bubble.style.left = `${endX}px`;
        bubble.style.top = `${endY}px`;
        bubble.style.transform = 'translate(-50%, -50%) scale(0.2)';
        bubble.style.opacity = '0';

        setTimeout(() => {
            bubble.remove();
            activarGifCarrito(cartIcon);
        }, 600);
    };

    function activarGifCarrito(cartIcon) {
        cartIcon.classList.add('cart-added');
        clearTimeout(animacionCarritoTimeout);
        animacionCarritoTimeout = setTimeout(() => {
            cartIcon.classList.remove('cart-added');
        }, 2000);
    }

    // ==========================================
    // ENVÍO DE PEDIDO A WHATSAPP
    // ==========================================
    window.enviarPedidoWhatsApp = function(totalFinal, costoEnvio) {
        let carrito = JSON.parse(localStorage.getItem('rubenzCart')) || [];
        const numeroWhatsApp = "573002535381";

        // --- INYECCIÓN DE ANALÍTICAS GTM ---
        if (carrito.length > 0) {
            let itemsAnalytics = carrito.map(item => ({
                item_id: item.id,
                item_name: item.titulo,
                item_category: item.tipo,
                item_variant: item.color,
                price: item.precio,
                quantity: item.cantidad,
                item_size: item.talla
            }));

            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ ecommerce: null });
            window.dataLayer.push({
                event: 'begin_checkout',
                ecommerce: {
                    currency: 'COP',
                    value: totalFinal,
                    items: itemsAnalytics
                }
            });
        }
        // ---------------------------------------------------------------

        let mensaje = `¡Hola RubenzDazs! 🔥 Vengo del carrito de compras y quiero confirmar el siguiente pedido:\n\n`;

        const dominioBase = window.location.origin;
        let rutaBaseUrl = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
        const urlSitio = dominioBase + rutaBaseUrl;

        carrito.forEach((item) => {
            const colorIndex = item.colorIndex !== undefined ? item.colorIndex : 0;
            
            const enlaceProducto = `${urlSitio}/detalle_producto.html?id=${item.id}&tipo=${encodeURIComponent(item.tipo)}&color=${colorIndex}&talla=${encodeURIComponent(item.talla)}`;

            mensaje += `🛍️ *Producto:* ${item.titulo}\n`;
            mensaje += `🔖 *Referencia:* ${item.id}\n`;
            mensaje += `👕 *Tipo:* ${item.tipo.toUpperCase()}\n`;
            mensaje += `📏 *Talla:* ${item.talla}\n`;
            mensaje += `🎨 *Color:* ${item.color}\n`;
            mensaje += `📦 *Cantidad:* ${item.cantidad}\n`;
            mensaje += `💵 *Precio Unitario:* ${formatoMoneda.format(item.precio)}\n`;
            mensaje += `🔗 *Enlace:* ${enlaceProducto}\n`;
            mensaje += `---------------------------\n`;
        });

        const zonaEnvio = destinoEnvio === 'bogota' ? 'Bogotá' : 'Nacional';
        const textoEnvio = costoEnvio === 0 ? '¡GRATIS!' : formatoMoneda.format(costoEnvio);

        mensaje += `\n📍 *Envío a:* ${zonaEnvio} (${textoEnvio})\n`;
        mensaje += `💰 *TOTAL A PAGAR:* ${formatoMoneda.format(totalFinal)}\n\n`;
        mensaje += `¿Me podrían confirmar: Costos de envio, Disponibilidad y Los métodos de pago?`;

        const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
        window.open(urlWhatsApp, '_blank');
        
        // Opcional: Limpiar el carrito después de enviar el pedido
        // localStorage.removeItem('rubenzCart');
        // renderizarCarrito();
    };
    
    renderizarCarrito();
});