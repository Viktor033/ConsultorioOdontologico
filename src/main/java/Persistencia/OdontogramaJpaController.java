package Persistencia;

import Persistencia.exceptions.NonexistentEntityException;
import java.io.Serializable;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Query;
import javax.persistence.EntityNotFoundException;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import logica.Odontograma;

public class OdontogramaJpaController implements Serializable {

    public OdontogramaJpaController(EntityManagerFactory emf) {
        this.emf = emf;
    }

    private EntityManagerFactory emf = null;

    public EntityManager getEntityManager() {
        return emf.createEntityManager();
    }

    public OdontogramaJpaController() {
        emf = Persistencia.createEntityManagerFactory("ConsulOdontPU");
    }

    public void create(Odontograma odontograma) {
        EntityManager em = null;
        try {
            em = getEntityManager();
            em.getTransaction().begin();
            em.persist(odontograma);
            em.getTransaction().commit();
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }

    public void edit(Odontograma odontograma) throws NonexistentEntityException, Exception {
        EntityManager em = null;
        try {
            em = getEntityManager();
            em.getTransaction().begin();
            odontograma = em.merge(odontograma);
            em.getTransaction().commit();
        } catch (Exception ex) {
            String msg = ex.getLocalizedMessage();
            if (msg == null || msg.length() == 0) {
                Long id = odontograma.getId();
                if (findOdontograma(id) == null) {
                    throw new NonexistentEntityException("The odontograma with id " + id + " no longer exists.");
                }
            }
            throw ex;
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }

    public void destroy(Long id) throws NonexistentEntityException {
        EntityManager em = null;
        try {
            em = getEntityManager();
            em.getTransaction().begin();
            Odontograma odontograma;
            try {
                odontograma = em.getReference(Odontograma.class, id);
                odontograma.getId();
            } catch (EntityNotFoundException enfe) {
                throw new NonexistentEntityException("The odontograma with id " + id + " no longer exists.", enfe);
            }
            em.remove(odontograma);
            em.getTransaction().commit();
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }

    public List<Odontograma> findOdontogramaEntities() {
        return findOdontogramaEntities(true, -1, -1);
    }

    public List<Odontograma> findOdontogramaEntities(int maxResults, int firstResult) {
        return findOdontogramaEntities(false, maxResults, firstResult);
    }

    private List<Odontograma> findOdontogramaEntities(boolean all, int maxResults, int firstResult) {
        EntityManager em = getEntityManager();
        try {
            CriteriaQuery cq = em.getCriteriaBuilder().createQuery();
            cq.select(cq.from(Odontograma.class));
            Query q = em.createQuery(cq);
            if (!all) {
                q.setMaxResults(maxResults);
                q.setFirstResult(firstResult);
            }
            return q.getResultList();
        } finally {
            em.close();
        }
    }

    public Odontograma findOdontograma(Long id) {
        EntityManager em = getEntityManager();
        try {
            return em.find(Odontograma.class, id);
        } finally {
            em.close();
        }
    }

    public int getOdontogramaCount() {
        EntityManager em = getEntityManager();
        try {
            CriteriaQuery cq = em.getCriteriaBuilder().createQuery();
            Root<Odontograma> rt = cq.from(Odontograma.class);
            cq.select(em.getCriteriaBuilder().count(rt));
            Query q = em.createQuery(cq);
            return ((Long) q.getSingleResult()).intValue();
        } finally {
            em.close();
        }
    }

}
