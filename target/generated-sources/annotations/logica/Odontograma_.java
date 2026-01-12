package logica;

import javax.annotation.Generated;
import javax.persistence.metamodel.SingularAttribute;
import javax.persistence.metamodel.StaticMetamodel;

@Generated(value = "org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
@StaticMetamodel(Odontograma.class)
public abstract class Odontograma_ {

	public static volatile SingularAttribute<Odontograma, HistorialMedico> historialMedico;
	public static volatile SingularAttribute<Odontograma, String> estadoDientes;
	public static volatile SingularAttribute<Odontograma, String> observaciones;
	public static volatile SingularAttribute<Odontograma, Long> id;

	public static final String HISTORIAL_MEDICO = "historialMedico";
	public static final String ESTADO_DIENTES = "estadoDientes";
	public static final String OBSERVACIONES = "observaciones";
	public static final String ID = "id";

}

