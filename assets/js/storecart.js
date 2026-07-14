// ==========================================
// carrito.js - Lógica global del carrito
// ==========================================

// 1. FUNCIONES DE MEMORIA (sessionStorage)
window.obtenerCarritoSeguro = function() {
    try {
        const dataRaw = sessionStorage.getItem('rubenzCart');
        if (!dataRaw) return []; 
        
        const datosGuardados = JSON.parse(dataRaw);
        
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

// 2. FUNCIONES PARA RENDERIZAR Y ACTUALIZAR
window.actualizarCarritoGlobal = function() {
    let carrito = window.obtenerCarritoSeguro(); 
    
    const cartContainer = document.querySelector('.cart-items');
    const cartBadge = document.getElementById('cart-count');
    const formatoMoneda = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
    
    // Actualizar la bolita roja con el número
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

    // Envío y totales
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

// 3. FUNCIONES DE BOTONES (Sumar, restar, borrar, envío)
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

// Cuando el documento carga, mostramos el carrito para que se pinte el numerito
document.addEventListener('DOMContentLoaded', () => {
    window.actualizarCarritoGlobal();
});