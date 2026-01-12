package logica;

import java.util.Date;
import javax.annotation.Generated;
import javax.persistence.metamodel.SingularAttribute;
import javax.persistence.metamodel.StaticMetamodel;

@Generated(value = "org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
@StaticMetamodel(Persona.class)
public abstract class Persona_ {

	public static volatile SingularAttribute<Persona, Date> fecha_nac;
	public static volatile SingularAttribute<Persona, String> apellido;
	public static volatile SingularAttribute<Persona, String> direccion;
	public static volatile SingularAttribute<Persona, String> telefono;
	public static volatile SingularAttribute<Persona, String> nombre;
	public static volatile SingularAttribute<Persona, String> dni;

	public static final String FECHA_NAC = "fecha_nac";
	public static final String APELLIDO = "apellido";
	public static final String DIRECCION = "direccion";
	public static final String TELEFONO = "telefono";
	public static final String NOMBRE = "nombre";
	public static final String DNI = "dni";

}

