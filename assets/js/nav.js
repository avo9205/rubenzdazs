// ==========================================
// nav.js - Lógica de Menús y UI
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
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
            
            // Forzar actualización visual del carrito al abrir el menú lateral
            if(typeof window.actualizarCarritoGlobal === 'function') {
                window.actualizarCarritoGlobal();
            }
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
});