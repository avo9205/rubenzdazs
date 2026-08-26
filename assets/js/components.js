// =============================================
// Archivo: assets/js/components.js
// =============================================

const headerHTML = `
    <a href="#" id="menu-btn" class="header-menu icono-interactivo">
        <img class="img-estatica" src="assets/img/iconos/menu.webp" alt="menu" width="40" height="40">
        <img class="img-animada" src="assets/img/iconos/menu.gif" alt="menu animado" width="40" height="40" loading="lazy">
    </a>
    <a href="index.html" id="home-btn" class="header-img icono-interactivo">
        <img class="img-estatica" src="assets/img/iconos/logo-red.webp" alt="logo" width="40" height="40">
        <img class="img-animada" src="assets/img/iconos/home.gif" alt="logo animado" width="40" height="40" loading="lazy">
    </a>
    <a href="rubenzlab.html" id="lab-btn" class="header-img icono-interactivo" style="position: relative; overflow: visible;">
        <img class="img-estatica" src="assets/img/iconos/lab.webp" alt="lab" width="40" height="40">
        <img class="img-animada" src="assets/img/iconos/lab.gif" alt="lab animado" width="40" height="40" loading="lazy"> 
        <div id="lab-popup" class="lab-popup-bubble">
            <span class="close-popup" id="close-lab-popup">X</span>
            ¿Quieres un diseño personalizado para darle estilo a tu vida o tu negocio? <br><b>Entra y conoce RubenzLab</b>
        </div>
    </a>
    <a href="#" id="cart-btn" class="header-cart icono-interactivo" style="position: relative;">
        <img class="img-estatica" src="assets/img/iconos/bag.webp" alt="cart" width="40" height="40">
        <img class="img-animada" src="assets/img/iconos/bag.gif" alt="cart animado" width="40" height="40" loading="lazy">   
        <span id="cart-count" style="position: absolute; top: -5px; right: -10px; background: #ffea00; color: #000; font-family: 'Courier New', Courier, monospace; font-weight: 900; border: 2px solid #000; border-radius: 50%; width: 22px; height: 22px; display: flex; justify-content: center; align-items: center; font-size: 0.75rem; z-index: 10;">0</span>
    </a>
`;

const socialHTML = `
    <a style="--accent-color:#4268B2;" data-social='Facebook' class="social-face" href="https://www.facebook.com/share/1GBXWLUZEy/" target="_blank" rel="noopener noreferrer">
        <img src="assets/img/iconos/facebook.svg" alt="Facebook" width="30" height="30">
    </a>
    <a style="--accent-color:#C13584;" data-social='Instagram' class="social-insta" href="https://www.instagram.com/rubenzdazs?igsh=MWwzZnc0MmNjaG41Zg==" target="_blank" rel="noopener noreferrer">
        <img src="assets/img/iconos/instagram.svg" alt="Instagram" width="30" height="30">
    </a>
    <a style="--accent-color:#010101;" data-social='Tiktok' class="social-tiktok" href="https://vm.tiktok.com/ZS9MPxfdo8dDe-89cvD/" target="_blank" rel="noopener noreferrer">
        <img src="assets/img/iconos/tiktok.svg" alt="Tiktok" width="30" height="30">
    </a>
    <div style="--accent-color:#FFFD99;" class="social-messege">
        <p><b>Siguenos</b></p>
    </div>
`;
const footerHTML = `
    <p>Derechos Reservados©</p>
    <a href="terminos.html"> Terminos y condiciones</a>
`;

const menusHTML = `
    <!-- DropDown Menu -->
    <div id="main-nav-menu" class="overlay-menu">
        <a href="#" class="close-btn" id="close-nav">&times;</a>
        <!-- NUEVO CONTENEDOR PARA EL MENÚ DE PRENDAS -->
        <div id="lista-categorias-menu" style="width: 100%; text-align: center; padding-top: 50px;"></div>
    </div>

    <!--Cart Menu  -->
    <div id="cart-nav-menu" class="overlay-menu cart-menu">
        <a href="#" class="close-btn" id="close-cart">&times;</a>
        <div class="cart-items">
            <p>Tu carrito está vacío</p>
        </div>
    </div>
`;

// =============================================
// INYECCIÓN SÍNCRONA EN EL DOM
// =============================================
const headerEl = document.getElementById("template-header");
if (headerEl) headerEl.innerHTML = headerHTML;

const socialEl = document.getElementById("template-social");
if (socialEl) socialEl.innerHTML = socialHTML;

const footerEl = document.getElementById("template-footer");
if (footerEl) footerEl.innerHTML = footerHTML;

const menusEl = document.getElementById("template-menus");
if (menusEl) menusEl.innerHTML = menusHTML;