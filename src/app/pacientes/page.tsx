"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Users,
    UserPlus,
    Search,
    Filter,
    Eye,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Download,
    Loader2,
    PlusCircle
} from 'lucide-react';
import { api, Patient } from '@/lib/api';
import PatientModal from '@/components/ui/PatientModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Toast from '@/components/ui/Toast';

export default function PatientsPage() {
    const router = useRouter();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null); // holds DNI to delete
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        setIsLoading(true);
        try {
            const data = await api.getPatients();
            setPatients(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredPatients = patients.filter(p =>
        `${p.nombre} ${p.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.dniPaciente.includes(searchTerm)
    );

    const handleDelete = async (dni: string) => {
        setConfirmDelete(dni);
    };

    const executeDelete = async () => {
        if (!confirmDelete) return;
        try {
            await api.deletePatient(confirmDelete);
            loadPatients();
            setToast({ message: 'Paciente eliminado correctamente', type: 'success' });
        } catch (err: any) {
            setToast({ message: err.message || 'Error al eliminar', type: 'error' });
        } finally {
            setConfirmDelete(null);
        }
    };

    const handleSaved = () => {
        loadPatients();
        setToast({ message: selectedPatient ? 'Paciente actualizado correctamente' : 'Paciente creado correctamente', type: 'success' });
    };

    return (
        <div className="page-container">
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Pacientes</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Maneja la base de datos de tus pacientes y sus expedientes reales.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="premium-card" style={{ padding: '0.625rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, cursor: 'pointer' }}>
                        <Download size={18} />
                        <span>Exportar</span>
                    </button>
                    <button
                        onClick={() => { setSelectedPatient(null); setIsModalOpen(true); }}
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '0.625rem 1.25rem',
                            borderRadius: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 600,
                            boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)',
                            cursor: 'pointer',
                            border: 'none'
                        }}
                    >
                        <UserPlus size={20} />
                        <span>Nuevo Paciente</span>
                    </button>
                </div>
            </div>

            <div className="premium-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, apellido o DNI..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 3rem',
                            borderRadius: '0.50rem',
                            border: '1px solid var(--border-light)',
                            backgroundColor: 'var(--bg-main)',
                            fontFamily: 'inherit',
                            fontSize: '0.875rem'
                        }}
                    />
                </div>
                <button style={{
                    padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'white', fontWeight: 500
                }}>
                    <Filter size={18} />
                    <span>Filtros</span>
                </button>
            </div>

            <div className="premium-card" style={{ overflow: 'hidden', position: 'relative', minHeight: '200px' }}>
                {isLoading && (
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Loader2 size={32} className="animate-spin" color="var(--primary)" />
                    </div>
                )}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-light)' }}>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.813rem', textTransform: 'uppercase' }}>DNI</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.813rem', textTransform: 'uppercase' }}>Paciente</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.813rem', textTransform: 'uppercase' }}>Contacto</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.813rem', textTransform: 'uppercase' }}>Obra Social</th>
                                <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {filteredPatients.map((patient) => (
                                    <motion.tr
                                        key={patient.dniPaciente}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        style={{ borderBottom: '1px solid var(--border-light)' }}
                                        whileHover={{ backgroundColor: 'var(--bg-main)' }}
                                    >
                                        <td style={{ padding: '1.25rem 1.5rem', fontWeight: 500 }}>{patient.dniPaciente}</td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ fontWeight: 600 }}>{patient.nombre} {patient.apellido}</div>
                                            <div style={{ fontSize: '0.813rem', color: 'var(--text-muted)' }}>{patient.fecha_nac || 'Sin fecha'}</div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ fontSize: '0.875rem' }}>{patient.telefono}</div>
                                            <div style={{ fontSize: '0.813rem', color: 'var(--text-muted)' }}>{patient.email}</div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600 }}>
                                                {patient.obraSocial || 'Particular'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => router.push(`/odontograma?dni=${patient.dniPaciente}`)}
                                                    title="Ver Odontograma"
                                                    style={{ padding: '0.5rem', borderRadius: '0.375rem', color: 'var(--primary)', cursor: 'pointer', border: 'none', background: 'none' }}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedPatient(patient); setIsModalOpen(true); }}
                                                    title="Editar"
                                                    style={{ padding: '0.5rem', borderRadius: '0.375rem', color: 'var(--text-muted)', cursor: 'pointer', border: 'none', background: 'none' }}
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(patient.dniPaciente)}
                                                    title="Eliminar"
                                                    style={{ padding: '0.5rem', borderRadius: '0.375rem', color: '#ef4444', cursor: 'pointer', border: 'none', background: 'none' }}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            <PatientModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedPatient(null); }}
                onSave={handleSaved}
                patient={selectedPatient}
            />

            <ConfirmModal
                isOpen={!!confirmDelete}
                title="Eliminar Paciente"
                message="¿Estás seguro de que querés eliminar este paciente? Esta acción no se puede deshacer."
                confirmLabel="Sí, eliminar"
                onConfirm={executeDelete}
                onCancel={() => setConfirmDelete(null)}
            />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
