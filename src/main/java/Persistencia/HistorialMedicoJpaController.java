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
import logica.HistorialMedico;

public class HistorialMedicoJpaController implements Serializable {

    public HistorialMedicoJpaController(EntityManagerFactory emf) {
        this.emf = emf;
    }

    private EntityManagerFactory emf = null;

    public EntityManager getEntityManager() {
        return emf.createEntityManager();
    }

    public HistorialMedicoJpaController() {
        emf = Persistencia.createEntityManagerFactory("ConsulOdontPU");
    }

    public void create(HistorialMedico historialMedico) {
        EntityManager em = null;
        try {
            em = getEntityManager();
            em.getTransaction().begin();
            em.persist(historialMedico);
            em.getTransaction().commit();
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }

    public void edit(HistorialMedico historialMedico) throws NonexistentEntityException, Exception {
        EntityManager em = null;
        try {
            em = getEntityManager();
            em.getTransaction().begin();
            historialMedico = em.merge(historialMedico);
            em.getTransaction().commit();
        } catch (Exception ex) {
            String msg = ex.getLocalizedMessage();
            if (msg == null || msg.length() == 0) {
                Long id = historialMedico.getId();
                if (findHistorialMedico(id) == null) {
                    throw new NonexistentEntityException("The historialMedico with id " + id + " no longer exists.");
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
            HistorialMedico historialMedico;
            try {
                historialMedico = em.getReference(HistorialMedico.class, id);
                historialMedico.getId();
            } catch (EntityNotFoundException enfe) {
                throw new NonexistentEntityException("The historialMedico with id " + id + " no longer exists.", enfe);
            }
            em.remove(historialMedico);
            em.getTransaction().commit();
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }

    public List<HistorialMedico> findHistorialMedicoEntities() {
        return findHistorialMedicoEntities(true, -1, -1);
    }

    public List<HistorialMedico> findHistorialMedicoEntities(int maxResults, int firstResult) {
        return findHistorialMedicoEntities(false, maxResults, firstResult);
    }

    private List<HistorialMedico> findHistorialMedicoEntities(boolean all, int maxResults, int firstResult) {
        EntityManager em = getEntityManager();
        try {
            CriteriaQuery cq = em.getCriteriaBuilder().createQuery();
            cq.select(cq.from(HistorialMedico.class));
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

    public HistorialMedico findHistorialMedico(Long id) {
        EntityManager em = getEntityManager();
        try {
            return em.find(HistorialMedico.class, id);
        } finally {
            em.close();
        }
    }

    public int getHistorialMedicoCount() {
        EntityManager em = getEntityManager();
        try {
            CriteriaQuery cq = em.getCriteriaBuilder().createQuery();
            Root<HistorialMedico> rt = cq.from(HistorialMedico.class);
            cq.select(em.getCriteriaBuilder().count(rt));
            Query q = em.createQuery(cq);
            return ((Long) q.getSingleResult()).intValue();
        } finally {
            em.close();
        }
    }

}
