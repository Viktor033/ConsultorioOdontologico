// Estado seleccionado por defecto
let estadoSeleccionado = 'normal';
const clasePrefijo = 'estado-';
let dniPaciente = null;

// Obtener parámetros URL
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// Función para seleccionar la herramienta/estado
function seleccionarEstado(estado) {
    estadoSeleccionado = estado;

    // Actualizar UI de botones
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Activar el botón correspondiente
    const btnId = 'btn-' + estado;
    const btn = document.getElementById(btnId);
    if (btn) btn.classList.add('active');
}

// Función para aplicar el estado a una sección
function cambiarColor(event) {
    const seccion = event.target;

    // Lista de todas las posibles clases de estado
    const estados = ['normal', 'caries', 'obturado', 'tratamiento-conducto', 'corona', 'ausente'];
    const clasesAQuitar = estados.map(e => e === 'normal' ? 'normal' : clasePrefijo + e);

    // Remover cualquier estado previo
    seccion.classList.remove(...clasesAQuitar);

    // Agregar el nuevo estado
    if (estadoSeleccionado === 'normal') {
        seccion.classList.add('normal');
    } else {
        seccion.classList.add(clasePrefijo + estadoSeleccionado);
    }
}

// Funciones del Modal de Limpieza
function limpiarOdontograma() {
    // Mostrar modal
    const modal = document.getElementById('modal-limpiar');
    modal.style.display = 'flex';
}

function cerrarModalLimpiar() {
    const modal = document.getElementById('modal-limpiar');
    modal.style.display = 'none';
}

function confirmarLimpieza() {
    document.querySelectorAll('.seccion').forEach(seccion => {
        // Remover todas las clases de estado
        seccion.classList.remove('estado-caries', 'estado-obturado', 'estado-tratamiento-conducto', 'estado-corona', 'estado-ausente');
        // Asegurar que tenga la clase normal
        seccion.classList.add('normal');
    });
    // Cerrar modal
    cerrarModalLimpiar();
}

// Añadir listeners al cargar
document.addEventListener('DOMContentLoaded', () => {
    // Obtener DNI de la URL
    dniPaciente = getParameterByName('dni');

    // Configurar listeners de dientes
    const secciones = document.querySelectorAll('.seccion');
    secciones.forEach(seccion => {
        seccion.addEventListener('click', cambiarColor);
    });

    // Cargar datos existentes
    cargarOdontograma();
});

// Función para recopilar y guardar datos
function guardarOdontograma() {
    if (!dniPaciente) {
        Swal.fire({
            icon: 'error',
            title: 'Error de Paciente',
            text: 'No hay un paciente seleccionado. Por favor accede desde la lista de pacientes.',
            confirmButtonColor: '#ef4444'
        });
        return;
    }

    // Confirmación previa
    Swal.fire({
        title: '¿Guardar cambios?',
        text: "Se registrará una nueva entrada en la historia clínica del paciente.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#6366f1',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            enviarDatosAlServidor();
        }
    });
}

function enviarDatosAlServidor() {
    const datosOdontograma = {};
    const dientes = document.querySelectorAll('.diente');

    dientes.forEach(dienteDiv => {
        // Obtener número de diente
        const numeroDiente = dienteDiv.querySelector('h2').innerText;

        const secciones = dienteDiv.querySelectorAll('.seccion');
        const estadoDiente = {};
        let tieneCambios = false;

        secciones.forEach(seccion => {
            const idSeccion = seccion.id;
            let estado = 'sano';

            if (seccion.classList.contains('estado-caries')) estado = 'caries';
            else if (seccion.classList.contains('estado-obturado')) estado = 'obturado';
            else if (seccion.classList.contains('estado-tratamiento-conducto')) estado = 'tratamiento-conducto';
            else if (seccion.classList.contains('estado-corona')) estado = 'corona';
            else if (seccion.classList.contains('estado-ausente')) estado = 'ausente';

            if (estado !== 'sano') {
                estadoDiente[idSeccion] = estado;
                tieneCambios = true;
            }
        });

        if (tieneCambios) {
            datosOdontograma[numeroDiente] = estadoDiente;
        }
    });

    const params = new URLSearchParams();
    params.append('estadoDientes', JSON.stringify(datosOdontograma));
    params.append('observaciones', 'Actualización web');
    params.append('dni', dniPaciente);

    fetch('../SvOdontograma', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
    })
        .then(async response => {
            if (!response.ok) {
                // Si el servidor devuelve error (500, 404, etc), leemos el texto
                const text = await response.text();
                throw new Error(`Error del Servidor (${response.status}): ${text}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: '¡Guardado!',
                    text: 'El odontograma se ha guardado correctamente en la Historia Clínica.',
                    confirmButtonColor: '#6366f1',
                    timer: 2000
                });
            } else {
                throw new Error(data.message || 'Error desconocido del servidor');
            }
        })
        .catch(error => {
            console.error('Error detallado:', error);

            // Intentar extraer un mensaje limpio si es HTML
            let mensajeCorto = error.message;
            if (mensajeCorto.includes('<!DOCTYPE html>')) {
                mensajeCorto = "Error interno del servidor (Revisa los logs o consola)";
            }

            Swal.fire({
                icon: 'error',
                title: 'No se pudo guardar',
                text: mensajeCorto,
                footer: '<span style="color: #666">Ver consola (F12) para detalles técnicos</span>'
            });
        });
}

function cargarOdontograma() {
    let url = '../SvOdontograma';
    if (dniPaciente) {
        url += `?dni=${dniPaciente}`;
    } else {
        document.getElementById('nombre-paciente').innerText = "Modo Visualización (Sin Paciente)";
        return;
    }

    fetch(url)
        .then(response => {
            if (response.status === 404) {
                throw new Error("Paciente no encontrado");
            }
            return response.json();
        })
        .then(data => {
            // Mostrar nombre del paciente
            if (data.paciente) {
                document.getElementById('nombre-paciente').innerText = `${data.paciente.nombre} ${data.paciente.apellido}`;
            }

            // Aplicar odontograma si existe
            if (data.odontograma && data.odontograma.estadoDientes) {
                let estados = data.odontograma.estadoDientes;
                if (typeof estados === 'string') {
                    try {
                        estados = JSON.parse(estados);
                    } catch (e) {
                        console.error("Error parseando JSON de dientes:", e);
                        return; // O seguir con vacío
                    }
                }
                aplicarDatosVisualmente(estados);
            } else {
                console.log("No hay odontograma previo o está vacío");
                // Podríamos limpiar visualmente por si acaso
                confirmarLimpieza(); // Reutilizamos limpieza visual sin cerrar modal (hacky pero sirve si queremos resetear)
                // Mejor:
                document.querySelectorAll('.seccion').forEach(s => {
                    s.classList.remove('normal', 'estado-caries', 'estado-obturado', 'estado-tratamiento-conducto', 'estado-corona', 'estado-ausente');
                    s.classList.add('normal');
                });
            }
        })
        .catch(error => {
            console.error("Error cargando odontograma:", error);
            document.getElementById('nombre-paciente').innerText = "Error: " + error.message;
        });
}

function aplicarDatosVisualmente(datos) {
    // Primero limpiar todo
    document.querySelectorAll('.seccion').forEach(s => {
        s.classList.remove('normal', 'estado-caries', 'estado-obturado', 'estado-tratamiento-conducto', 'estado-corona', 'estado-ausente');
        s.classList.add('normal');
    });

    if (!datos || Object.keys(datos).length === 0) return;

    for (const [numeroDiente, secciones] of Object.entries(datos)) {
        const headers = document.querySelectorAll('.diente h2');
        let dienteDiv = null;
        // Buscar el div del diente correcto
        for (let h2 of headers) {
            if (h2.innerText.trim() === numeroDiente) {
                dienteDiv = h2.parentElement;
                break;
            }
        }

        if (dienteDiv) {
            for (const [idSeccion, estado] of Object.entries(secciones)) {
                const seccionEl = dienteDiv.querySelector('#' + idSeccion);
                if (seccionEl) {
                    seccionEl.classList.remove('normal', 'estado-caries', 'estado-obturado', 'estado-tratamiento-conducto', 'estado-corona', 'estado-ausente');
                    if (estado === 'sano') seccionEl.classList.add('normal');
                    else seccionEl.classList.add('estado-' + estado);
                }
            }
        }
    }
}