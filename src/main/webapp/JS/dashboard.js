// ==========================================
// DASHBOARD
// ==========================================

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    cargarDatosDashboard();
});

// Cargar todos los datos desde SvDashboard
async function cargarDatosDashboard() {
    try {
        const response = await fetch('SvDashboard');
        if (!response.ok) throw new Error('Error al obtener datos del dashboard');
        const data = await response.json();

        renderEstadisticas(data.stats);
        renderProximosTurnos(data.proximosTurnos);
        renderPacientesRecientes(data.pacientesRecientes);

    } catch (error) {
        console.error('Error al cargar dashboard:', error);
    }
}

// Renderizar tarjetas de estadísticas
function renderEstadisticas(stats) {
    const h3s = document.querySelectorAll('.card h3');
    if (h3s.length >= 4) {
        h3s[0].textContent = stats.totalPacientes;
        h3s[1].textContent = stats.turnosHoy;
        h3s[2].textContent = stats.consultasMes;
        h3s[3].textContent = stats.pendientes;
    }
}

// Renderizar tabla de próximos turnos
function renderProximosTurnos(turnos) {
    const tbody = document.getElementById('proximos-turnos');
    if (!tbody) return;

    if (turnos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-calendar-times" style="font-size: 3rem; opacity: 0.3; display: block; margin-bottom: 1rem;"></i>
                    No hay turnos programados para hoy
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = turnos.map(turno => `
        <tr>
            <td><strong>${turno.hora}</strong></td>
            <td>${turno.paciente}</td>
            <td>${turno.motivo}</td>
            <td><span class="badge badge-${getEstadoBadgeClass(turno.estado)}">${turno.estado}</span></td>
        </tr>
    `).join('');
}

// Renderizar tabla de pacientes recientes
function renderPacientesRecientes(pacientes) {
    const tbody = document.getElementById('pacientes-recientes');
    if (!tbody) return;

    if (pacientes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-users-slash" style="font-size: 3rem; opacity: 0.3; display: block; margin-bottom: 1rem;"></i>
                    No hay pacientes registrados
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = pacientes.map(paciente => `
        <tr>
            <td>${paciente.dni}</td>
            <td>${paciente.nombre} ${paciente.apellido}</td>
            <td>${paciente.telefono || '-'}</td>
            <td>${paciente.email || '-'}</td>
            <td>
                <div class="table-actions">
                    <a href="historia-clinica.html?dni=${paciente.dni}" class="btn btn-sm btn-info" title="Ver historia">
                        <i class="fas fa-file-medical"></i>
                    </a>
                    <a href="pacientes.html" class="btn btn-sm btn-warning" title="Editar">
                        <i class="fas fa-edit"></i>
                    </a>
                </div>
            </td>
        </tr>
    `).join('');
}

// Obtener clase de badge según estado
function getEstadoBadgeClass(estado) {
    const clases = {
        'PENDIENTE': 'warning',
        'CONFIRMADO': 'info',
        'COMPLETADO': 'success',
        'CANCELADO': 'error'
    };
    return clases[estado] || 'info';
}
