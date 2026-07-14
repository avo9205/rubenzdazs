// ==========================================
// carrito.js - Lógica global del carrito
// ==========================================

// 1. DESTRUIR MEMORIA VIEJA
// Esto asegura que se borre cualquier carrito trabado en la memoria permanente del navegador
localStorage.removeItem('rubenzCart'); 

// 2. FUNCIONES DE MEMORIA SEGURA (sessionStorage)
window.obtenerCarritoSeguro = function() {
    try {
        const dataRaw = sessionStorage.getItem('rubenzCart');
        if (!dataRaw) return []; 
        
        const datosGuardados = JSON.parse(dataRaw);
        
        // Si la data está corrupta o no es un array, se formatea
        if (!datosGuardados || !Array.isArray(datosGuardados.items)) {
            sessionStorage.removeItem('rubenzCart'); 
            return [];
        }
        return datosGuardados.items;
    } catch (error) {
        console.error("Error leyendo el carrito:", error);
        sessionStorage.removeItem('rubenzCart');
        return [];
    }
};

window.guardarCarritoSeguro = function(carritoArray) {
    try {
        sessionStorage.setItem('rubenzCart', JSON.stringify({ items: carritoArray }));
    } catch (error) {
        console.error("No se pudo guardar el carrito:", error);
    }
};

// 3. RENDERIZADO DEL CARRITO VISUAL
window.actualizarCarritoGlobal = function() {
    let carrito = window.obtenerCarritoSeguro(); 
    
    const cartContainer = document.querySelector('.cart-items');
    const cartBadge = document.getElementById('cart-count');
    const formatoMoneda = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
    
    // Actualizar la bolita amarilla
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

        const tipoTexto = item.tipo ? item.tipo.toUpperCase() : '';

        cartHtml += `
            <div class="cart-item">
                <img src="${item.imagen}" alt="${item.titulo}" class="cart-item-img">
                <div class="cart-item-content">
                    <div class="cart-item-desc">
                        <h4>${item.titulo}</h4>
                        <p class="cart-item-vars">
                            <strong>${tipoTexto}</strong> | T: <strong>${item.talla}</strong> | C: <strong>${item.color}</strong>
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

    // Costos de envío y totales
    let destinoEnvio = window.destinoEnvioActual || 'bogota';
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
};

// 4. FUNCIONES DE BOTONES
window.cambiarCantidad = function(index, delta) {
    let carrito = window.obtenerCarritoSeguro(); 
    carrito[index].cantidad += delta;
    if (carrito[index].cantidad <= 0) carrito.splice(index, 1);
    window.guardarCarritoSeguro(carrito); 
    window.actualizarCarritoGlobal(); 
};

window.eliminarDelCarrito = function(index) {
    let carrito = window.obtenerCarritoSeguro(); 
    carrito.splice(index, 1);
    window.guardarCarritoSeguro(carrito); 
    window.actualizarCarritoGlobal(); 
};

window.cambiarDestino = function(valor) {
    window.destinoEnvioActual = valor;
    window.actualizarCarritoGlobal();
};

window.cerrarCarritoManual = function() {
    const cartNav = document.getElementById('cart-nav-menu');
    const cartBtn = document.getElementById('cart-btn');
    if(cartNav) cartNav.classList.remove('show');
    if(cartBtn) cartBtn.classList.remove('is-active');
};

// 5. ENVÍO DE PEDIDO A WHATSAPP
window.enviarPedidoWhatsApp = function(totalFinal, costoEnvio) {
    let carrito = window.obtenerCarritoSeguro(); 
    const numeroWhatsApp = "573002535381"; 
    const formatoMoneda = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
    
    // --- INYECCIÓN DE ANALÍTICAS GTM ---
    if (carrito.length > 0 && typeof window.dataLayer !== 'undefined') {
        let itemsAnalytics = carrito.map(item => ({
            item_id: item.id,
            item_name: item.titulo,
            item_category: item.tipo,
            item_variant: item.color,
            price: item.precio,
            quantity: item.cantidad,
            item_size: item.talla
        }));

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
    
    carrito.forEach((item, index) => {
        mensaje += `🛍️ *Item ${index + 1}:* ${item.titulo}\n`;
        mensaje += `🔖 *Ref:* ${item.id}\n`;
        mensaje += `👕 *Variante:* ${item.tipo ? item.tipo.toUpperCase() : ''} | Talla: ${item.talla} | Color: ${item.color}\n`;
        mensaje += `📦 *Cantidad:* ${item.cantidad}\n`;
        mensaje += `💵 *Precio Unitario:* ${formatoMoneda.format(item.precio)}\n`;
        mensaje += `---------------------------\n`;
    });

    let destinoEnvio = window.destinoEnvioActual || 'bogota';
    const zonaEnvio = destinoEnvio === 'bogota' ? 'Bogotá' : 'Nacional';
    const textoEnvio = costoEnvio === 0 ? '¡GRATIS!' : formatoMoneda.format(costoEnvio);

    mensaje += `\n📍 *Envío a:* ${zonaEnvio} (${textoEnvio})\n`;
    mensaje += `💰 *TOTAL A PAGAR:* ${formatoMoneda.format(totalFinal)}\n\n`;
    mensaje += `¿Me indican los métodos de pago disponibles?`;

    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');
};

// 6. ANIMACIÓN DE AÑADIR AL CARRITO (Burbuja voladora)
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

// 7. INICIALIZAR CARRITO AL CARGAR LA PÁGINA
document.addEventListener('DOMContentLoaded', () => {
    window.actualizarCarritoGlobal();
});