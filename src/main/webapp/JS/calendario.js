// ==========================================
// CALENDARIO DE TURNOS
// ==========================================

let fechaActual = new Date();
let diaSeleccionado = null;
let turnos = [];
let turnoEditando = null;

// Meses y días en español
const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', () => {
    cargarPacientesSelect();
    cargarTurnos();
    renderizarCalendario();

    // Establecer fecha mínima en el input de fecha (hoy)
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('turno-fecha').setAttribute('min', hoy);
});

// Cargar turnos desde el backend
async function cargarTurnos() {
    try {
        const response = await fetch('SvTurno');
        if (!response.ok) throw new Error('Error al obtener turnos');
        const data = await response.json();

        // Convertir strings de fecha a objetos Date
        turnos = data.map(t => ({
            ...t,
            fecha: new Date(t.fecha + 'T00:00:00')
        }));

        renderizarCalendario();
        if (diaSeleccionado) seleccionarDia(diaSeleccionado);
    } catch (error) {
        console.error('Error al cargar turnos:', error);
        mostrarError('No se pudieron cargar los turnos del servidor.');
    }
}

// Cargar pacientes en el select desde el backend
async function cargarPacientesSelect() {
    try {
        const response = await fetch('SvPaciente');
        if (!response.ok) throw new Error('Error al obtener pacientes');
        const pacientes = await response.json();

        const select = document.getElementById('turno-paciente');
        select.innerHTML = '<option value="">Seleccione un paciente</option>';

        pacientes.forEach(p => {
            const option = document.createElement('option');
            option.value = p.dniPaciente;
            option.textContent = `${p.nombre} ${p.apellido} (${p.dniPaciente})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar pacientes:', error);
        mostrarError('No se pudieron cargar los pacientes para los turnos.');
    }
}

// Renderizar calendario
function renderizarCalendario() {
    const year = fechaActual.getFullYear();
    const month = fechaActual.getMonth();

    // Actualizar título
    document.getElementById('calendar-month-year').textContent =
        `${meses[month]} ${year}`;

    // Primer día del mes
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);

    // Día de la semana del primer día (0 = domingo)
    const primerDiaSemana = primerDia.getDay();

    // Días del mes anterior para llenar
    const diasMesAnterior = new Date(year, month, 0).getDate();

    const calendarDays = document.getElementById('calendar-days');
    calendarDays.innerHTML = '';

    // Días del mes anterior
    for (let i = primerDiaSemana - 1; i >= 0; i--) {
        const dia = diasMesAnterior - i;
        const cell = crearCeldaDia(dia, month - 1, year, true);
        calendarDays.appendChild(cell);
    }

    // Días del mes actual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
        const cell = crearCeldaDia(dia, month, year, false);
        calendarDays.appendChild(cell);
    }

    // Días del mes siguiente para completar la grilla
    const celdasUsadas = primerDiaSemana + ultimoDia.getDate();
    const celdasRestantes = celdasUsadas % 7 === 0 ? 0 : 7 - (celdasUsadas % 7);

    for (let dia = 1; dia <= celdasRestantes; dia++) {
        const cell = crearCeldaDia(dia, month + 1, year, true);
        calendarDays.appendChild(cell);
    }
}

// Crear celda de día
function crearCeldaDia(dia, mes, year, otroMes) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day-cell';

    if (otroMes) {
        cell.classList.add('other-month');
    }

    const fecha = new Date(year, mes, dia);
    const hoy = new Date();

    // Marcar el día de hoy
    if (fecha.toDateString() === hoy.toDateString()) {
        cell.classList.add('today');
    }

    // Número del día
    const dayNumber = document.createElement('div');
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = dia;
    cell.appendChild(dayNumber);

    // Turnos del día
    if (!otroMes) {
        const turnosDelDia = obtenerTurnosDelDia(fecha);
        if (turnosDelDia.length > 0) {
            const appointmentsContainer = document.createElement('div');
            appointmentsContainer.className = 'calendar-appointments';

            turnosDelDia.slice(0, 3).forEach(turno => {
                const appointment = document.createElement('div');
                appointment.className = `calendar-appointment appointment-${turno.estado.toLowerCase()}`;
                appointment.textContent = `${turno.hora} ${turno.paciente.nombre}`;
                appointmentsContainer.appendChild(appointment);
            });

            if (turnosDelDia.length > 3) {
                const more = document.createElement('div');
                more.className = 'calendar-appointment';
                more.style.backgroundColor = 'var(--color-gray-200)';
                more.style.color = 'var(--text-secondary)';
                more.textContent = `+${turnosDelDia.length - 3} más`;
                appointmentsContainer.appendChild(more);
            }

            cell.appendChild(appointmentsContainer);
        }
    }

    // Click en el día
    cell.addEventListener('click', () => {
        if (!otroMes) {
            seleccionarDia(fecha);
        }
    });

    return cell;
}

// Obtener turnos de un día específico
function obtenerTurnosDelDia(fecha) {
    return turnos.filter(turno => {
        return turno.fecha.toDateString() === fecha.toDateString();
    }).sort((a, b) => a.hora.localeCompare(b.hora));
}

// Seleccionar un día
function seleccionarDia(fecha) {
    diaSeleccionado = fecha;

    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('fecha-seleccionada').textContent =
        fecha.toLocaleDateString('es-AR', opciones);

    const turnosDelDia = obtenerTurnosDelDia(fecha);
    const container = document.getElementById('turnos-del-dia');

    if (turnosDelDia.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <i class="fas fa-calendar-times" style="font-size: 3rem; opacity: 0.3; display: block; margin-bottom: 1rem;"></i>
                No hay turnos para este día
            </div>
        `;
        return;
    }

    container.innerHTML = turnosDelDia.map(turno => `
        <div class="turno-item">
            <div class="turno-hora">${turno.hora}</div>
            <div class="turno-paciente">${turno.paciente.nombre} ${turno.paciente.apellido}</div>
            <div class="turno-motivo">${turno.motivo}</div>
            <div style="margin-top: var(--spacing-sm); display: flex; gap: var(--spacing-sm); align-items: center;">
                <span class="badge appointment-${turno.estado.toLowerCase()}">${turno.estado}</span>
                <div style="margin-left: auto; display: flex; gap: var(--spacing-xs);">
                    <button class="btn btn-sm btn-primary" onclick="atenderPaciente('${turno.paciente.dni}')" title="Atender (Registrar Consulta)">
                        <i class="fas fa-user-md"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="editarTurno(${turno.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-error" onclick="eliminarTurno(${turno.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Navegación del calendario
function mesAnterior() {
    fechaActual.setMonth(fechaActual.getMonth() - 1);
    renderizarCalendario();
}

function mesSiguiente() {
    fechaActual.setMonth(fechaActual.getMonth() + 1);
    renderizarCalendario();
}

function hoy() {
    fechaActual = new Date();
    renderizarCalendario();
    seleccionarDia(new Date());
}

// Abrir modal nuevo turno
function abrirModalNuevoTurno() {
    turnoEditando = null;
    document.getElementById('modal-turno-titulo').textContent = 'Nuevo Turno';
    document.getElementById('form-turno').reset();

    // Si hay un día seleccionado, pre-llenar la fecha
    if (diaSeleccionado) {
        const fechaStr = diaSeleccionado.toISOString().split('T')[0];
        document.getElementById('turno-fecha').value = fechaStr;
    }

    document.getElementById('modal-turno').classList.add('active');
}

// Cerrar modal turno
function cerrarModalTurno() {
    document.getElementById('modal-turno').classList.remove('active');
    document.getElementById('form-turno').reset();
    turnoEditando = null;
}

// Editar turno
function editarTurno(id) {
    const turno = turnos.find(t => t.id === id);
    if (!turno) return;

    turnoEditando = turno;
    document.getElementById('modal-turno-titulo').textContent = 'Editar Turno';

    // Llenar formulario
    document.getElementById('turno-fecha').value = turno.fecha.toISOString().split('T')[0];
    document.getElementById('turno-hora').value = turno.hora;
    document.getElementById('turno-paciente').value = turno.paciente.dni;
    document.getElementById('turno-motivo').value = turno.motivo;
    document.getElementById('turno-estado').value = turno.estado;
    document.getElementById('turno-observaciones').value = turno.observaciones || '';

    document.getElementById('modal-turno').classList.add('active');
}

// Guardar turno en el backend
async function guardarTurno(event) {
    event.preventDefault();

    const turnoData = {
        fecha: document.getElementById('turno-fecha').value,
        hora: document.getElementById('turno-hora').value,
        dniPaciente: document.getElementById('turno-paciente').value,
        motivo: document.getElementById('turno-motivo').value,
        estado: document.getElementById('turno-estado').value,
        observaciones: document.getElementById('turno-observaciones').value
    };

    if (turnoEditando) {
        turnoData.id = turnoEditando.id;
    }

    try {
        const response = await fetch('SvTurno', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(turnoData)
        });

        if (!response.ok) throw new Error('Error al guardar el turno');

        mostrarExito(turnoEditando ? 'Turno actualizado' : 'Turno creado');
        cerrarModalTurno();
        cargarTurnos(); // Recargar todo desde el server
    } catch (error) {
        console.error('Error:', error);
        mostrarError('No se pudo guardar el turno en el servidor');
    }
}

// Eliminar turno
async function eliminarTurno(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#3b82f6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                // Aquí iría la llamada al backend para borrar realmente
                // Por ahora simulamos con el array local como estaba antes
                const index = turnos.findIndex(t => t.id === id);
                if (index !== -1) {
                    turnos.splice(index, 1);
                    renderizarCalendario();

                    // Actualizar panel si es necesario
                    if (diaSeleccionado) {
                        seleccionarDia(diaSeleccionado);
                    }

                    mostrarExito('Turno eliminado correctamente');
                }
            } catch (error) {
                console.error('Error al eliminar turno:', error);
                mostrarError('No se pudo eliminar el turno');
            }
        }
    });
}

// Cerrar modal
function cerrarModalTurno() {
    document.getElementById('modal-turno').classList.remove('active');
    document.getElementById('form-turno').reset();
    turnoEditando = null;
}

// Funciones de notificación con SweetAlert2
function mostrarExito(mensaje) {
    Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: mensaje,
        confirmButtonColor: '#2563eb',
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

// Funcin para ir a atender al paciente (Historia Clnica)
function atenderPaciente(dni) {
    window.location.href = 'historia-clinica.html?dni=' + dni + '&action=nuevaConsulta';
}

