package logica;

import Persistencia.ControladoraPersistencia;
import java.util.Date;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

public class Controladora {

    ControladoraPersistencia controlPersis = new ControladoraPersistencia();

    // ============== MÉTODOS CRUD PACIENTE ==============

    public void crearPaciente(String dniPaciente, String nombre, String apellido,
            String telefono, String direccion, Date fecha_nac,
            String email, String obraSocial, String antecedents) throws Exception {
        Paciente pacien = new Paciente(dniPaciente, nombre, apellido, telefono,
                direccion, fecha_nac, email, obraSocial);
        pacien.setAntecedents(antecedents != null ? antecedents : "{}");
        controlPersis.crearPaciente(pacien);
    }

    public List<Paciente> traerPacientes() {
        return controlPersis.traerPacientes();
    }

    public Paciente traerPaciente(String dni) {
        return controlPersis.traerPaciente(dni);
    }

    public void editarPaciente(Paciente paciente) {
        try {
            controlPersis.editarPaciente(paciente);
        } catch (Exception ex) {
            Logger.getLogger(Controladora.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    public void eliminarPaciente(String dni) {
        try {
            controlPersis.eliminarPaciente(dni);
        } catch (Exception ex) {
            Logger.getLogger(Controladora.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    public List<Paciente> buscarPacientes(String criterio) {
        return controlPersis.buscarPacientes(criterio);
    }

    // ============== MÉTODOS CRUD TURNO ==============

    public void crearTurno(Turno turno) {
        try {
            controlPersis.crearTurno(turno);
        } catch (Exception ex) {
            Logger.getLogger(Controladora.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    public List<Turno> getTurnos() {
        return controlPersis.traerTurnos();
    }

    public List<Turno> traerTurnos() {
        return controlPersis.traerTurnos();
    }

    public Turno traerTurno(int id) {
        return controlPersis.traerTurno(id);
    }

    public void editarTurno(Turno turno) {
        try {
            controlPersis.editarTurno(turno);
        } catch (Exception ex) {
            Logger.getLogger(Controladora.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    public void eliminarTurno(int id) {
        try {
            controlPersis.eliminarTurno(id);
        } catch (Exception ex) {
            Logger.getLogger(Controladora.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    public List<Turno> traerTurnosPorFecha(Date fecha) {
        return controlPersis.traerTurnosPorFecha(fecha);
    }

    public List<Turno> traerTurnosPorPaciente(String dniPaciente) {
        return controlPersis.traerTurnosPorPaciente(dniPaciente);
    }

    // ============== MÉTODOS CRUD HISTORIAL MÉDICO ==============

    public void crearHistorialMedico(Date fecha, String motivo, String diagnostico,
            String tratamiento, String medicamentos,
            String notas, Paciente paciente, Integer numeroConsulta) {
        try {
            HistorialMedico historial = new HistorialMedico(fecha, motivo, diagnostico,
                    tratamiento, medicamentos, notas,
                    paciente, numeroConsulta);
            controlPersis.crearHistorialMedico(historial);
        } catch (Exception ex) {
            Logger.getLogger(Controladora.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    public List<HistorialMedico> traerHistorialesMedicos() {
        return controlPersis.traerHistorialesMedicos();
    }

    public HistorialMedico traerHistorialMedico(Long id) {
        return controlPersis.traerHistorialMedico(id);
    }

    public void editarHistorialMedico(HistorialMedico historial) {
        try {
            controlPersis.editarHistorialMedico(historial);
        } catch (Exception ex) {
            Logger.getLogger(Controladora.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    public void eliminarHistorialMedico(Long id) {
        try {
            controlPersis.eliminarHistorialMedico(id);
        } catch (Exception ex) {
            Logger.getLogger(Controladora.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    public List<HistorialMedico> traerHistorialesPorPaciente(String dniPaciente) {
        return controlPersis.traerHistorialesPorPaciente(dniPaciente);
    }

    public void crearHistorialMedicoConOdontograma(Date fecha, String motivo, String diagnostico,
            String tratamiento, String medicamentos,
            String notas, Paciente paciente, Integer numeroConsulta, String estadoDientes,
            String observacionesOdontograma, Double debe, Double haber, Double saldo) {
        try {
            HistorialMedico historial = new HistorialMedico(fecha, motivo, diagnostico,
                    tratamiento, medicamentos, notas,
                    paciente, numeroConsulta);

            historial.setDebe(debe);
            historial.setHaber(haber);
            historial.setSaldo(saldo);

            Odontograma odonto = new Odontograma(historial, estadoDientes, observacionesOdontograma);
            historial.setOdontograma(odonto);

            controlPersis.crearHistorialMedico(historial);
        } catch (Exception ex) {
            Logger.getLogger(Controladora.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    // ============== MÉTODOS CRUD ODONTOGRAMA ==============

    public void crearOdontograma(HistorialMedico historial, String estadoDientes, String observaciones) {
        try {
            Odontograma odonto = new Odontograma(historial, estadoDientes, observaciones);
            controlPersis.crearOdontograma(odonto);
        } catch (Exception ex) {
            Logger.getLogger(Controladora.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    public Odontograma traerOdontograma(Long id) {
        return controlPersis.traerOdontograma(id);
    }

    public void editarOdontograma(Odontograma odonto) {
        try {
            controlPersis.editarOdontograma(odonto);
        } catch (Exception ex) {
            Logger.getLogger(Controladora.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
}
