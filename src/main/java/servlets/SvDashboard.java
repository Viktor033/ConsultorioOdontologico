package servlets;

import java.io.IOException;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import logica.Controladora;
import logica.Paciente;
import logica.Turno;
import logica.HistorialMedico;

@WebServlet(name = "SvDashboard", urlPatterns = { "/SvDashboard" })
public class SvDashboard extends HttpServlet {
    Controladora control = new Controladora();
    private final SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");
    private final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            Date hoy = new Date();

            // 1. Estadísticas Básicas
            List<Paciente> todosPacientes = control.traerPacientes();
            List<Turno> todosTurnos = control.traerTurnos();
            List<Turno> turnosHoy = control.traerTurnosPorFecha(hoy);
            List<HistorialMedico> todosHistoriales = control.traerHistorialesMedicos();

            // Consultas del mes actual
            Calendar cal = Calendar.getInstance();
            int mesActual = cal.get(Calendar.MONTH);
            int anioActual = cal.get(Calendar.YEAR);

            long consultasMes = todosHistoriales.stream()
                    .filter(h -> {
                        Calendar c = Calendar.getInstance();
                        c.setTime(h.getFecha_registro());
                        return c.get(Calendar.MONTH) == mesActual && c.get(Calendar.YEAR) == anioActual;
                    }).count();

            long pendientes = todosTurnos.stream()
                    .filter(t -> t.getEstado() == Turno.EstadoTurno.PENDIENTE)
                    .count();

            // 2. Próximos Turnos (Hoy)
            JsonArrayBuilder jsonTurnos = Json.createArrayBuilder();
            for (Turno t : turnosHoy) {
                JsonObjectBuilder tJson = Json.createObjectBuilder()
                        .add("hora", t.getHora_Turno())
                        .add("paciente",
                                t.getPacien() != null ? (t.getPacien().getNombre() + " " + t.getPacien().getApellido())
                                        : "Sin Paciente")
                        .add("motivo", t.getAfeccion() != null ? t.getAfeccion() : "")
                        .add("estado", t.getEstado() != null ? t.getEstado().toString() : "PENDIENTE");
                jsonTurnos.add(tJson);
            }

            // 3. Pacientes Recientes (últimos 5)
            JsonArrayBuilder jsonPacientes = Json.createArrayBuilder();
            int limit = Math.min(todosPacientes.size(), 5);
            // JPA suele traer en orden de ID, invertimos para "recientes"
            for (int i = todosPacientes.size() - 1; i >= todosPacientes.size() - limit; i--) {
                Paciente p = todosPacientes.get(i);
                JsonObjectBuilder pJson = Json.createObjectBuilder()
                        .add("dni", p.getDniPaciente())
                        .add("nombre", p.getNombre())
                        .add("apellido", p.getApellido())
                        .add("telefono", p.getTelefono() != null ? p.getTelefono() : "-")
                        .add("email", p.getEmail() != null ? p.getEmail() : "-");
                jsonPacientes.add(pJson);
            }

            // Construir respuesta final
            JsonObject dashboardData = Json.createObjectBuilder()
                    .add("stats", Json.createObjectBuilder()
                            .add("totalPacientes", todosPacientes.size())
                            .add("turnosHoy", turnosHoy.size())
                            .add("consultasMes", consultasMes)
                            .add("pendientes", pendientes))
                    .add("proximosTurnos", jsonTurnos)
                    .add("pacientesRecientes", jsonPacientes)
                    .build();

            try (PrintWriter out = response.getWriter()) {
                out.print(dashboardData.toString());
            }

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().print("{\"error\": \"" + e.getMessage() + "\"}");
            e.printStackTrace();
        }
    }
}
