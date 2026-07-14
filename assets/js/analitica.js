// analytics.js - Archivo centralizado de Google Tag Manager para Rubenz Dazs

// 1. Inyectar el script principal de GTM dinámicamente
(function(w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', 'GTM-PBFKSNZ8'); // Tu ID de GTM

// 2. Inicializar la Capa de Datos (DataLayer)
window.dataLayer = window.dataLayer || [];

// 3. Función: Añadir al carrito (add_to_cart)
window.rastrearAñadirCarrito = function(itemCarrito) {
    window.dataLayer.push({ ecommerce: null }); 
    window.dataLayer.push({
        event: 'add_to_cart', 
        ecommerce: {
            currency: 'COP', 
            value: itemCarrito.precio * itemCarrito.cantidad,
            items: [{
                item_id: itemCarrito.id,
                item_name: itemCarrito.titulo,
                item_category: itemCarrito.tipo,
                item_variant: itemCarrito.color,
                price: itemCarrito.precio,
                quantity: itemCarrito.cantidad,
                item_size: itemCarrito.talla 
            }]
        }
    });
};

// 4. Función: Ver producto (view_item)
window.rastrearVerProducto = function(id, titulo, tipo) {
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({
        event: 'view_item', 
        ecommerce: {
            currency: 'COP',
            items: [{
                item_id: id,
                item_name: titulo,
                item_category: tipo
            }]
        }
    });
};

// 5. NUEVA Función: Iniciar pago por WhatsApp (begin_checkout)
window.rastrearInicioCompra = function(itemCompra) {
    window.dataLayer.push({ ecommerce: null }); 
    window.dataLayer.push({
        event: 'begin_checkout', 
        ecommerce: {
            currency: 'COP',
            value: itemCompra.precio * itemCompra.cantidad,
            items: [{
                item_id: itemCompra.id,
                item_name: itemCompra.titulo,
                item_category: itemCompra.tipo,
                item_variant: itemCompra.color,
                price: itemCompra.precio,
                quantity: itemCompra.cantidad,
                item_size: itemCompra.talla 
            }]
        }
    });
};