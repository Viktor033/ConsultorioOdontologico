package Persistencia;

import Persistencia.exceptions.NonexistentEntityException;
import Persistencia.exceptions.PreexistingEntityException;
import java.io.Serializable;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Query;
import javax.persistence.EntityNotFoundException;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import logica.Responsable;

public class ResponsableJpaController implements Serializable {

    public ResponsableJpaController(EntityManagerFactory emf) {
        this.emf = emf;
    }

    private EntityManagerFactory emf = null;

    public EntityManager getEntityManager() {
        return emf.createEntityManager();
    }

    public ResponsableJpaController() {
        emf = Persistencia.createEntityManagerFactory("ConsulOdontPU");
    }

    public void create(Responsable responsable) throws PreexistingEntityException, Exception {
        EntityManager em = null;
        try {
            em = getEntityManager();
            em.getTransaction().begin();
            em.persist(responsable);
            em.getTransaction().commit();
        } catch (Exception ex) {
            if (findResponsable(responsable.getDniPaciente()) != null) {
                throw new PreexistingEntityException("Responsable " + responsable + " already exists.", ex);
            }
            throw ex;
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }

    public void edit(Responsable responsable) throws NonexistentEntityException, Exception {
        EntityManager em = null;
        try {
            em = getEntityManager();
            em.getTransaction().begin();
            responsable = em.merge(responsable);
            em.getTransaction().commit();
        } catch (Exception ex) {
            String msg = ex.getLocalizedMessage();
            if (msg == null || msg.length() == 0) {
                String id = responsable.getDniPaciente();
                if (findResponsable(id) == null) {
                    throw new NonexistentEntityException("The responsable with id " + id + " no longer exists.");
                }
            }
            throw ex;
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }

    public void destroy(String id) throws NonexistentEntityException {
        EntityManager em = null;
        try {
            em = getEntityManager();
            em.getTransaction().begin();
            Responsable responsable;
            try {
                responsable = em.getReference(Responsable.class, id);
                responsable.getDniPaciente();
            } catch (EntityNotFoundException enfe) {
                throw new NonexistentEntityException("The responsable with id " + id + " no longer exists.", enfe);
            }
            em.remove(responsable);
            em.getTransaction().commit();
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }

    public List<Responsable> findResponsableEntities() {
        return findResponsableEntities(true, -1, -1);
    }

    public List<Responsable> findResponsableEntities(int maxResults, int firstResult) {
        return findResponsableEntities(false, maxResults, firstResult);
    }

    private List<Responsable> findResponsableEntities(boolean all, int maxResults, int firstResult) {
        EntityManager em = getEntityManager();
        try {
            CriteriaQuery cq = em.getCriteriaBuilder().createQuery();
            cq.select(cq.from(Responsable.class));
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

    public Responsable findResponsable(String id) {
        EntityManager em = getEntityManager();
        try {
            return em.find(Responsable.class, id);
        } finally {
            em.close();
        }
    }

    public int getResponsableCount() {
        EntityManager em = getEntityManager();
        try {
            CriteriaQuery cq = em.getCriteriaBuilder().createQuery();
            Root<Responsable> rt = cq.from(Responsable.class);
            cq.select(em.getCriteriaBuilder().count(rt));
            Query q = em.createQuery(cq);
            return ((Long) q.getSingleResult()).intValue();
        } finally {
            em.close();
        }
    }

}
