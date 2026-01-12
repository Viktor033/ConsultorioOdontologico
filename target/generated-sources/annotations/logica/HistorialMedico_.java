package logica;

import java.util.Date;
import javax.annotation.Generated;
import javax.persistence.metamodel.SingularAttribute;
import javax.persistence.metamodel.StaticMetamodel;

@Generated(value = "org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
@StaticMetamodel(HistorialMedico.class)
public abstract class HistorialMedico_ {

	public static volatile SingularAttribute<HistorialMedico, String> motivo_consulta;
	public static volatile SingularAttribute<HistorialMedico, String> notas_adicionales;
	public static volatile SingularAttribute<HistorialMedico, Double> debe;
	public static volatile SingularAttribute<HistorialMedico, Double> saldo;
	public static volatile SingularAttribute<HistorialMedico, String> medicamentos;
	public static volatile SingularAttribute<HistorialMedico, String> tratamiento;
	public static volatile SingularAttribute<HistorialMedico, Double> haber;
	public static volatile SingularAttribute<HistorialMedico, Date> fecha_registro;
	public static volatile SingularAttribute<HistorialMedico, String> diagnostico;
	public static volatile SingularAttribute<HistorialMedico, Paciente> paciente;
	public static volatile SingularAttribute<HistorialMedico, Integer> numero_consulta;
	public static volatile SingularAttribute<HistorialMedico, Long> id;
	public static volatile SingularAttribute<HistorialMedico, Odontograma> odontograma;

	public static final String MOTIVO_CONSULTA = "motivo_consulta";
	public static final String NOTAS_ADICIONALES = "notas_adicionales";
	public static final String DEBE = "debe";
	public static final String SALDO = "saldo";
	public static final String MEDICAMENTOS = "medicamentos";
	public static final String TRATAMIENTO = "tratamiento";
	public static final String HABER = "haber";
	public static final String FECHA_REGISTRO = "fecha_registro";
	public static final String DIAGNOSTICO = "diagnostico";
	public static final String PACIENTE = "paciente";
	public static final String NUMERO_CONSULTA = "numero_consulta";
	public static final String ID = "id";
	public static final String ODONTOGRAMA = "odontograma";

}

