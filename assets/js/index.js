document.addEventListener('DOMContentLoaded', () => {

    // =============================================
    // 🔥 1. INICIALIZAR SESIÓN DE CARRITO
    // =============================================
    const sessionId = sessionStorage.getItem('rubenzSessionId');
    if (!sessionId) {
        localStorage.removeItem('rubenzCart');
        sessionStorage.setItem('rubenzSessionId', Date.now().toString());
        console.log('🔄 Nueva sesión - Carrito reiniciado');
    }

    // =============================================
    // 🔥 2. LÓGICA UI DE MENÚS Y CARRITO
    // =============================================
    const menuBtn = document.getElementById('menu-btn');
    const cartBtn = document.getElementById('cart-btn');
    const mainNav = document.getElementById('main-nav-menu');
    const cartNav = document.getElementById('cart-nav-menu');
    const closeNav = document.getElementById('close-nav');
    const closeCart = document.getElementById('close-cart');

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

    // =============================================
    // 🔥 3. GENERACIÓN DINÁMICA DEL MENÚ (GLOBAL)
    // =============================================
    const menuCategorias = document.getElementById('lista-categorias-menu');
    
    if (menuCategorias) {
        // LISTA MANUAL DE PRENDAS PARA EL MENÚ GLOBAL
        // Cuando saques un nuevo tipo de producto (ej: "hoodie"), lo agregas aquí.
        const prendasMenu = ["oversize", "croptop"]; 
        
        const esPaginaColeccion = window.location.pathname.includes('collection.html');
        const urlParams = new URLSearchParams(window.location.search);
        const prendaActiva = urlParams.get('prenda') || 'todos';

        let menuHtml = '<ul class="menu-items" style="list-style: none; padding: 0; margin: 0;">';
        
        // Generar botones de prendas iterando sobre la lista manual
        prendasMenu.forEach(prenda => {
            const prendaCap = prenda.charAt(0).toUpperCase() + prenda.slice(1);
            const isActive = (prendaActiva === prenda) ? 'active' : '';

            if (esPaginaColeccion) {
                // En la tienda: Filtra en vivo (JS)
                menuHtml += `<li style="margin: 15px 0;">
                                <a href="#" class="menu-prenda-link ${isActive}" onclick="cambiarFiltroPrenda(event, '${prenda}', this)">${prendaCap}</a>
                             </li>`;
            } else {
                // En otras páginas (index, rubenzlab): Navega a la tienda
                menuHtml += `<li style="margin: 15px 0;">
                                <a href="collection.html?prenda=${encodeURIComponent(prenda)}" class="menu-prenda-link">${prendaCap}</a>
                             </li>`;
            }
        });
        
        // Botón "TODAS LAS PRENDAS"
        const isTodosActive = (prendaActiva === 'todos') ? 'active' : '';
        if (esPaginaColeccion) {
            menuHtml += `<li style="margin-top: 25px; border-top: 2px solid #fff; padding-top: 15px;">
                            <a href="#" class="menu-prenda-link ${isTodosActive}" onclick="cambiarFiltroPrenda(event, 'todos', this)">TODAS LAS PRENDAS</a>
                         </li>`;
        } else {
            menuHtml += `<li style="margin-top: 25px; border-top: 2px solid #fff; padding-top: 15px;">
                            <a href="collection.html?prenda=todos" class="menu-prenda-link">TODAS LAS PRENDAS</a>
                         </li>`;
        }
        
        menuHtml += '</ul>';
        menuCategorias.innerHTML = menuHtml;
    }

    // =============================================
    // 🔥 4. RESPALDO Y PERSISTENCIA DEL CARRITO
    // =============================================
    function guardarCopiaEnSesion() {
        const carrito = JSON.parse(localStorage.getItem('rubenzCart')) || [];
        sessionStorage.setItem('rubenzCartBackup', JSON.stringify(carrito));
    }

    function recuperarCarritoDeSesion() {
        const carritoLocal = localStorage.getItem('rubenzCart');
        if (!carritoLocal) {
            const carritoBackup = sessionStorage.getItem('rubenzCartBackup');
            if (carritoBackup) {
                localStorage.setItem('rubenzCart', carritoBackup);
                console.log('♻️ Carrito recuperado de sessionStorage');
            }
        }
    }

    recuperarCarritoDeSesion();

    // =============================================
    // 🔥 5. FUNCIONALIDAD PRINCIPAL DEL CARRITO
    // =============================================
    const formatoMoneda = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
    let destinoEnvio = 'bogota';

    window.actualizarCarritoGlobal = function() {
        renderizarCarrito(); 
        guardarCopiaEnSesion(); 
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
            guardarCopiaEnSesion();
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

    // =============================================
    // 🔥 6. ENVÍO DE PEDIDO A WHATSAPP
    // =============================================
    window.enviarPedidoWhatsApp = function(totalFinal, costoEnvio) {
        let carrito = JSON.parse(localStorage.getItem('rubenzCart')) || [];
        const numeroWhatsApp = "573002535381";

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
    };
    
    renderizarCarrito();

    // =============================================
    // 🔥 7. POPUP RUBENZLAB (AISLADO Y SEGURO)
    // =============================================
    const popup = document.getElementById('lab-popup');
    const closeBtn = document.getElementById('close-lab-popup');

    if (popup && closeBtn) {
        const popupMostrado = sessionStorage.getItem('rubenzLabVisto');

        if (!popupMostrado) {
            setTimeout(() => {
                popup.classList.add('show-popup');
            }, 1500); 
        }

        closeBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            e.stopPropagation(); 
            
            popup.style.display = 'none';
            sessionStorage.setItem('rubenzLabVisto', 'true');
        });
    }

});



/* ==========================================================================
   CONTROL DE ANIMACIONES DE REDES SOCIALES
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const botonesSociales = document.querySelectorAll('.box-socialmedia a');
    const TIEMPO_ESPERA = 300; 

    botonesSociales.forEach(boton => {
        boton.addEventListener('click', function(evento) {
            const urlDestino = this.getAttribute('href');
            const destinoTarget = this.getAttribute('target');
            
            if (urlDestino && urlDestino !== '#' && urlDestino !== '') {
                evento.preventDefault(); 
                
                this.classList.add('animacion-en-progreso');
                
                setTimeout(() => {
                    this.classList.remove('animacion-en-progreso');
                    this.blur(); 
                    
                    if (destinoTarget === '_blank') {
                        window.open(urlDestino, '_blank');
                    } else {
                        window.location.href = urlDestino;
                    }
                }, TIEMPO_ESPERA); 
            }
        });
    });
});

window.addEventListener('pageshow', (evento) => {
    if (evento.persisted) {
        document.querySelectorAll('.box-socialmedia a').forEach(boton => {
            boton.classList.remove('animacion-en-progreso');
            boton.blur(); 
        });
    }
});

const botonesSocialesMovil = document.querySelectorAll('.box-socialmedia a');

botonesSocialesMovil.forEach(boton => {
    boton.addEventListener('touchstart', function() {
        this.classList.add('efecto-forzado');
    }, { passive: true });

    boton.addEventListener('touchmove', function() {
        this.classList.remove('efecto-forzado');
    }, { passive: true });

    boton.addEventListener('touchend', function() {
        this.classList.remove('efecto-forzado');
    });
    boton.addEventListener('touchcancel', function() {
        this.classList.remove('efecto-forzado');
    });

    boton.addEventListener('click', function(e) {
        if (this.target !== '_blank' && this.href) {
            e.preventDefault(); 
            const destino = this.href;
            
            this.classList.add('efecto-forzado');
            
            setTimeout(() => {
                this.classList.remove('efecto-forzado'); 
                window.location.href = destino; 
            }, 100);
        }
    });
});