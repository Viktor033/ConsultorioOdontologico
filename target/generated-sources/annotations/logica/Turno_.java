package logica;

import java.util.Date;
import javax.annotation.Generated;
import javax.persistence.metamodel.SingularAttribute;
import javax.persistence.metamodel.StaticMetamodel;
import logica.Turno.EstadoTurno;

@Generated(value = "org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
@StaticMetamodel(Turno.class)
public abstract class Turno_ {

	public static volatile SingularAttribute<Turno, String> afeccion;
	public static volatile SingularAttribute<Turno, EstadoTurno> estado;
	public static volatile SingularAttribute<Turno, Paciente> pacien;
	public static volatile SingularAttribute<Turno, String> observaciones;
	public static volatile SingularAttribute<Turno, Date> fecha_Turno;
	public static volatile SingularAttribute<Turno, Integer> id_turno;
	public static volatile SingularAttribute<Turno, String> hora_Turno;

	public static final String AFECCION = "afeccion";
	public static final String ESTADO = "estado";
	public static final String PACIEN = "pacien";
	public static final String OBSERVACIONES = "observaciones";
	public static final String FECHA__TURNO = "fecha_Turno";
	public static final String ID_TURNO = "id_turno";
	public static final String HORA__TURNO = "hora_Turno";

}

