package logica;

import javax.annotation.Generated;
import javax.persistence.metamodel.SingularAttribute;
import javax.persistence.metamodel.StaticMetamodel;

@Generated(value = "org.hibernate.jpamodelgen.JPAMetaModelEntityProcessor")
@StaticMetamodel(Usuario.class)
public abstract class Usuario_ {

	public static volatile SingularAttribute<Usuario, Integer> id_usuario;
	public static volatile SingularAttribute<Usuario, String> contrasenia;
	public static volatile SingularAttribute<Usuario, String> nombreUsuario;
	public static volatile SingularAttribute<Usuario, String> rol;

	public static final String ID_USUARIO = "id_usuario";
	public static final String CONTRASENIA = "contrasenia";
	public static final String NOMBRE_USUARIO = "nombreUsuario";
	public static final String ROL = "rol";

}

