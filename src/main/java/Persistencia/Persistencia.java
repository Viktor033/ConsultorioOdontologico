package Persistencia;

import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;

public class Persistencia {

    private static EntityManagerFactory emf = null;

    public static synchronized EntityManagerFactory createEntityManagerFactory(String pu) {
        if (emf == null) {
            System.out.println("Iniciando creación de EntityManagerFactory para: " + pu);
            try {
                emf = Persistence.createEntityManagerFactory(pu);
                System.out.println("EntityManagerFactory CREADO EXITOSAMENTE");
            } catch (Exception e) {
                System.out.println("ERROR AL CREAR EntityManagerFactory: " + e.getMessage());
                e.printStackTrace();
                throw e;
            }
        }
        return emf;
    }

}
