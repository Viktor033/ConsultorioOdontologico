package logica;

import java.io.Serializable;
import java.util.Date;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

@Entity
public class Turno implements Serializable {

    // Enum para el estado del turno
    public enum EstadoTurno {
        PENDIENTE,
        CONFIRMADO,
        COMPLETADO,
        CANCELADO
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id_turno;

    @Temporal(TemporalType.DATE)
    private Date fecha_Turno;
    private String hora_Turno;
    private String afeccion;

    @Enumerated(EnumType.STRING)
    private EstadoTurno estado;

    private String observaciones;

    @ManyToOne
    @JoinColumn(name = "id_paciente", referencedColumnName = "dni") // Relación con la entidad Paciente
    private Paciente pacien;

    public Turno() {
        this.estado = EstadoTurno.PENDIENTE; // Estado por defecto
    }

    // Constructor completo
    public Turno(Date fecha_Turno, String hora_Turno, String afeccion, Paciente pacien, String observaciones) {
        this.fecha_Turno = fecha_Turno;
        this.hora_Turno = hora_Turno;
        this.afeccion = afeccion;
        this.pacien = pacien;
        this.estado = EstadoTurno.PENDIENTE;
        this.observaciones = observaciones;
    }

    // Getters y Setters
    public int getId_turno() {
        return id_turno;
    }

    public void setId_turno(int id_turno) {
        this.id_turno = id_turno;
    }

    public Date getFecha_Turno() {
        return fecha_Turno;
    }

    public void setFecha_Turno(Date fecha_Turno) {
        this.fecha_Turno = fecha_Turno;
    }

    public String getHora_Turno() {
        return hora_Turno;
    }

    public void setHora_Turno(String hora_Turno) {
        this.hora_Turno = hora_Turno;
    }

    public String getAfeccion() {
        return afeccion;
    }

    public void setAfeccion(String afeccion) {
        this.afeccion = afeccion;
    }

    public EstadoTurno getEstado() {
        return estado;
    }

    public void setEstado(EstadoTurno estado) {
        this.estado = estado;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public Paciente getPacien() {
        return pacien;
    }

    public void setPacien(Paciente pacien) {
        this.pacien = pacien;
    }
}
