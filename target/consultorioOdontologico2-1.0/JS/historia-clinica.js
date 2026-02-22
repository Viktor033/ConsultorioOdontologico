// VERSIÓN 1.5 - DEBUGGING MODAL LOCK
// ==========================================

let pacientes = [];
let pacienteSeleccionado = null;
let consultas = [];
let odontogramaActual = {};
let vistaOdontograma = 'adulto'; // Estado para la vista del odontograma (adulto/nino)

// Cargar pacientes al iniciar
// Cargar pacientes al iniciar
document.addEventListener('DOMContentLoaded', async () => {
    await cargarPacientes();

    // Verificar parámetros URL
    const urlParams = new URLSearchParams(window.location.search);
    const dniParam = urlParams.get('dni');
    const actionParam = urlParams.get('action');

    if (dniParam) {
        console.log("Recibido DNI por URL:", dniParam);
        const selector = document.getElementById('selector-paciente');
        if (selector) {
            // Esperar un tick para asegurar que el DOM de opciones se renderizó (aunque el await debería bastar)
            // Verificar si existe la opción
            const opcionExiste = Array.from(selector.options).some(opt => opt.value == dniParam); // Loose equality
            console.log("¿Existe el paciente en la lista?", opcionExiste);

            if (!opcionExiste) {
                console.warn(`El paciente con DNI ${dniParam} no se encuentra en la lista cargada.`);
                // Fallback: Si no está en la lista (ej: eliminado o inactivo), quizá deberíamos buscarlo individualmente?
                // Por ahora solo log.
            }

            selector.value = dniParam;
            console.log("Valor del selector tras asignación:", selector.value);

            // Disparar evento change manualmente o llamar a la función
            await cargarHistoriaClinica();

            if (actionParam === 'nuevaConsulta') {
                abrirModalNuevaConsulta();
            }
        }
    }
});

// Cargar lista de pacientes desde el backend
async function cargarPacientes() {
    try {
        const response = await fetch('SvPaciente');
        if (!response.ok) throw new Error('Error al obtener pacientes');
        pacientes = await response.json();

        const selector = document.getElementById('selector-paciente');
        selector.innerHTML = '<option value="">Seleccione un paciente</option>';

        pacientes.forEach(p => {
            const option = document.createElement('option');
            option.value = p.dniPaciente;
            option.textContent = `${p.nombre} ${p.apellido} (${p.dniPaciente})`;
            selector.appendChild(option);
        });

    } catch (error) {
        console.error('Error:', error);
        mostrarError('No se pudieron cargar los pacientes: ' + error.message);
    }
}

// Cargar historia clínica del paciente seleccionado
async function cargarHistoriaClinica() {
    const dni = document.getElementById('selector-paciente').value;
    if (!dni) {
        mostrarSinPaciente();
        return;
    }

    try {
        // Cargar datos del paciente (con timestamp ant-cache)
        const ts = new Date().getTime();
        const pacResponse = await fetch(`SvPaciente?dni=${dni}&t=${ts}`);
        if (!pacResponse.ok) throw new Error('Error al obtener datos del paciente');
        pacienteSeleccionado = await pacResponse.json();

        // Cargar consultas (historial) (con timestamp ant-cache)
        const histResponse = await fetch(`SvHistorialMedico?dni=${dni}&t=${ts}`);
        if (!histResponse.ok) throw new Error('Error al obtener historial médico');
        const data = await histResponse.json();

        // Mapear datos del backend al formato del frontend
        consultas = data.map(h => ({
            id: h.id,
            fecha: new Date(h.fecha_registro),
            numeroConsulta: h.numero_consulta,
            motivo: h.motivo_consulta,
            diagnostico: h.diagnostico,
            tratamiento: h.tratamiento,
            medicamentos: h.medicamentos,
            notas: h.notas_adicionales,
            debe: h.debe || 0,
            haber: h.haber || 0,
            saldo: h.saldo || 0,
            odontograma: h.odontograma ? JSON.parse(h.odontograma.estadoDientes) : {}
        })).sort((a, b) => {
            // Ordenar por fecha descendente
            const fechaA = new Date(a.fecha);
            const fechaB = new Date(b.fecha);
            if (fechaB - fechaA !== 0) return fechaB - fechaA;
            return b.id - a.id;
        });

        mostrarDatosPaciente(pacienteSeleccionado);
        renderizarTimeline();

    } catch (error) {
        console.error('Error:', error);
        mostrarError('No se pudo cargar la historia clínica: ' + error.message);
    }
}

// Configuración del odontograma
const DIENTES = {
    permanentes: {
        superiores_derecha: [18, 17, 16, 15, 14, 13, 12, 11],
        superiores_izquierda: [21, 22, 23, 24, 25, 26, 27, 28],
        inferiores_derecha: [48, 47, 46, 45, 44, 43, 42, 41],
        inferiores_izquierda: [31, 32, 33, 34, 35, 36, 37, 38]
    },
    temporales: {
        superiores_derecha: [55, 54, 53, 52, 51],
        superiores_izquierda: [61, 62, 63, 64, 65],
        inferiores_derecha: [85, 84, 83, 82, 81],
        inferiores_izquierda: [71, 72, 73, 74, 75]
    }
};

const SECTORES = ['centro', 'top', 'bottom', 'left', 'right'];

const ESTADOS_DIENTE = {
    sano: { nombre: 'Sano', color: '#fff' },
    caries: { nombre: 'Caries', color: '#ef4444' },
    obturado: { nombre: 'Obturado', color: '#3b82f6' },
    ausente: { nombre: 'Ausente', color: '#333' },
    corona: { nombre: 'Corona', color: '#eab308' },
    tratamiento: { nombre: 'Tratamiento conducto', color: '#10b981' }
};

// Inicializar odontograma
function inicializarOdontograma() {
    odontogramaActual = {};
    [...Object.values(DIENTES.permanentes).flat(), ...Object.values(DIENTES.temporales).flat()].forEach(diente => {
        odontogramaActual[diente] = {};
        SECTORES.forEach(sector => {
            odontogramaActual[diente][sector] = 'sano';
        });
    });
}

// Renderizar odontograma
// Renderizar odontograma
// forceAll: Si es true, muestra ambas secciones (útil para impresión o vistas completas)
function renderizarOdontograma(containerId, odontograma, editable = true, forceAll = false) {
    if (!odontograma || Object.keys(odontograma).length === 0) {
        let tempOdonto = {};
        [...Object.values(DIENTES.permanentes).flat(), ...Object.values(DIENTES.temporales).flat()].forEach(diente => {
            tempOdonto[diente] = {};
            SECTORES.forEach(s => tempOdonto[diente][s] = 'sano');
        });
        odontograma = tempOdonto;
    }

    const isAdulto = vistaOdontograma === 'adulto';
    const isNino = vistaOdontograma === 'nino';

    // Si forceAll es true, ambas secciones son visibles y no hay tabs
    const displayStyleNino = (forceAll || isNino) ? 'block' : 'none';
    const displayStyleAdulto = (forceAll || isAdulto) ? 'block' : 'none';

    // Generar Tabs solo si no es forceAll
    let tabsHTML = '';
    if (!forceAll) {
        tabsHTML = `
            <div class="odonto-tabs">
                <div class="odonto-tab-btn ${isAdulto ? 'active' : ''}" onclick="cambiarVistaOdontograma('${containerId}', 'adulto')">
                    <i class="fas fa-tooth"></i> Dentición Permanente
                </div>
                <div class="odonto-tab-btn ${isNino ? 'active' : ''}" onclick="cambiarVistaOdontograma('${containerId}', 'nino')">
                    <i class="fas fa-baby"></i> Dentición Temporal
                </div>
            </div>
        `;
    }

    const html = `
        ${tabsHTML}

        <div id="${containerId}-section-nino" class="odonto-section ${isNino ? 'active' : ''}" style="display: ${displayStyleNino}">
            <div class="seccion-temporal" style="margin-bottom: 2rem; border-bottom: 1px dashed #ccc; padding-bottom: 1rem;">
                <h5 style="text-align:center; color: var(--text-secondary); margin-bottom: 1rem;">Dentición Temporal (Niños)</h5>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <div style="display: flex; justify-content: center; gap: 2rem;">
                        <div class="arcada">${DIENTES.temporales.superiores_derecha.map(num => crearDienteHTML(num, odontograma[num], editable)).join('')}</div>
                        <div style="width: 20px;"></div>
                        <div class="arcada">${DIENTES.temporales.superiores_izquierda.map(num => crearDienteHTML(num, odontograma[num], editable)).join('')}</div>
                    </div>
                    <div style="display: flex; justify-content: center; gap: 2rem;">
                        <div class="arcada">${DIENTES.temporales.inferiores_derecha.map(num => crearDienteHTML(num, odontograma[num], editable)).join('')}</div>
                        <div style="width: 20px;"></div>
                        <div class="arcada">${DIENTES.temporales.inferiores_izquierda.map(num => crearDienteHTML(num, odontograma[num], editable)).join('')}</div>
                    </div>
                </div>
            </div>
        </div>

        <div id="${containerId}-section-adulto" class="odonto-section ${isAdulto ? 'active' : ''}" style="display: ${displayStyleAdulto}">
            <div class="seccion-permanente">
                <h5 style="text-align:center; color: var(--text-secondary); margin-bottom: 1rem;">Dentición Permanente (Adultos)</h5>
                 <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <div style="display: flex; justify-content: center; gap: 2rem;">
                        <div class="arcada">${DIENTES.permanentes.superiores_derecha.map(num => crearDienteHTML(num, odontograma[num], editable)).join('')}</div>
                        <div style="width: 20px;"></div>
                        <div class="arcada">${DIENTES.permanentes.superiores_izquierda.map(num => crearDienteHTML(num, odontograma[num], editable)).join('')}</div>
                    </div>
                    <div style="display: flex; justify-content: center; gap: 2rem;">
                        <div class="arcada">${DIENTES.permanentes.inferiores_derecha.map(num => crearDienteHTML(num, odontograma[num], editable)).join('')}</div>
                        <div style="width: 20px;"></div>
                        <div class="arcada">${DIENTES.permanentes.inferiores_izquierda.map(num => crearDienteHTML(num, odontograma[num], editable)).join('')}</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="leyenda" style="margin-top: 2rem; padding-top: 1rem; border-top: 2px solid #eee; display: flex; flex-wrap: wrap; justify-content: center;">
            <h4 style="width: 100%; text-align: center; margin-bottom: 10px;">Referencias:</h4>
            ${Object.entries(ESTADOS_DIENTE).map(([key, value]) => `
                <div class="leyenda-item" style="cursor: pointer; padding: 5px; border-radius: 4px; border: 1px solid transparent;" onclick="seleccionarHerramienta('${key}')" id="tool-${key}">
                    <div class="leyenda-color ${key}" style="background-color: ${value.color};"></div>
                    <span>${value.nombre}</span>
                </div>
            `).join('')}
        </div>
    `;

    document.getElementById(containerId).innerHTML = html;

    // Reseleccionar herramienta actual visualmente si es editable
    if (editable) {
        window.seleccionarHerramienta(herramientaActual);
    }
}

// Función para cambiar vista entre adulto y niño sin recargar todo
window.cambiarVistaOdontograma = function (containerId, vista) {
    vistaOdontograma = vista;

    // Actualizar botones
    const container = document.getElementById(containerId);
    const btns = container.querySelectorAll('.odonto-tab-btn');
    btns.forEach(btn => {
        if ((vista === 'adulto' && btn.innerText.includes('Permanente')) ||
            (vista === 'nino' && btn.innerText.includes('Temporal'))) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Actualizar secciones
    const secNino = document.getElementById(`${containerId}-section-nino`);
    const secAdulto = document.getElementById(`${containerId}-section-adulto`);

    if (vista === 'nino') {
        if (secNino) { secNino.style.display = 'block'; secNino.classList.add('active'); }
        if (secAdulto) { secAdulto.style.display = 'none'; secAdulto.classList.remove('active'); }
    } else {
        if (secNino) { secNino.style.display = 'none'; secNino.classList.remove('active'); }
        if (secAdulto) { secAdulto.style.display = 'block'; secAdulto.classList.add('active'); }
    }
};

// Herramienta seleccionada
let herramientaActual = 'caries';
window.seleccionarHerramienta = function (herramienta) {
    herramientaActual = herramienta;
    document.querySelectorAll('.leyenda-item').forEach(el => el.style.borderColor = 'transparent');
    const selectedEl = document.getElementById(`tool-${herramienta}`);
    if (selectedEl) selectedEl.style.borderColor = '#667eea';
};

// Crear HTML de un diente
function crearDienteHTML(numero, estadoSectores, editable) {
    if (!estadoSectores) {
        estadoSectores = {};
        SECTORES.forEach(s => estadoSectores[s] = 'sano');
    }

    return `
        <div class="diente-wrapper">
            <div class="diente-numero">${numero}</div>
            <div class="diente-geometrico">
                ${SECTORES.map(sector => `
                    <div class="sector sector-${sector} estado-${estadoSectores[sector] || 'sano'}" 
                         style="background-color: ${ESTADOS_DIENTE[estadoSectores[sector]]?.color || '#fff'};"
                         onclick="${editable ? `cambiarEstadoSector(${numero}, '${sector}')` : ''}"></div>
                `).join('')}
            </div>
        </div>
    `;
}

// Cambiar estado de un sector
window.cambiarEstadoSector = function (numeroDiente, sector) {
    if (!odontogramaActual[numeroDiente]) {
        odontogramaActual[numeroDiente] = {};
        SECTORES.forEach(s => odontogramaActual[numeroDiente][s] = 'sano');
    }

    if (odontogramaActual[numeroDiente][sector] === herramientaActual) {
        odontogramaActual[numeroDiente][sector] = 'sano';
    } else {
        odontogramaActual[numeroDiente][sector] = herramientaActual;
    }

    renderizarOdontograma('odontograma-modal', odontogramaActual, true);
    window.seleccionarHerramienta(herramientaActual);
};

// Abrir modal nueva consulta
function abrirModalNuevaConsulta() {
    if (!pacienteSeleccionado) {
        mostrarError('Por favor, selecciona un paciente primero');
        return;
    }

    document.getElementById('form-consulta').reset();
    document.getElementById('consulta-numero').value = consultas.length + 1;
    document.getElementById('consulta-fecha').value = new Date().toISOString().split('T')[0];

    // Determinar vista inicial basada en edad
    const edad = calcularEdad(pacienteSeleccionado.fecha_nac);
    // Si la edad es menor a 10 años, sugerimos temporal, sino adulto
    vistaOdontograma = (edad !== '-' && edad < 10) ? 'nino' : 'adulto';
    document.getElementById('consulta-debe').value = 0;
    document.getElementById('consulta-haber').value = 0;

    if (consultas.length > 0) {
        // Al estar ordenado descendente (fecha más reciente primero en índice 0),
        // tomamos la posición 0 como la última consulta válida.
        odontogramaActual = JSON.parse(JSON.stringify(consultas[0].odontograma));
    } else {
        inicializarOdontograma();
    }

    renderizarOdontograma('odontograma-modal', odontogramaActual, true);
    document.getElementById('modal-consulta').classList.add('active');
}

// Guardar consulta en el backend
async function guardarConsulta(event) {
    event.preventDefault();

    const consultaData = {
        dni: pacienteSeleccionado.dniPaciente,
        fecha: document.getElementById('consulta-fecha').value,
        numeroConsulta: parseInt(document.getElementById('consulta-numero').value),
        motivo: document.getElementById('consulta-motivo').value,
        diagnostico: document.getElementById('consulta-diagnostico').value,
        tratamiento: document.getElementById('consulta-tratamiento').value,
        medicamentos: document.getElementById('consulta-medicamentos').value,
        medicamentos: document.getElementById('consulta-medicamentos').value,
        notas: document.getElementById('consulta-notas').value,
        debe: parseFloat(document.getElementById('consulta-debe').value) || 0,
        haber: parseFloat(document.getElementById('consulta-haber').value) || 0,
        // Saldo se calcula en backend o se infiere
        saldo: 0,
        odontograma: odontogramaActual
    };

    try {
        const response = await fetch('SvHistorialMedico', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(consultaData)
        });

        if (!response.ok) throw new Error('Error al guardar consulta');

        const res = await response.json();
        mostrarExito(res.message);
        cerrarModalConsulta();
        cargarHistoriaClinica(); // Recargar todo

    } catch (error) {
        console.error('Error:', error);
        mostrarError('No se pudo guardar la consulta en el servidor');
    }
}

// Renderizar Timeline de consultas
function renderizarTimeline() {
    const container = document.getElementById('timeline-container');
    container.innerHTML = '';

    if (consultas.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No hay consultas registradas para este paciente.</p>';
        return;
    }

    // Ordenar consultas por fecha desc (más reciente primero)
    const consultasSorted = [...consultas].sort((a, b) => b.fecha - a.fecha);

    consultasSorted.forEach(c => {
        const card = document.createElement('div');
        card.className = 'consulta-card';
        card.innerHTML = `
            <div class="consulta-header">
                <div>
                    <h4 style="color: var(--color-primary);">Consulta #${c.numeroConsulta}</h4>
                    <span style="font-size: 0.875rem; color: var(--text-secondary);">${c.fecha.toLocaleDateString('es-AR')}</span>
                </div>
                <button class="btn btn-sm btn-info" onclick="verOdontograma(${c.id})">
                    <i class="fas fa-tooth"></i> Ver Odontograma
                </button>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <p><strong>Motivo:</strong> ${c.motivo}</p>
                    <p><strong>Diagnóstico:</strong> ${c.diagnostico || '-'}</p>
                </div>
                <div>
                    <p><strong>Tratamiento:</strong> ${c.tratamiento || '-'}</p>
                    <p><strong>Medicamentos:</strong> ${c.medicamentos || '-'}</p>
                </div>
            </div>
            ${c.notas ? `<p style="margin-top: 0.5rem; font-style: italic;"><strong>Notas:</strong> ${c.notas}</p>` : ''}
        `;
        container.appendChild(card);
    });

    document.getElementById('sin-paciente').style.display = 'none';
    document.getElementById('paciente-info').style.display = 'block';
    container.style.display = 'block';
}

// Mostrar datos del paciente
function mostrarDatosPaciente(p) {
    document.getElementById('paciente-nombre').textContent = `${p.nombre} ${p.apellido}`;
    document.getElementById('paciente-dni').textContent = p.dniPaciente;
    document.getElementById('paciente-edad').textContent = calcularEdad(p.fecha_nac) + ' años';
    document.getElementById('paciente-obra-social').textContent = p.obraSocial || '-';
}

// Ver odontograma de una consulta
window.verOdontograma = function (id) {
    const consulta = consultas.find(c => c.id === id);
    if (!consulta) return;

    const modalHTML = `
        <div id="modal-ver-odonto" class="modal-overlay active">
            <div class="modal" style="max-width: 900px;">
                <div class="modal-header">
                    <h3 class="modal-title">Odontograma - Consulta #${consulta.numeroConsulta}</h3>
                    <button class="modal-close" onclick="cerrarModalVerOdonto()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div id="odontograma-ver"></div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="cerrarModalVerOdonto()">Cerrar</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Determinar vista inicial basada en edad del paciente actual
    if (pacienteSeleccionado) {
        const edad = calcularEdad(pacienteSeleccionado.fecha_nac);
        vistaOdontograma = (edad !== '-' && edad < 10) ? 'nino' : 'adulto';
    }

    renderizarOdontograma('odontograma-ver', consulta.odontograma, false);
}

window.cerrarModalVerOdonto = function () {
    const modal = document.getElementById('modal-ver-odonto');
    if (modal) modal.remove();
}

function cerrarModalConsulta() {
    document.getElementById('modal-consulta').classList.remove('active');
}

function mostrarSinPaciente() {
    document.getElementById('sin-paciente').style.display = 'block';
    document.getElementById('paciente-info').style.display = 'none';
    document.getElementById('timeline-container').style.display = 'none';
    pacienteSeleccionado = null;
}

function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return '-';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad;
}

function mostrarExito(mensaje) {
    Swal.fire({
        icon: 'success',
        title: '¡Guardado!',
        text: mensaje,
        confirmButtonColor: '#667eea',
        timer: 1500
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

// Función para Exportar PDF (Imprimir)
window.exportarPDF = function () {
    if (!pacienteSeleccionado) {
        mostrarError('Debes seleccionar un paciente para generar el reporte.');
        return;
    }

    // 1. Poner fecha de impresión
    const fecha = new Date().toLocaleDateString('es-AR', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    document.getElementById('fecha-impresion').textContent = fecha;

    // 2. Obtener último odontograma para mostrar en el reporte
    let ultimoOdontoParaReporte = null;

    if (consultas.length > 0) {
        // Ordenar explícitamente por fecha descendente
        // Nota: ya deberían estar ordenadas, pero aseguramos
        const consultasOrdenadas = [...consultas].sort((a, b) => {
            const fechaA = new Date(a.fecha);
            const fechaB = new Date(b.fecha);
            if (fechaB - fechaA !== 0) return fechaB - fechaA;
            return b.id - a.id;
        });

        const ultimaConsulta = consultasOrdenadas[0];

        console.log("Última consulta para reporte:", ultimaConsulta);

        if (ultimaConsulta && ultimaConsulta.odontograma) {
            if (typeof ultimaConsulta.odontograma === 'string') {
                try {
                    // Intentar parsear si es string
                    if (ultimaConsulta.odontograma.trim() !== "" && ultimaConsulta.odontograma !== "{}") {
                        ultimoOdontoParaReporte = JSON.parse(ultimaConsulta.odontograma);
                    }
                } catch (e) {
                    console.error("Error parseando odontograma de consulta para reporte:", e);
                }
            } else if (typeof ultimaConsulta.odontograma === 'object') {
                // Ya es objeto
                ultimoOdontoParaReporte = ultimaConsulta.odontograma;
            }
        }
    }

    // Si no se encontró en historial, verificar si es una consulta nueva no guardada (odontogramaActual)
    // O inicializar vacío
    if (!ultimoOdontoParaReporte || Object.keys(ultimoOdontoParaReporte).length === 0) {
        console.warn("No se encontró odontograma en historial. Usando estado actual o vacío.");

        // Si el usuario está editando algo ahora mismo, quizás quiera imprimir ESO
        // Pero cuidado: exportarPDF es global. Asumiremos que si no hay historial, se quiere imprimir lo que se ve.
        if (odontogramaActual && Object.keys(odontogramaActual).length > 0) {
            ultimoOdontoParaReporte = odontogramaActual;
        } else {
            inicializarOdontograma();
            ultimoOdontoParaReporte = odontogramaActual;
        }
    }

    // normalización de claves (Fix para claves decimales como 1.6 en lugar de 16)
    if (ultimoOdontoParaReporte && Object.keys(ultimoOdontoParaReporte).length > 0) {
        const claves = Object.keys(ultimoOdontoParaReporte);
        // Detectar si hay claves con punto
        const tieneClavesMalas = claves.some(k => k.includes('.'));

        if (tieneClavesMalas) {
            // Normalización profunda: Corregir claves decimales y estructura de sectores
            console.warn("Detectando estructura de datos... Normalizando odontograma para impresión.");
            let odontoCorregido = {};
            claves.forEach(k => {
                let nuevaKey = k;
                if (k.includes('.')) {
                    nuevaKey = k.replace('.', ''); // Fix 1.6 -> 16
                }

                let datosDiente = ultimoOdontoParaReporte[k];
                let nuevosSectores = {};

                // Estrategia de Mapeo: Si viene simplificado (solo oclusal), distribuir a sectores estándar
                if (datosDiente.hasOwnProperty('oclusal') || Object.keys(datosDiente).length === 1) {
                    // Obtener el valor del estado (puede estar en 'oclusal' o ser la única key)
                    let estadoRaw = datosDiente['oclusal'] || Object.values(datosDiente)[0];
                    let estadoNormalizado = estadoRaw;

                    // Fix valores de estado incompatibles
                    if (estadoRaw === 'tratamiento-conducto') estadoNormalizado = 'tratamiento';

                    // Lógica de distribución
                    if (estadoNormalizado === 'ausente' || estadoNormalizado === 'corona') {
                        // Si falta el diente o es corona, pintamos TODO
                        ['centro', 'top', 'bottom', 'left', 'right'].forEach(s => {
                            nuevosSectores[s] = estadoNormalizado;
                        });
                    } else {
                        // Si es caries u obturación en "oclusal", lo mandamos al centro
                        nuevosSectores['centro'] = estadoNormalizado;
                        // El resto sano
                        ['top', 'bottom', 'left', 'right'].forEach(s => nuevosSectores[s] = 'sano');
                    }
                } else {
                    // Si ya tiene estructura completa, solo normalizar valores si hace falta
                    ['centro', 'top', 'bottom', 'left', 'right'].forEach(s => {
                        let val = datosDiente[s] || 'sano';
                        if (val === 'tratamiento-conducto') val = 'tratamiento';
                        nuevosSectores[s] = val;
                    });
                }

                odontoCorregido[nuevaKey] = nuevosSectores;
            });
            ultimoOdontoParaReporte = odontoCorregido;
            console.log("Odontograma normalizado (Estructura completa):", JSON.stringify(ultimoOdontoParaReporte));

            // Verificación de sectores del primer diente encontrado
            const primerDienteKey = Object.keys(ultimoOdontoParaReporte)[0];
            if (primerDienteKey) {
                const sectores = Object.keys(ultimoOdontoParaReporte[primerDienteKey]);
                console.log(`Sectores detectados en diente ${primerDienteKey}:`, sectores);
                const esperados = ['centro', 'top', 'bottom', 'left', 'right'];
                const coinciden = esperados.every(e => sectores.includes(e));
                if (!coinciden) console.warn("¡ATENCIÓN! Los sectores del diente no coinciden con los esperados:", esperados);
            }
        }
    }

    console.log("Renderizando odontograma para impresión (Final):", ultimoOdontoParaReporte);

    // 3. Renderizar Odontograma en el contenedor de impresión
    // forceAll = true para mostrar todo (adulto y niño)
    renderizarOdontograma('odonto-print-container', ultimoOdontoParaReporte, false, true);

    // 4. Llenar Antecedentes Médicos para Impresión
    const listaAnt = document.getElementById('lista-antecedentes-print');
    listaAnt.innerHTML = '';

    if (pacienteSeleccionado && pacienteSeleccionado.antecedents) {
        try {
            const antObj = JSON.parse(pacienteSeleccionado.antecedents);
            let hayAntecedentes = false;
            for (const key in antObj) {
                if (antObj[key]) {
                    const li = document.createElement('li');
                    li.textContent = `• ${key}`;
                    listaAnt.appendChild(li);
                    hayAntecedentes = true;
                }
            }
            if (!hayAntecedentes) {
                listaAnt.innerHTML = '<li>Sin antecedentes patológicos relevantes registrados.</li>';
            }
            // Mostrar título y lista
            document.getElementById('antecedentes-print').style.display = 'block';
        } catch (e) {
            console.error(e);
            document.getElementById('antecedentes-print').style.display = 'none';
        }
    }

    // 5. Llenar Planilla de Evolución (Tabla)
    const tbody = document.getElementById('evolucion-body-print');
    tbody.innerHTML = '';

    // Obtener consultas ordenadas por fecha ASC (Cronológico) para calcular saldo
    const consultasCronologicas = [...consultas].sort((a, b) => a.fecha - b.fecha);

    let saldoAcumulado = 0;

    consultasCronologicas.forEach(c => {
        const debe = c.debe || 0; // Asumimos que c.debe viene del backend (habrá que mapearlo en cargarHistoriaClinica)
        const haber = c.haber || 0;
        // Si el backend no persiste saldo, lo calculamos aquí
        // O si lo persiste, usamos c.saldo. Para la planilla "evolutiva", mejor recalcular para asegurar coherencia.
        saldoAcumulado = saldoAcumulado + debe - haber;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.fecha.toLocaleDateString('es-AR')}</td>
            <td>
                <strong>${c.motivo}</strong><br>
                ${c.tratamiento || ''}
            </td>
            <td>$${debe.toFixed(2)}</td>
            <td>$${haber.toFixed(2)}</td>
            <td>$${saldoAcumulado.toFixed(2)}</td>
            <td style="border-bottom: 1px solid #ccc;"></td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('evolucion-print').style.display = 'block';

    // 6. Invocar diálogo de impresión
    setTimeout(() => {
        window.print();
        // Ocultar al volver
        // document.getElementById('antecedentes-print').style.display = 'none'; // Mejor dejarlo oculto por CSS media print
    }, 500);
};

// ==========================================
// LÓGICA DE ANTECEDENTES Y CONSENTIMIENTO
// ==========================================

// This function is assumed to be `cargarHistoriaClinica` or similar, based on the context provided in the instruction.
// The instruction implies this block should be inserted.

function abrirModalAntecedentes() {
    console.log("Intentando abrir modal antecedentes...");
    try {
        if (!pacienteSeleccionado) {
            console.warn("No hay paciente seleccionado");
            Swal.fire({ icon: 'warning', title: 'Atención', text: 'Selecciona un paciente primero' });
            return;
        }


        // Limpiar checkboxes
        const checkboxes = document.querySelectorAll('#form-antecedentes input[type="checkbox"]');
        if (checkboxes) checkboxes.forEach(cb => cb.checked = false);

        // Cargar antecedentes guardados
        if (pacienteSeleccionado && pacienteSeleccionado.antecedents) {
            try {
                let antObj = {};
                if (typeof pacienteSeleccionado.antecedents === 'string') {
                    if (pacienteSeleccionado.antecedents !== "undefined" && pacienteSeleccionado.antecedents.trim() !== "") {
                        antObj = JSON.parse(pacienteSeleccionado.antecedents);
                    }
                } else if (typeof pacienteSeleccionado.antecedents === 'object') {
                    antObj = pacienteSeleccionado.antecedents;
                }

                if (checkboxes) {
                    checkboxes.forEach(cb => {
                        if (antObj && antObj[cb.value]) {
                            cb.checked = true;
                        }
                    });
                }
            } catch (e) {
                console.error("Error procesando JSON de antecedentes:", e);
                // No lanzamos error para permitir que se abra el modal vacío
            }
        }

        const modal = document.getElementById('modal-antecedentes');
        if (modal) {
            modal.classList.add('active');
        } else {
            alert("Error interno: No se encuentra el modal 'modal-antecedentes'");
        }

    } catch (criticalError) {
        console.error("Error crítico al abrir modal:", criticalError);
        alert("Ocurrió un error al intentar abrir la ventana. Verifique la consola (F12) para más detalles.");
    }
}

function cerrarModalAntecedentes() {
    document.getElementById('modal-antecedentes').classList.remove('active');
}

async function guardarAntecedentes(event) {
    event.preventDefault();

    const checkboxes = document.querySelectorAll('#form-antecedentes input[type="checkbox"]');
    const antObj = {};
    checkboxes.forEach(cb => {
        if (cb.checked) {
            antObj[cb.value] = true;
        }
    });

    // Actualizar paciente en memoria (como string JSON)
    pacienteSeleccionado.antecedents = JSON.stringify(antObj);

    // Preparar payload limpio para enviar solo lo necesario
    const payload = {
        dniPaciente: pacienteSeleccionado.dniPaciente,
        nombre: pacienteSeleccionado.nombre,
        apellido: pacienteSeleccionado.apellido,
        antecedents: pacienteSeleccionado.antecedents
        // Los demas campos no son necesarios para este update específico si el backend hace merge,
        // pero SvPaciente re-escribe todo. Necesitamos enviar todo el objeto pacienteSeleccionado
        // para no borrar otros datos si la lógica del backend es "update all fields".
        // SvPaciente doPut usa: nombre, apellido, telefono, direccion, email, obraSocial, antecedents, fecha_nac.
    };

    // Agregar el resto de campos necesarios
    payload.telefono = pacienteSeleccionado.telefono || "";
    payload.direccion = pacienteSeleccionado.direccion || "";
    payload.email = pacienteSeleccionado.email || "";
    payload.obraSocial = pacienteSeleccionado.obraSocial || "";
    payload.fecha_nac = pacienteSeleccionado.fecha_nac || "";

    // Enviar al backend (PUT SvPaciente)
    try {
        const response = await fetch('SvPaciente', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Error actualizando paciente");
        }

        cerrarModalAntecedentes(); // Cerrar modal primero
        mostrarExito("Antecedentes actualizados correctamente");

    } catch (error) {
        console.error(error);
        cerrarModalAntecedentes(); // Cerrar modal también en error para no congelar la UI
        mostrarError("Error al guardar antecedentes: " + error.message);
    }
}

function abrirModalConsentimiento() {
    console.log("Intentando abrir modal consentimiento...");
    if (!pacienteSeleccionado) {
        mostrarError('Selecciona un paciente primero');
        return;
    }
    const modal = document.getElementById('modal-consentimiento');
    if (modal) {
        modal.classList.add('active');
        console.log("Modal consentimiento activado");
    } else {
        console.error("No se encontró el modal consentimiento");
    }
}

function cerrarModalConsentimiento() {
    document.getElementById('modal-consentimiento').classList.remove('active');
}

function imprimirConsentimiento() {
    document.body.classList.add('imprimiendo-consentimiento');
    window.print();
    // Remover clase después de un tiempo para asegurar que el diálogo de impresión ya se abrió
    setTimeout(() => {
        document.body.classList.remove('imprimiendo-consentimiento');
    }, 1000);
}
