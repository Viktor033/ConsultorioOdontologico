package servlets;

import Persistencia.HistorialMedicoJpaController;
import Persistencia.OdontogramaJpaController;
import Persistencia.PacienteJpaController;
import logica.HistorialMedico;
import logica.Odontograma;
import logica.Paciente;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet(name = "SvOdontograma", urlPatterns = { "/SvOdontograma" })
public class SvOdontograma extends HttpServlet {

    OdontogramaJpaController controlOdonto = new OdontogramaJpaController();
    PacienteJpaController controlPaciente = new PacienteJpaController();
    HistorialMedicoJpaController controlHistorial = new HistorialMedicoJpaController();

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            String dni = request.getParameter("dni");

            if (dni != null && !dni.isEmpty()) {
                // Buscar paciente por DNI
                Paciente paciente = controlPaciente.findPaciente(dni);

                if (paciente != null) {
                    // ESTRATEGIA: Traer todos los historiales y filtrar manualmente por DNI del
                    // paciente
                    // Esto evita problemas de Lazy Loading con la lista
                    // paciente.getHistorialesMedicos()
                    List<HistorialMedico> todosHistoriales = controlHistorial.findHistorialMedicoEntities();
                    Odontograma ultimoOdontograma = null;

                    // Iterar para encontrar el del paciente y que tenga odontograma
                    if (todosHistoriales != null) {
                        for (HistorialMedico h : todosHistoriales) {
                            if (h.getPaciente() != null && h.getPaciente().getDniPaciente().equals(dni)) {
                                if (h.getOdontograma() != null) {
                                    // Asumimos que el último encontrado en la lista (o ID más alto) es el reciente
                                    // Mejor estrategia: comparar IDs o fechas si es necesario.
                                    // Por ahora, nos quedamos con el último que aparezca en la iteración
                                    // (sobrescribiendo)
                                    // Ojo: JPA no garantiza orden. Deberíamos buscar el de ID mayor.
                                    // Lógica corregida: Priorizar Fecha Descendente, luego ID Descendente
                                    if (ultimoOdontograma == null) {
                                        ultimoOdontograma = h.getOdontograma();
                                    } else {
                                        HistorialMedico currentH = h;
                                        HistorialMedico lastH = ultimoOdontograma.getHistorialMedico();

                                        boolean isNewer = false;
                                        if (currentH.getFecha_registro() != null && lastH.getFecha_registro() != null) {
                                            if (currentH.getFecha_registro().after(lastH.getFecha_registro())) {
                                                isNewer = true;
                                            } else if (currentH.getFecha_registro().equals(lastH.getFecha_registro())) {
                                                if (currentH.getId() > lastH.getId()) {
                                                    isNewer = true;
                                                }
                                            }
                                        } else {
                                            // Fallback ID si falta fecha
                                            if (currentH.getId() > lastH.getId()) {
                                                isNewer = true;
                                            }
                                        }

                                        if (isNewer) {
                                            ultimoOdontograma = h.getOdontograma();
                                        }
                                    }
                                }
                            }
                        }
                    }

                    String jsonResponse = "{";
                    jsonResponse += "\"paciente\": {";
                    jsonResponse += "\"nombre\": \"" + paciente.getNombre() + "\",";
                    jsonResponse += "\"apellido\": \"" + paciente.getApellido() + "\"";
                    jsonResponse += "},"; // Cierre paciente

                    if (ultimoOdontograma != null) {
                        jsonResponse += "\"odontograma\": {";
                        jsonResponse += "\"id\": " + ultimoOdontograma.getId() + ",";
                        jsonResponse += "\"estadoDientes\": " + (ultimoOdontograma.getEstadoDientes() == null ? "{}"
                                : ultimoOdontograma.getEstadoDientes()) + ",";
                        jsonResponse += "\"observaciones\": \"" + (ultimoOdontograma.getObservaciones() == null ? ""
                                : ultimoOdontograma.getObservaciones()) + "\"";
                        jsonResponse += "}"; // Cierre odontograma
                    } else {
                        jsonResponse += "\"odontograma\": null";
                    }

                    jsonResponse += "}"; // Cierre root

                    response.getWriter().write(jsonResponse);

                } else {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    response.getWriter().write("{\"status\":\"error\", \"message\":\"Paciente no encontrado\"}");
                }
            } else {
                // Comportamiento 'legacy' o default si se quisiera mantener
                response.getWriter().write("{\"status\":\"error\", \"message\":\"DNI requerido\"}");
            }

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"status\":\"error\", \"message\":\"" + e.getMessage() + "\"}");
            e.printStackTrace();
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            String dni = request.getParameter("dni");
            String estadoDientes = request.getParameter("estadoDientes");
            String observaciones = request.getParameter("observaciones");

            // Validación
            if (dni == null || dni.isEmpty() || estadoDientes == null || estadoDientes.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter()
                        .write("{\"status\":\"error\", \"message\":\"Faltan datos (DNI o estado de dientes)\"}");
                return;
            }

            Paciente paciente = controlPaciente.findPaciente(dni);
            if (paciente == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("{\"status\":\"error\", \"message\":\"Paciente no encontrado\"}");
                return;
            }

            // Crear nuevo Historial Medico
            HistorialMedico historial = new HistorialMedico();
            historial.setFecha_registro(new Date());
            historial.setMotivo_consulta("Actualización de Odontograma");
            historial.setPaciente(paciente);
            // historial.setDiagnostico(...); // Podría venir de observaciones

            // Crear Odontograma
            Odontograma odontograma = new Odontograma();
            odontograma.setEstadoDientes(estadoDientes);
            odontograma.setObservaciones(observaciones);

            // Vincular (Bidireccional y Cascade)
            historial.setOdontograma(odontograma);
            odontograma.setHistorialMedico(historial); // Importante si la relación dueña requiere seteo

            // Persistir Historial (que por Cascade crea el Odontograma)
            // Asumimos que create() de Historial maneja cascade
            controlHistorial.create(historial);

            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter()
                    .write("{\"status\":\"success\", \"message\":\"Odontograma guardado correctamente en historia clínica\"}");

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"status\":\"error\", \"message\":\"" + e.getMessage() + "\"}");
            e.printStackTrace();
        }
    }

    @Override
    public String getServletInfo() {
        return "Servlet de Odontograma integrado con Pacientes";
    }
}
