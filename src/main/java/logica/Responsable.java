package logica;

import java.util.Date;
import javax.persistence.Entity;

@Entity
public class Responsable extends Persona {

    private String tipo_resp;

    public Responsable() {
    }

    // Constructor corregido para recibir 'dni' en lugar de 'id'

    public Responsable(String tipo_resp, String dni, String nombre, String apellido, String telefono, String direccion, Date fecha_nac) {
        super(dni, nombre, apellido, telefono, direccion, fecha_nac);
        this.tipo_resp = tipo_resp;
    }

    //Getther & Setther

    public String getTipo_resp() {
        return tipo_resp;
    }

    public void setTipo_resp(String tipo_resp) {
        this.tipo_resp = tipo_resp;
    }
    
}
