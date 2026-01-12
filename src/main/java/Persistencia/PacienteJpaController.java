package Persistencia;

import Persistencia.exceptions.NonexistentEntityException;
import Persistencia.exceptions.PreexistingEntityException;
import java.io.Serializable;
import javax.persistence.Query;
import javax.persistence.EntityNotFoundException;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import logica.Turno;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import logica.Paciente;

public class PacienteJpaController implements Serializable {

    public PacienteJpaController(EntityManagerFactory emf) {
        this.emf = emf;
    }

    private EntityManagerFactory emf = null;

    public EntityManager getEntityManager() {
        return emf.createEntityManager();
    }

    public PacienteJpaController() {
        emf = Persistencia.createEntityManagerFactory("ConsulOdontPU");
    }

    public void create(Paciente paciente) throws PreexistingEntityException, Exception {
        if (paciente.getListaTurno() == null) {
            paciente.setListaTurno(new ArrayList<Turno>());
        }
        EntityManager em = null;
        try {
            em = getEntityManager();
            em.getTransaction().begin();
            List<Turno> attachedListaTurno = new ArrayList<Turno>();
            for (Turno listaTurnoTurnoToAttach : paciente.getListaTurno()) {
                listaTurnoTurnoToAttach = em.getReference(listaTurnoTurnoToAttach.getClass(),
                        listaTurnoTurnoToAttach.getId_turno());
                attachedListaTurno.add(listaTurnoTurnoToAttach);
            }
            paciente.setListaTurno(attachedListaTurno);
            em.persist(paciente);
            for (Turno listaTurnoTurno : paciente.getListaTurno()) {
                Paciente oldPacienOfListaTurnoTurno = listaTurnoTurno.getPacien();
                listaTurnoTurno.setPacien(paciente);
                listaTurnoTurno = em.merge(listaTurnoTurno);
                if (oldPacienOfListaTurnoTurno != null) {
                    oldPacienOfListaTurnoTurno.getListaTurno().remove(listaTurnoTurno);
                    oldPacienOfListaTurnoTurno = em.merge(oldPacienOfListaTurnoTurno);
                }
            }
            em.getTransaction().commit();
        } catch (Exception ex) {
            if (findPaciente(paciente.getDniPaciente()) != null) {
                throw new PreexistingEntityException("Paciente " + paciente + " already exists.", ex);
            }
            throw ex;
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }

    public void edit(Paciente paciente) throws NonexistentEntityException, Exception {
        EntityManager em = null;
        try {
            em = getEntityManager();
            em.getTransaction().begin();
            Paciente persistentPaciente = em.find(Paciente.class, paciente.getDniPaciente());
            List<Turno> listaTurnoOld = persistentPaciente.getListaTurno();
            List<Turno> listaTurnoNew = paciente.getListaTurno();
            List<Turno> attachedListaTurnoNew = new ArrayList<Turno>();
            for (Turno listaTurnoNewTurnoToAttach : listaTurnoNew) {
                listaTurnoNewTurnoToAttach = em.getReference(listaTurnoNewTurnoToAttach.getClass(),
                        listaTurnoNewTurnoToAttach.getId_turno());
                attachedListaTurnoNew.add(listaTurnoNewTurnoToAttach);
            }
            listaTurnoNew = attachedListaTurnoNew;
            paciente.setListaTurno(listaTurnoNew);
            paciente = em.merge(paciente);
            for (Turno listaTurnoOldTurno : listaTurnoOld) {
                if (!listaTurnoNew.contains(listaTurnoOldTurno)) {
                    listaTurnoOldTurno.setPacien(null);
                    listaTurnoOldTurno = em.merge(listaTurnoOldTurno);
                }
            }
            for (Turno listaTurnoNewTurno : listaTurnoNew) {
                if (!listaTurnoOld.contains(listaTurnoNewTurno)) {
                    Paciente oldPacienOfListaTurnoNewTurno = listaTurnoNewTurno.getPacien();
                    listaTurnoNewTurno.setPacien(paciente);
                    listaTurnoNewTurno = em.merge(listaTurnoNewTurno);
                    if (oldPacienOfListaTurnoNewTurno != null && !oldPacienOfListaTurnoNewTurno.equals(paciente)) {
                        oldPacienOfListaTurnoNewTurno.getListaTurno().remove(listaTurnoNewTurno);
                        oldPacienOfListaTurnoNewTurno = em.merge(oldPacienOfListaTurnoNewTurno);
                    }
                }
            }
            em.getTransaction().commit();
        } catch (Exception ex) {
            String msg = ex.getLocalizedMessage();
            if (msg == null || msg.length() == 0) {
                String id = paciente.getDniPaciente();
                if (findPaciente(id) == null) {
                    throw new NonexistentEntityException("The paciente with id " + id + " no longer exists.");
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
            Paciente paciente;
            try {
                paciente = em.getReference(Paciente.class, id);
                paciente.getDniPaciente();
            } catch (EntityNotFoundException enfe) {
                throw new NonexistentEntityException("The paciente with id " + id + " no longer exists.", enfe);
            }
            List<Turno> listaTurno = paciente.getListaTurno();
            for (Turno listaTurnoTurno : listaTurno) {
                listaTurnoTurno.setPacien(null);
                listaTurnoTurno = em.merge(listaTurnoTurno);
            }
            em.remove(paciente);
            em.getTransaction().commit();
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }

    public List<Paciente> findPacienteEntities() {
        return findPacienteEntities(true, -1, -1);
    }

    public List<Paciente> findPacienteEntities(int maxResults, int firstResult) {
        return findPacienteEntities(false, maxResults, firstResult);
    }

    private List<Paciente> findPacienteEntities(boolean all, int maxResults, int firstResult) {
        EntityManager em = getEntityManager();
        try {
            CriteriaQuery cq = em.getCriteriaBuilder().createQuery();
            cq.select(cq.from(Paciente.class));
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

    public Paciente findPaciente(String id) {
        EntityManager em = getEntityManager();
        try {
            return em.find(Paciente.class, id);
        } finally {
            em.close();
        }
    }

    public int getPacienteCount() {
        EntityManager em = getEntityManager();
        try {
            CriteriaQuery cq = em.getCriteriaBuilder().createQuery();
            Root<Paciente> rt = cq.from(Paciente.class);
            cq.select(em.getCriteriaBuilder().count(rt));
            Query q = em.createQuery(cq);
            return ((Long) q.getSingleResult()).intValue();
        } finally {
            em.close();
        }
    }

}
