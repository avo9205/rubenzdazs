document.addEventListener("DOMContentLoaded", function() {
    
    const btnWhatsApp = document.getElementById("btn-whatsapp-lab");

    if(btnWhatsApp) {
        
        // 1. GESTIÓN VISUAL: Mantiene el botón hundido al presionar
        btnWhatsApp.addEventListener("touchstart", function() {
            btnWhatsApp.classList.add("is-pressed");
        }, { passive: true });
        
        btnWhatsApp.addEventListener("mousedown", function() {
            btnWhatsApp.classList.add("is-pressed");
        });

        // 2. GESTIÓN VISUAL: Devuelve el botón a su estado original al soltar
        btnWhatsApp.addEventListener("touchend", function() {
            btnWhatsApp.classList.remove("is-pressed");
        });
        
        btnWhatsApp.addEventListener("touchcancel", function() {
            btnWhatsApp.classList.remove("is-pressed");
        });
        
        btnWhatsApp.addEventListener("mouseup", function() {
            btnWhatsApp.classList.remove("is-pressed");
        });
        
        btnWhatsApp.addEventListener("mouseleave", function() {
            btnWhatsApp.classList.remove("is-pressed");
        });

        // 3. ACCIÓN PRINCIPAL: Redirige a WhatsApp cuando se completa el clic
        btnWhatsApp.addEventListener("click", function(e) {
            e.preventDefault(); // Previene comportamientos dobles si cambiaste la etiqueta a <a>
            
            // REEMPLAZA ESTE NÚMERO POR EL DE TU NEGOCIO (Código de país + número)
            const numeroTelefono = "573002535381"; 
            
            // El mensaje creativo y personalizado
            const mensaje = "¡Hola RubenzDazs! 🧪 Acabo de ver el área de RubenzLab. Quiero cotizar precios y enviarles mis ideas para ver plasmada mi visión en una camiseta. ¿Me ayudan?";
            
            // Codifica el texto para que los espacios y signos funcionen en una URL
            const mensajeCodificado = encodeURIComponent(mensaje);
            
            // Construye el enlace oficial de WhatsApp
            const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${mensajeCodificado}`;
            
            // Abre WhatsApp en una pestaña nueva (Al estar directo en el click, los móviles no lo bloquean)
            window.open(urlWhatsApp, "_blank");
        });
    }

});