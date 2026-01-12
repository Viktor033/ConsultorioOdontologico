package servlets;

import logica.Controladora;
import logica.HistorialMedico;
import logica.Paciente;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
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

@WebServlet(name = "SvHistorialMedico", urlPatterns = { "/SvHistorialMedico" })
public class SvHistorialMedico extends HttpServlet {

    Controladora control = new Controladora();

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            String idInfo = request.getParameter("id");
            String dni = request.getParameter("dni");

            if (idInfo != null) {
                long id = Long.parseLong(idInfo);
                HistorialMedico h = control.traerHistorialMedico(id);
                if (h != null) {
                    response.getWriter().write(toJson(h).toString());
                } else {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    response.getWriter().write("{\"error\": \"Historial no encontrado\"}");
                }
            } else if (dni != null) {
                List<HistorialMedico> listaHistorial = control.traerHistorialesPorPaciente(dni);
                response.getWriter().write(toJsonArray(listaHistorial).toString());
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"error\": \"Falta parámetro id o dni\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"Error al obtener historial: " + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            BufferedReader reader = request.getReader();
            StringBuilder buffer = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                buffer.append(line);
            }

            JsonReader jsonReader = Json.createReader(new StringReader(buffer.toString()));
            JsonObject jsonObject = jsonReader.readObject();
            jsonReader.close();

            // Extract data
            String dni = jsonObject.getString("dni");
            String fechaStr = jsonObject.getString("fecha");
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            Date fecha = sdf.parse(fechaStr);

            String motivo = jsonObject.getString("motivo");
            String diagnostico = jsonObject.getString("diagnostico", "");
            String tratamiento = jsonObject.getString("tratamiento", "");
            String medicamentos = jsonObject.getString("medicamentos", "");
            String notas = jsonObject.getString("notas", "");
            int numeroConsulta = jsonObject.getInt("numeroConsulta", 1);

            // Financial data
            Double debe = jsonObject.containsKey("debe") ? jsonObject.getJsonNumber("debe").doubleValue() : 0.0;
            Double haber = jsonObject.containsKey("haber") ? jsonObject.getJsonNumber("haber").doubleValue() : 0.0;
            Double saldo = jsonObject.containsKey("saldo") ? jsonObject.getJsonNumber("saldo").doubleValue() : 0.0;

            // Odontogram data
            JsonObject odontogramaObj = jsonObject.getJsonObject("odontograma");
            String estadoDientes = odontogramaObj != null ? odontogramaObj.toString() : "{}";
            String observacionesOdontograma = "";

            Paciente paciente = control.traerPaciente(dni);

            if (paciente != null) {
                control.crearHistorialMedicoConOdontograma(fecha, motivo, diagnostico, tratamiento, medicamentos, notas,
                        paciente, numeroConsulta, estadoDientes, observacionesOdontograma, debe, haber, saldo);

                response.setStatus(HttpServletResponse.SC_CREATED);
                response.getWriter().write("{\"message\": \"Consulta registrada correctamente\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("{\"error\": \"Paciente no encontrado\"}");
            }

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"Error al registrar consulta: " + e.getMessage() + "\"}");
            e.printStackTrace();
        }
    }

    // Helpers
    private javax.json.JsonArray toJsonArray(List<HistorialMedico> historial) {
        JsonArrayBuilder builder = Json.createArrayBuilder();
        for (HistorialMedico h : historial) {
            builder.add(toJson(h));
        }
        return builder.build();
    }

    private JsonObject toJson(HistorialMedico h) {
        JsonObjectBuilder builder = Json.createObjectBuilder();
        if (h.getId() != null)
            builder.add("id", h.getId());
        if (h.getFecha_registro() != null) {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
            builder.add("fecha_registro", sdf.format(h.getFecha_registro()));
        }
        if (h.getNumero_consulta() != null)
            builder.add("numero_consulta", h.getNumero_consulta());
        if (h.getMotivo_consulta() != null)
            builder.add("motivo_consulta", h.getMotivo_consulta());
        if (h.getDiagnostico() != null)
            builder.add("diagnostico", h.getDiagnostico());
        if (h.getTratamiento() != null)
            builder.add("tratamiento", h.getTratamiento());
        if (h.getMedicamentos() != null)
            builder.add("medicamentos", h.getMedicamentos());
        if (h.getNotas_adicionales() != null)
            builder.add("notas_adicionales", h.getNotas_adicionales());

        if (h.getDebe() != null)
            builder.add("debe", h.getDebe());
        if (h.getHaber() != null)
            builder.add("haber", h.getHaber());
        if (h.getSaldo() != null)
            builder.add("saldo", h.getSaldo());

        if (h.getOdontograma() != null) {
            JsonObjectBuilder odontoBuilder = Json.createObjectBuilder();
            String estado = h.getOdontograma().getEstadoDientes();
            odontoBuilder.add("estadoDientes", estado != null ? estado : "{}");
            builder.add("odontograma", odontoBuilder);
        }

        return builder.build();
    }

    @Override
    public String getServletInfo() {
        return "Servlet for Clinical History";
    }
}
