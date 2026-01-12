package servlets;

import logica.Controladora;
import logica.Paciente;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
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

@WebServlet(name = "SvPaciente", urlPatterns = { "/SvPaciente" })
public class SvPaciente extends HttpServlet {

    private Controladora control;

    @Override
    public void init() throws ServletException {
        try {
            System.out.println("Iniciando Servlet SvPaciente...");
            control = new Controladora();
            System.out.println("Controladora iniciada correctamente en SvPaciente");
        } catch (Exception e) {
            System.out.println("ERROR CRÍTICO al iniciar Controladora en SvPaciente: " + e.getMessage());
            e.printStackTrace();
        }
    }

    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            String dni = request.getParameter("dni");

            if (dni != null) {
                // Traer un paciente específico
                Paciente pac = control.traerPaciente(dni);
                if (pac != null) {
                    response.getWriter().write(toJson(pac).toString());
                } else {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    response.getWriter().write("{\"error\": \"Paciente no encontrado\"}");
                }
            } else {
                // Traer todos los pacientes
                List<Paciente> listaPacientes = control.traerPacientes();
                response.getWriter().write(toJsonArray(listaPacientes).toString());
            }
        } catch (Exception e) {
            System.out.println("Error en SvPaciente doGet: ");
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            // Leer el cuerpo de la petición (JSON)
            BufferedReader reader = request.getReader();
            StringBuilder buffer = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                buffer.append(line);
            }

            String jsonReceived = buffer.toString();
            System.out.println("JSON Recibido en SvPaciente: " + jsonReceived);

            JsonReader jsonReader = Json.createReader(new StringReader(jsonReceived));
            JsonObject jsonObject = jsonReader.readObject();
            jsonReader.close();

            String dni = jsonObject.getString("dniPaciente", "");
            if (dni.isEmpty())
                dni = jsonObject.getString("dni", ""); // Fallback

            System.out.println("Intentando crear paciente con DNI: " + dni);

            Paciente existente = control.traerPaciente(dni);
            if (existente != null) {
                System.out.println("Conflicto: Paciente ya existe");
                response.setStatus(HttpServletResponse.SC_CONFLICT);
                response.getWriter().write("{\"error\": \"El paciente con DNI " + dni + " ya existe.\"}");
                return;
            }

            // Parse Date
            String fechaStr = jsonObject.getString("fecha_nac", "");
            System.out.println("Fecha recibida: " + fechaStr);

            java.util.Date fecha = null;
            if (!fechaStr.isEmpty()) {
                try {
                    fecha = java.sql.Date.valueOf(fechaStr);
                } catch (Exception e) {
                    System.out.println("Error parseando fecha: " + e.getMessage());
                }
            }

            control.crearPaciente(
                    dni,
                    jsonObject.getString("nombre", ""),
                    jsonObject.getString("apellido", ""),
                    jsonObject.getString("telefono", ""),
                    jsonObject.getString("direccion", ""),
                    fecha,
                    jsonObject.getString("email", ""),
                    jsonObject.getString("obraSocial", ""),
                    jsonObject.getString("antecedents", "{}"));

            System.out.println("Paciente creado EXITOSAMENTE en lógica");

            response.setStatus(HttpServletResponse.SC_CREATED);
            response.getWriter().write("{\"message\": \"Paciente creado correctamente\"}");

        } catch (Exception e) {
            System.out.println("Excepción en SvPaciente doPost: ");
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"Error al crear paciente: " + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            // Leer el cuerpo de la petición (JSON)
            BufferedReader reader = request.getReader();
            StringBuilder buffer = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                buffer.append(line);
            }

            JsonReader jsonReader = Json.createReader(new StringReader(buffer.toString()));
            JsonObject jsonObject = jsonReader.readObject();
            jsonReader.close();

            // Reconstruir objeto paciente para editar
            String dni = jsonObject.getString("dniPaciente", "");
            if (dni.isEmpty())
                dni = jsonObject.getString("dni", "");

            Paciente paciente = control.traerPaciente(dni);
            if (paciente != null) {
                paciente.setNombre(jsonObject.getString("nombre", paciente.getNombre()));
                paciente.setApellido(jsonObject.getString("apellido", paciente.getApellido()));
                paciente.setTelefono(jsonObject.getString("telefono", paciente.getTelefono()));
                paciente.setDireccion(jsonObject.getString("direccion", paciente.getDireccion()));
                paciente.setEmail(jsonObject.getString("email", paciente.getEmail()));
                paciente.setObraSocial(jsonObject.getString("obraSocial", paciente.getObraSocial()));
                // Preserve existing antecedents if not sent, or update if sent
                if (jsonObject.containsKey("antecedents")) {
                    paciente.setAntecedents(jsonObject.getString("antecedents"));
                }

                String fechaStr = jsonObject.getString("fecha_nac", "");
                if (!fechaStr.isEmpty()) {
                    paciente.setFecha_nac(java.sql.Date.valueOf(fechaStr));
                }

                control.editarPaciente(paciente);
                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write("{\"message\": \"Paciente actualizado correctamente\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("{\"error\": \"Paciente no encontrado\"}");
            }

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"error\": \"Error al actualizar paciente: " + e.getMessage() + "\"}");
        }
    }

    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String dni = request.getParameter("dni");

        if (dni != null) {
            try {
                control.eliminarPaciente(dni);
                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write("{\"message\": \"Paciente eliminado correctamente\"}");
            } catch (Exception e) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                response.getWriter().write("{\"error\": \"Error al eliminar paciente: " + e.getMessage() + "\"}");
            }
        } else {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\": \"DNI es requerido\"}");
        }
    }

    // Helpers para JSON manual
    private javax.json.JsonArray toJsonArray(List<Paciente> pacientes) {
        JsonArrayBuilder builder = Json.createArrayBuilder();
        for (Paciente p : pacientes) {
            builder.add(toJson(p));
        }
        return builder.build();
    }

    private JsonObject toJson(Paciente p) {
        JsonObjectBuilder builder = Json.createObjectBuilder();
        if (p.getDniPaciente() != null)
            builder.add("dniPaciente", p.getDniPaciente());
        if (p.getNombre() != null)
            builder.add("nombre", p.getNombre());
        if (p.getApellido() != null)
            builder.add("apellido", p.getApellido());
        if (p.getTelefono() != null)
            builder.add("telefono", p.getTelefono());
        if (p.getEmail() != null)
            builder.add("email", p.getEmail());
        if (p.getDireccion() != null)
            builder.add("direccion", p.getDireccion());
        if (p.getObraSocial() != null)
            builder.add("obraSocial", p.getObraSocial());
        if (p.getAntecedents() != null)
            builder.add("antecedents", p.getAntecedents());
        if (p.getFecha_nac() != null) {
            // Force format yyyy-MM-dd
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd");
            builder.add("fecha_nac", sdf.format(p.getFecha_nac()));
        }
        return builder.build();
    }

    @Override
    public String getServletInfo() {
        return "Short description";
    }
}
