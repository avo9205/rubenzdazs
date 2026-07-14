// // Desactiva el clic derecho
// document.addEventListener('contextmenu', function(e) {
//     e.preventDefault();
// });

// // Desactiva F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
// document.addEventListener('keydown', function(e) {
//     if (e.keyCode === 123 || // F12
//        (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
//        (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
//        (e.ctrlKey && e.keyCode === 85)) { // Ctrl+U
//         e.preventDefault();
//     }
// });