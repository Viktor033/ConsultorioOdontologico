package logica;

import javax.annotation.Generated;
import javax.persistence.metamodel.ListAttribute;
import javax.persistence.metamodel.SingularAttribute;
import javax.persistence.metamodel.StaticMetamodel;

@Generated(value = "org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
@StaticMetamodel(Paciente.class)
public abstract class Paciente_ extends logica.Persona_ {

	public static volatile ListAttribute<Paciente, HistorialMedico> historialesMedicos;
	public static volatile SingularAttribute<Paciente, String> obraSocial;
	public static volatile SingularAttribute<Paciente, Responsable> unResponnsable;
	public static volatile ListAttribute<Paciente, Turno> listaTurno;
	public static volatile SingularAttribute<Paciente, String> email;
	public static volatile SingularAttribute<Paciente, String> antecedents;

	public static final String HISTORIALES_MEDICOS = "historialesMedicos";
	public static final String OBRA_SOCIAL = "obraSocial";
	public static final String UN_RESPONNSABLE = "unResponnsable";
	public static final String LISTA_TURNO = "listaTurno";
	public static final String EMAIL = "email";
	public static final String ANTECEDENTS = "antecedents";

}

