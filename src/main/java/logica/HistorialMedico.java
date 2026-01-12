package logica;

import java.io.Serializable;
import java.util.Date;
import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

@Entity
public class HistorialMedico implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Clave primaria única

    @Temporal(TemporalType.DATE)
    private Date fecha_registro;

    private String motivo_consulta;
    private String diagnostico;
    private String tratamiento;
    private String medicamentos;
    private String notas_adicionales;

    private Double debe;
    private Double haber;
    private Double saldo;

    private Integer numero_consulta; // Para ordenar las consultas del paciente

    @ManyToOne
    @JoinColumn(name = "dni_paciente", referencedColumnName = "dni")
    private Paciente paciente;

    // Relación OneToOne con Odontograma - cada consulta tiene su odontograma
    @OneToOne(mappedBy = "historialMedico", cascade = CascadeType.ALL, orphanRemoval = true)
    private Odontograma odontograma;

    // Constructor vacío
    public HistorialMedico() {
    }

    // Constructor con parámetros
    public HistorialMedico(Date fecha_registro, String motivo_consulta, String diagnostico,
            String tratamiento, String medicamentos, String notas_adicionales,
            Paciente paciente, Integer numero_consulta) {
        this.fecha_registro = fecha_registro;
        this.motivo_consulta = motivo_consulta;
        this.diagnostico = diagnostico;
        this.tratamiento = tratamiento;
        this.medicamentos = medicamentos;
        this.notas_adicionales = notas_adicionales;
        this.paciente = paciente;
        this.numero_consulta = numero_consulta;
    }

    // Getters y Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Date getFecha_registro() {
        return fecha_registro;
    }

    public void setFecha_registro(Date fecha_registro) {
        this.fecha_registro = fecha_registro;
    }

    public String getMotivo_consulta() {
        return motivo_consulta;
    }

    public void setMotivo_consulta(String motivo_consulta) {
        this.motivo_consulta = motivo_consulta;
    }

    public String getDiagnostico() {
        return diagnostico;
    }

    public void setDiagnostico(String diagnostico) {
        this.diagnostico = diagnostico;
    }

    public String getTratamiento() {
        return tratamiento;
    }

    public void setTratamiento(String tratamiento) {
        this.tratamiento = tratamiento;
    }

    public String getMedicamentos() {
        return medicamentos;
    }

    public void setMedicamentos(String medicamentos) {
        this.medicamentos = medicamentos;
    }

    public String getNotas_adicionales() {
        return notas_adicionales;
    }

    public void setNotas_adicionales(String notas_adicionales) {
        this.notas_adicionales = notas_adicionales;
    }

    public Double getDebe() {
        return debe;
    }

    public void setDebe(Double debe) {
        this.debe = debe;
    }

    public Double getHaber() {
        return haber;
    }

    public void setHaber(Double haber) {
        this.haber = haber;
    }

    public Double getSaldo() {
        return saldo;
    }

    public void setSaldo(Double saldo) {
        this.saldo = saldo;
    }

    public Integer getNumero_consulta() {
        return numero_consulta;
    }

    public void setNumero_consulta(Integer numero_consulta) {
        this.numero_consulta = numero_consulta;
    }

    public Paciente getPaciente() {
        return paciente;
    }

    public void setPaciente(Paciente paciente) {
        this.paciente = paciente;
    }

    public Odontograma getOdontograma() {
        return odontograma;
    }

    public void setOdontograma(Odontograma odontograma) {
        this.odontograma = odontograma;
        if (odontograma != null) {
            odontograma.setHistorialMedico(this);
        }
    }
}
