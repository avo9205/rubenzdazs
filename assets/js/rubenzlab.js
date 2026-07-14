document.addEventListener("DOMContentLoaded", function() {
    
    const btnWhatsApp = document.getElementById("btn-whatsapp-lab");

    if(btnWhatsApp) {
        btnWhatsApp.addEventListener("click", function() {
            
            // 1. REEMPLAZA ESTE NÚMERO POR EL DE TU NEGOCIO (Código de país + número)
            const numeroTelefono = "573001234567"; // Ejemplo para Colombia
            
            // 2. El mensaje creativo y personalizado
            const mensaje = "¡Hola RubenzDazs! 🧪 Acabo de ver el área de RubenzLab. Quiero cotizar precios y enviarles mis ideas para ver plasmada mi visión en una camiseta. ¿Me ayudan?";
            
            // 3. Codifica el texto para que los espacios y signos funcionen en una URL
            const mensajeCodificado = encodeURIComponent(mensaje);
            
            // 4. Construye el enlace oficial de WhatsApp
            const urlWhatsApp = `https://wa.me/${numeroTelefono}?text=${mensajeCodificado}`;
            
            // 5. Abre WhatsApp en una pestaña nueva
            window.open(urlWhatsApp, "_blank");
        });
    }

});