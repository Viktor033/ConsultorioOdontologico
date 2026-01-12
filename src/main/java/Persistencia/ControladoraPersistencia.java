package Persistencia;

import logica.HistorialMedico;
import logica.Odontograma;
import logica.Paciente;
import logica.Turno;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import javax.persistence.EntityManager;

public class ControladoraPersistencia {

    HorarioJpaController horaJPA = new HorarioJpaController();
    HistorialMedicoJpaController historialJPA = new HistorialMedicoJpaController();
    OdontogramaJpaController odontograJPA = new OdontogramaJpaController();
    PacienteJpaController pacienteJPA = new PacienteJpaController();
    PersonaJpaController personaJPA = new PersonaJpaController();
    ResponsableJpaController responsableJPA = new ResponsableJpaController();
    TurnoJpaController turnoJPA = new TurnoJpaController();

    // ============== MÉTODOS CRUD PACIENTE ==============

    public void crearPaciente(Paciente pacien) throws Exception {
        pacienteJPA.create(pacien);
    }

    public List<Paciente> traerPacientes() {
        return pacienteJPA.findPacienteEntities();
    }

    public Paciente traerPaciente(String dni) {
        return pacienteJPA.findPaciente(dni);
    }

    public void editarPaciente(Paciente paciente) throws Exception {
        pacienteJPA.edit(paciente);
    }

    public void eliminarPaciente(String dni) throws Exception {
        pacienteJPA.destroy(dni);
    }

    public List<Paciente> buscarPacientes(String criterio) {
        List<Paciente> todos = pacienteJPA.findPacienteEntities();
        String criterioBajo = criterio.toLowerCase();

        return todos.stream()
                .filter(p -> p.getNombre().toLowerCase().contains(criterioBajo) ||
                        p.getApellido().toLowerCase().contains(criterioBajo) ||
                        p.getDniPaciente().contains(criterio))
                .collect(Collectors.toList());
    }

    // ============== MÉTODOS CRUD TURNO ==============

    public void crearTurno(Turno turno) throws Exception {
        turnoJPA.create(turno);
    }

    public List<Turno> traerTurnos() {
        return turnoJPA.findTurnoEntities();
    }

    public Turno traerTurno(int id) {
        return turnoJPA.findTurno(id);
    }

    public void editarTurno(Turno turno) throws Exception {
        turnoJPA.edit(turno);
    }

    public void eliminarTurno(int id) throws Exception {
        turnoJPA.destroy(id);
    }

    public List<Turno> traerTurnosPorFecha(Date fecha) {
        List<Turno> todos = turnoJPA.findTurnoEntities();

        return todos.stream()
                .filter(t -> {
                    if (t.getFecha_Turno() == null || fecha == null)
                        return false;
                    // Comparar solo año, mes y día
                    return t.getFecha_Turno().getYear() == fecha.getYear() &&
                            t.getFecha_Turno().getMonth() == fecha.getMonth() &&
                            t.getFecha_Turno().getDate() == fecha.getDate();
                })
                .collect(Collectors.toList());
    }

    public List<Turno> traerTurnosPorPaciente(String dniPaciente) {
        List<Turno> todos = turnoJPA.findTurnoEntities();

        return todos.stream()
                .filter(t -> t.getPacien() != null &&
                        t.getPacien().getDniPaciente().equals(dniPaciente))
                .collect(Collectors.toList());
    }

    // ============== MÉTODOS CRUD HISTORIAL MÉDICO ==============

    public void crearHistorialMedico(HistorialMedico historial) throws Exception {
        historialJPA.create(historial);
    }

    public List<HistorialMedico> traerHistorialesMedicos() {
        return historialJPA.findHistorialMedicoEntities();
    }

    public HistorialMedico traerHistorialMedico(Long id) {
        return historialJPA.findHistorialMedico(id);
    }

    public void editarHistorialMedico(HistorialMedico historial) throws Exception {
        historialJPA.edit(historial);
    }

    public void eliminarHistorialMedico(Long id) throws Exception {
        historialJPA.destroy(id);
    }

    public List<HistorialMedico> traerHistorialesPorPaciente(String dniPaciente) {
        List<HistorialMedico> todos = historialJPA.findHistorialMedicoEntities();

        return todos.stream()
                .filter(h -> h.getPaciente() != null &&
                        h.getPaciente().getDniPaciente().equals(dniPaciente))
                .sorted((h1, h2) -> {
                    // Ordenar por número de consulta
                    if (h1.getNumero_consulta() == null)
                        return 1;
                    if (h2.getNumero_consulta() == null)
                        return -1;
                    return h1.getNumero_consulta().compareTo(h2.getNumero_consulta());
                })
                .collect(Collectors.toList());
    }

    // ============== MÉTODOS CRUD ODONTOGRAMA ==============

    public void crearOdontograma(Odontograma odonto) throws Exception {
        odontograJPA.create(odonto);
    }

    public Odontograma traerOdontograma(Long id) {
        return odontograJPA.findOdontograma(id);
    }

    public void editarOdontograma(Odontograma odonto) throws Exception {
        odontograJPA.edit(odonto);
    }
}
