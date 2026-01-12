// ==========================================
// GESTIÓN DE PACIENTES
// ==========================================

let pacientes = [];
let pacienteEditando = null;
let pacienteViendose = null;

// Cargar pacientes al iniciar
document.addEventListener('DOMContentLoaded', () => {
    cargarPacientes();
});

// Cargar lista de pacientes
async function cargarPacientes() {
    const apiURL = 'SvPaciente';
    console.log('Intentando cargar pacientes desde:', apiURL);
    try {
        const response = await fetch(apiURL);
        console.log('Respuesta recibida:', response.status, response.statusText);
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        pacientes = await response.json();
        console.log('Pacientes cargados:', pacientes.length);
        renderizarTablaPacientes();
    } catch (error) {
        console.error('Error detallado al cargar pacientes:', error);
        mostrarError('No se pudieron cargar los pacientes: ' + error.message +
            '. Verifica la consola del navegador (F12) para más detalles.');
    }
}

// Renderizar tabla de pacientes
function renderizarTablaPacientes() {
    const tbody = document.getElementById('tabla-pacientes');
    const totalElement = document.getElementById('total-pacientes');

    totalElement.textContent = `Total: ${pacientes.length} pacientes`;

    if (pacientes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-users-slash" style="font-size: 3rem; opacity: 0.3; display: block; margin-bottom: 1rem;"></i>
                    No hay pacientes registrados. Haz clic en "Nuevo Paciente" para agregar uno.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = pacientes.map(paciente => `
        <tr>
            <td>${paciente.dniPaciente}</td>
            <td>${paciente.nombre} ${paciente.apellido}</td>
            <td>${paciente.telefono || '-'}</td>
            <td>${paciente.email || '-'}</td>
            <td>${paciente.obraSocial || '-'}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-sm btn-info" onclick="verDetallePaciente('${paciente.dniPaciente}')" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="editarPaciente('${paciente.dniPaciente}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-error" onclick="eliminarPaciente('${paciente.dniPaciente}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn btn-sm" style="background-color: #6366f1; color: white;" onclick="verOdontograma('${paciente.dniPaciente}')" title="Ver Odontograma">
                        <i class="fas fa-tooth"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Buscar pacientes
function buscarPacientes() {
    const termino = document.getElementById('buscar-paciente').value.toLowerCase();

    if (!termino) {
        renderizarTablaPacientes();
        return;
    }

    const pacientesFiltrados = pacientes.filter(p =>
        p.nombre.toLowerCase().includes(termino) ||
        p.apellido.toLowerCase().includes(termino) ||
        (p.dniPaciente && p.dniPaciente.includes(termino))
    );

    const tbody = document.getElementById('tabla-pacientes');
    const totalElement = document.getElementById('total-pacientes');

    totalElement.textContent = `Mostrando: ${pacientesFiltrados.length} de ${pacientes.length} pacientes`;

    if (pacientesFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-search" style="font-size: 2rem; opacity: 0.3; display: block; margin-bottom: 0.5rem;"></i>
                    No se encontraron pacientes que coincidan con "${termino}"
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = pacientesFiltrados.map(paciente => `
        <tr>
            <td>${paciente.dniPaciente}</td>
            <td>${paciente.nombre} ${paciente.apellido}</td>
            <td>${paciente.telefono || '-'}</td>
            <td>${paciente.email || '-'}</td>
            <td>${paciente.obraSocial || '-'}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-sm btn-info" onclick="verDetallePaciente('${paciente.dniPaciente}')" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="editarPaciente('${paciente.dniPaciente}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-error" onclick="eliminarPaciente('${paciente.dniPaciente}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn btn-sm" style="background-color: #6366f1; color: white;" onclick="verOdontograma('${paciente.dniPaciente}')" title="Ver Odontograma">
                        <i class="fas fa-tooth"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Abrir modal nuevo paciente
function abrirModalNuevoPaciente() {
    pacienteEditando = null;
    document.getElementById('modal-paciente-titulo').textContent = 'Nuevo Paciente';
    document.getElementById('form-paciente').reset();
    document.getElementById('paciente-dni').disabled = false;
    document.getElementById('modal-paciente').classList.add('active');
}

// Cerrar modal paciente
function cerrarModalPaciente() {
    document.getElementById('modal-paciente').classList.remove('active');
    document.getElementById('form-paciente').reset();
    pacienteEditando = null;
}

// Editar paciente
function editarPaciente(dni) {
    const paciente = pacientes.find(p => p.dniPaciente === dni);
    if (!paciente) return;

    pacienteEditando = paciente;
    document.getElementById('modal-paciente-titulo').textContent = 'Editar Paciente';

    // Llenar formulario
    document.getElementById('paciente-dni').value = paciente.dniPaciente;
    document.getElementById('paciente-dni').disabled = true;
    document.getElementById('paciente-nombre').value = paciente.nombre;
    document.getElementById('paciente-apellido').value = paciente.apellido;
    document.getElementById('paciente-telefono').value = paciente.telefono || '';
    document.getElementById('paciente-email').value = paciente.email || '';
    document.getElementById('paciente-direccion').value = paciente.direccion || '';
    document.getElementById('paciente-obra-social').value = paciente.obraSocial || '';

    // Formatear fecha para el input date (yyyy-MM-dd)
    if (paciente.fecha_nac) {
        // Asumiendo que viene como timestamp o string ISO
        const fecha = new Date(paciente.fecha_nac);
        const fechaStr = fecha.toISOString().split('T')[0];
        document.getElementById('paciente-fecha-nac').value = fechaStr;
    } else {
        document.getElementById('paciente-fecha-nac').value = '';
    }

    document.getElementById('modal-paciente').classList.add('active');
}

// Guardar paciente
async function guardarPaciente(event) {
    event.preventDefault();

    const pacienteData = {
        dniPaciente: document.getElementById('paciente-dni').value,
        nombre: document.getElementById('paciente-nombre').value,
        apellido: document.getElementById('paciente-apellido').value,
        telefono: document.getElementById('paciente-telefono').value,
        email: document.getElementById('paciente-email').value,
        direccion: document.getElementById('paciente-direccion').value,
        obraSocial: document.getElementById('paciente-obra-social').value,
        fecha_nac: document.getElementById('paciente-fecha-nac').value
    };

    try {
        let method = 'POST';
        if (pacienteEditando) {
            method = 'PUT';
            // Para ediciones, aseguramos que el DNI sea el mismo (aunque está deshabilitado en el form)
        }

        const response = await fetch('SvPaciente', {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pacienteData)
        });

        if (!response.ok) {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const errorJson = await response.json();
                throw new Error(errorJson.error || 'Error desconocido al guardar');
            } else {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al guardar');
            }
        }

        const resJson = await response.json();
        mostrarExito(resJson.message);

        cerrarModalPaciente();
        cargarPacientes(); // Recargar lista desde DB

    } catch (error) {
        console.error('Error al guardar paciente:', error);
        mostrarError('No se pudo guardar el paciente: ' + error.message);
    }
}

// Ver detalle del paciente
function verDetallePaciente(dni) {
    const paciente = pacientes.find(p => p.dniPaciente === dni);
    if (!paciente) return;

    pacienteViendose = paciente;
    const contenido = document.getElementById('detalle-paciente-contenido');
    contenido.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem;">
            <div>
                <p style="font-weight: 600; color: var(--text-secondary); margin-bottom: 0.25rem;">DNI</p>
                <p style="font-size: 1.125rem;">${paciente.dniPaciente}</p>
            </div>
            <div>
                <p style="font-weight: 600; color: var(--text-secondary); margin-bottom: 0.25rem;">Nombre Completo</p>
                <p style="font-size: 1.125rem;">${paciente.nombre} ${paciente.apellido}</p>
            </div>
            <div>
                <p style="font-weight: 600; color: var(--text-secondary); margin-bottom: 0.25rem;">Teléfono</p>
                <p style="font-size: 1.125rem;">${paciente.telefono || '-'}</p>
            </div>
            <div>
                <p style="font-weight: 600; color: var(--text-secondary); margin-bottom: 0.25rem;">Email</p>
                <p style="font-size: 1.125rem;">${paciente.email || '-'}</p>
            </div>
            <div>
                <p style="font-weight: 600; color: var(--text-secondary); margin-bottom: 0.25rem;">Dirección</p>
                <p style="font-size: 1.125rem;">${paciente.direccion || '-'}</p>
            </div>
            <div>
                <p style="font-weight: 600; color: var(--text-secondary); margin-bottom: 0.25rem;">Obra Social</p>
                <p style="font-size: 1.125rem;">${paciente.obraSocial || '-'}</p>
            </div>
            <div>
                <p style="font-weight: 600; color: var(--text-secondary); margin-bottom: 0.25rem;">Fecha de Nacimiento</p>
                <p style="font-size: 1.125rem;">${paciente.fecha_nac ? new Date(paciente.fecha_nac).toLocaleDateString('es-AR') : '-'}</p>
            </div>
        </div>
    `;

    document.getElementById('modal-detalle-paciente').classList.add('active');
}

// Cerrar modal detalle
function cerrarModalDetalle() {
    document.getElementById('modal-detalle-paciente').classList.remove('active');
}

// Ver historia clínica desde el modal
function verHistoriaClinica() {
    if (pacienteViendose) {
        window.location.href = `historia-clinica.html?dni=${pacienteViendose.dniPaciente}`;
    }
}

// Funciones de notificación con SweetAlert2
function mostrarExito(mensaje) {
    Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: mensaje,
        confirmButtonColor: '#667eea',
        timer: 2000
    });
}

function mostrarError(mensaje) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: mensaje,
        confirmButtonColor: '#ef4444'
    });
}

// Sobrescribir eliminarPaciente para usar confirmación moderna
async function eliminarPaciente(dni) {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#3b82f6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            const response = await fetch(`SvPaciente?dni=${dni}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al eliminar');
            }

            const resJson = await response.json();
            mostrarExito(resJson.message);
            cargarPacientes(); // Recargar

        } catch (error) {
            console.error('Error al eliminar paciente:', error);
            mostrarError('No se pudo eliminar el paciente: ' + error.message);
        }
    }
}

// Redirigir al Odontograma
function verOdontograma(dni) {
    window.location.href = `ODONTOGRAMA/odontograma.html?dni=${dni}`;
}
