package logica;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;

@Entity
public class Paciente extends Persona {

    private String email;
    private String obraSocial;
    private String antecedents; // Stores JSON string of medical antecedents

    @OneToOne
    @javax.persistence.JoinColumn(name = "unResponnsable_dni", referencedColumnName = "dni")
    private Responsable unResponnsable;

    @OneToMany(mappedBy = "pacien", cascade = CascadeType.ALL)
    private List<Turno> listaTurno;

    @OneToMany(mappedBy = "paciente", cascade = CascadeType.ALL)
    private List<HistorialMedico> historialesMedicos;

    // Constructor vacío
    public Paciente() {
        super();
        this.listaTurno = new ArrayList<>();
        this.historialesMedicos = new ArrayList<>();
        this.antecedents = "{}";
    }

    // Constructor completo
    public Paciente(String dniPaciente, String nombre, String apellido, String telefono,
            String direccion, Date fecha_nac, String email, String obraSocial) {
        super(dniPaciente, nombre, apellido, telefono, direccion, fecha_nac);
        this.email = email;
        this.obraSocial = obraSocial;
        this.listaTurno = new ArrayList<>();
        this.historialesMedicos = new ArrayList<>();
        this.antecedents = "{}";
    }

    // Constructor simplificado
    public Paciente(String dniPaciente, String nombre, String apellido) {
        super(dniPaciente, nombre, apellido, null, null, null);
        this.listaTurno = new ArrayList<>();
        this.historialesMedicos = new ArrayList<>();
        this.antecedents = "{}";
    }

    // Getters y Setters

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getObraSocial() {
        return obraSocial;
    }

    public void setObraSocial(String obraSocial) {
        this.obraSocial = obraSocial;
    }

    public String getAntecedents() {
        return antecedents;
    }

    public void setAntecedents(String antecedents) {
        this.antecedents = antecedents;
    }

    public Responsable getUnResponnsable() {
        return unResponnsable;
    }

    public void setUnResponnsable(Responsable unResponnsable) {
        this.unResponnsable = unResponnsable;
    }

    public List<Turno> getListaTurno() {
        return listaTurno;
    }

    public void setListaTurno(List<Turno> listaTurno) {
        this.listaTurno = listaTurno;
    }

    public List<HistorialMedico> getHistorialesMedicos() {
        return historialesMedicos;
    }

    public void setHistorialesMedicos(List<HistorialMedico> historialesMedicos) {
        this.historialesMedicos = historialesMedicos;
    }
}