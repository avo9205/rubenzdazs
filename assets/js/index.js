



// Seleccionamos todos los enlaces dentro de tu bloque de redes sociales
const botonesSociales = document.querySelectorAll('.box-socialmedia a');

botonesSociales.forEach(boton => {
    boton.addEventListener('click', function(evento) {
        // 1. Detenemos la navegación instantánea
        evento.preventDefault();

        // 2. Capturamos la URL del enlace y si debe abrirse en una pestaña nueva
        const destino = this.href;
        const nuevaPestana = this.target === '_blank';

        // 3. Añadimos un retraso de 250 milisegundos (0.25 segundos)
        setTimeout(() => {
            if (nuevaPestana) {
                // Si el enlace tiene target="_blank", lo abrimos en otra pestaña
                window.open(destino, '_blank');
            } else {
                // Si no, navegamos en la misma pestaña
                window.location.href = destino;
            }
        }, 250); // Puedes ajustar este número. 200 a 300 suele sentirse muy natural.
    });
});


// Seleccionamos el botón CTA de la colección
const botonCTA = document.querySelector('.cta');

if (botonCTA) {
    botonCTA.addEventListener('click', function(evento) {
        // Buscamos el enlace 'a' que está dentro del botón
        const enlace = this.querySelector('a');
        
        // Verificamos que el enlace exista y tenga un destino
        if (enlace && enlace.href) {
            // 1. Detenemos la navegación instantánea
            evento.preventDefault();
            
            // 2. Le añadimos la clase para "congelar" el efecto de hundimiento
            this.classList.add('is-clicked');
            
            // 3. Añadimos el retraso de 300ms para apreciar la animación
            setTimeout(() => {
                window.location.href = enlace.href;
                
                // Quitamos la clase después de navegar por si el usuario 
                // usa el botón de "Atrás" en su navegador
                this.classList.remove('is-clicked');
            }, 150); 
        }
    });
}




