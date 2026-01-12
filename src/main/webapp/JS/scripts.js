// Asegurándonos de que el archivo scripts.js se cargó correctamente
console.log("El archivo scripts.js está cargado correctamente.");

// Esperar a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener("DOMContentLoaded", function () {
    // Seleccionar el botón "Agregar" por su id
    const btnAgregar = document.getElementById("btnAgregar");

    if (btnAgregar) {
        // Agregar evento click
        btnAgregar.addEventListener("click", function () {
            console.log("Botón Agregar clickeado"); // Para depurar
            window.location.href = "/Components/agregarPaciente.jsp"; // Asegúrate de que esta ruta sea correcta
        });
    } else {
        console.error("El botón 'Agregar' no se encontró en el DOM.");
    }
});
