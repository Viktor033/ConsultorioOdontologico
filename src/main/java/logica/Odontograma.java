package logica;

import java.io.Serializable;
import javax.persistence.*;

@Entity
public class Odontograma implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con HistorialMedico - cada consulta tiene su odontograma
    @OneToOne
    @JoinColumn(name = "historial_id")
    private HistorialMedico historialMedico;

    // Estado de los dientes en formato JSON
    // Estructura: {"11": {"estado": "sano|caries|tratado|extraido", "tratamiento":
    // "descripcion"}, ...}
    @Column(length = 5000)
    private String estadoDientes;

    // Observaciones generales del odontograma
    @Column(length = 1000)
    private String observaciones;

    public Odontograma() {
        // Inicializar con odontograma vacío (todos los dientes sanos)
        this.estadoDientes = "{}";
    }

    public Odontograma(HistorialMedico historialMedico, String estadoDientes, String observaciones) {
        this.historialMedico = historialMedico;
        this.estadoDientes = estadoDientes != null ? estadoDientes : "{}";
        this.observaciones = observaciones;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public HistorialMedico getHistorialMedico() {
        return historialMedico;
    }

    public void setHistorialMedico(HistorialMedico historialMedico) {
        this.historialMedico = historialMedico;
    }

    public String getEstadoDientes() {
        return estadoDientes;
    }

    public void setEstadoDientes(String estadoDientes) {
        this.estadoDientes = estadoDientes;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
}