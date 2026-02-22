package servlets;

import java.io.IOException;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonReader;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import logica.Controladora;
import logica.Turno;
import logica.Paciente;

@WebServlet(name = "SvTurno", urlPatterns = { "/SvTurno" })
public class SvTurno extends HttpServlet {
    Controladora control = new Controladora();
    private final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Access-Control-Max-Age", "3600");
        response.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            List<Turno> listaTurnos = control.getTurnos();
            JsonArrayBuilder jsonArray = Json.createArrayBuilder();

            for (Turno t : listaTurnos) {
                JsonObjectBuilder turnoJson = Json.createObjectBuilder()
                        .add("id", t.getId_turno())
                        .add("fecha", dateFormat.format(t.getFecha_Turno()))
                        .add("hora", t.getHora_Turno())
                        .add("motivo", t.getAfeccion() != null ? t.getAfeccion() : "")
                        .add("estado", t.getEstado() != null ? t.getEstado().toString() : "PENDIENTE")
                        .add("observaciones", t.getObservaciones() != null ? t.getObservaciones() : "");

                if (t.getPacien() != null) {
                    turnoJson.add("paciente", Json.createObjectBuilder()
                            .add("dni", t.getPacien().getDniPaciente())
                            .add("nombre", t.getPacien().getNombre())
                            .add("apellido", t.getPacien().getApellido()));
                }

                jsonArray.add(turnoJson);
            }

            try (PrintWriter out = response.getWriter()) {
                out.print(jsonArray.build().toString());
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().print("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        try (JsonReader reader = Json.createReader(request.getReader())) {
            JsonObject json = reader.readObject();

            String fechaStr = json.getString("fecha");
            String hora = json.getString("hora");
            String dniPaciente = json.getString("dniPaciente");
            String motivo = json.getString("motivo");
            String estado = json.getString("estado");
            String observaciones = json.getString("observaciones");

            Date fecha = dateFormat.parse(fechaStr);
            Paciente pac = control.traerPaciente(dniPaciente);

            if (json.containsKey("id") && !json.isNull("id")) {
                int id = json.getInt("id");
                Turno t = control.traerTurno(id);
                if (t != null) {
                    t.setFecha_Turno(fecha);
                    t.setHora_Turno(hora);
                    t.setPacien(pac);
                    t.setAfeccion(motivo);
                    t.setEstado(Turno.EstadoTurno.valueOf(estado));
                    t.setObservaciones(observaciones);
                    control.editarTurno(t);
                }
            } else {
                Turno t = new Turno(fecha, hora, motivo, pac, observaciones);
                t.setEstado(Turno.EstadoTurno.valueOf(estado));
                control.crearTurno(t);
            }

            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().print("{\"mensaje\": \"Turno guardado correctamente\"}");

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().print("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}
