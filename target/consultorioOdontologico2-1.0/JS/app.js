/**
 * ARCHIVO JAVASCRIPT GLOBAL
 * Contiene funcionalidades compartidas como el menú responsivo
 */

/**
 * Alternar visibilidad del sidebar en móviles
 */
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (sidebar) {
        sidebar.classList.toggle('mobile-open');
    }

    if (overlay) {
        overlay.classList.toggle('active');
    }
}
