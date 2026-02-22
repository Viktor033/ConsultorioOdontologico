"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Calendar, Clock, User, Clipboard, Search, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { api, Appointment, Patient } from '@/lib/api';

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    appointment?: Appointment | null;
    initialDate?: string;
}

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.625rem',
    border: '1.5px solid #e2e8f0', background: '#f8fafc',
    fontSize: '0.9rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box',
};

const estadoColors: Record<string, { bg: string; color: string }> = {
    PENDIENTE: { bg: '#fef9c3', color: '#854d0e' },
    CONFIRMADO: { bg: '#dbeafe', color: '#1d4ed8' },
    COMPLETADO: { bg: '#dcfce7', color: '#166534' },
    CANCELADO: { bg: '#fee2e2', color: '#991b1b' },
};

export default function AppointmentModal({ isOpen, onClose, onSave, appointment, initialDate }: AppointmentModalProps) {
    const [formData, setFormData] = useState<Partial<Appointment>>({
        fecha: initialDate || new Date().toISOString().split('T')[0],
        hora: '', dniPaciente: '', motivo: '', estado: 'PENDIENTE', observaciones: ''
    });
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isEditing = !!appointment;

    useEffect(() => {
        if (isOpen) {
            api.getPatients().then(setPatients).catch(console.error);
            if (appointment) {
                setFormData({ ...appointment, dniPaciente: appointment.paciente?.dni || '' });
            } else {
                setFormData({
                    fecha: initialDate || new Date().toISOString().split('T')[0],
                    hora: '', dniPaciente: '', motivo: '', estado: 'PENDIENTE', observaciones: ''
                });
            }
        }
        setError(null);
        setSearchTerm('');
    }, [appointment, isOpen, initialDate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.dniPaciente) { setError('Debe seleccionar un paciente'); return; }
        setIsSaving(true);
        setError(null);
        try {
            await api.saveAppointment(formData as Appointment);
            onSave();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al guardar la cita');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredPatients = patients.filter(p =>
        `${p.nombre} ${p.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.dniPaciente.includes(searchTerm)
    );

    const selectedPatient = patients.find(p => p.dniPaciente === formData.dniPaciente);
    const estadoStyle = estadoColors[formData.estado || 'PENDIENTE'];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 100,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '1rem',
                        background: 'rgba(15, 23, 42, 0.6)',
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.93, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.93, y: 30 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                        onClick={e => e.stopPropagation()}
                        style={{
                            width: '100%', maxWidth: '580px', maxHeight: '92vh',
                            borderRadius: '1.5rem', overflow: 'hidden',
                            boxShadow: '0 30px 60px -12px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)',
                            display: 'flex', flexDirection: 'column',
                        }}
                    >
                        {/* ── Gradient Header ── */}
                        <div style={{
                            background: 'linear-gradient(135deg, #0c1445 0%, #1a3a6e 40%, #0891b2 100%)',
                            padding: '1.75rem 1.75rem 2.5rem',
                            position: 'relative',
                        }}>
                            <button onClick={onClose} style={{
                                position: 'absolute', top: '1rem', right: '1rem',
                                background: 'rgba(255,255,255,0.15)', border: 'none',
                                color: 'white', borderRadius: '50%', width: '32px', height: '32px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', backdropFilter: 'blur(4px)',
                            }}>
                                <X size={18} />
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.15)',
                                    border: '2px solid rgba(255,255,255,0.35)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    backdropFilter: 'blur(4px)',
                                }}>
                                    <Calendar size={28} color="white" />
                                </div>
                                <div>
                                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                        {isEditing ? 'Editar turno' : 'Agendar turno'}
                                    </p>
                                    <h2 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                                        {selectedPatient ? `${selectedPatient.nombre} ${selectedPatient.apellido}` : (isEditing ? 'Turno' : 'Nueva Cita')}
                                    </h2>
                                    {formData.fecha && (
                                        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                                            📅 {formData.fecha} {formData.hora && `• 🕐 ${formData.hora}`}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Status badge */}
                            <div style={{
                                position: 'absolute', top: '1.25rem', right: '3.5rem',
                                background: estadoStyle.bg, color: estadoStyle.color,
                                padding: '3px 10px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 700,
                            }}>
                                {formData.estado}
                            </div>
                        </div>

                        {/* ── Form body ── */}
                        <form
                            onSubmit={handleSubmit}
                            style={{ background: 'white', flex: 1, overflowY: 'auto', padding: '1.5rem', marginTop: '-1rem', borderRadius: '1.25rem 1.25rem 0 0' }}
                        >
                            {error && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '0.75rem', fontSize: '0.875rem', marginBottom: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <AlertCircle size={16} /> {error}
                                </motion.div>
                            )}

                            {/* Paciente */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <h3 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                    Paciente
                                </h3>
                                {!isEditing && (
                                    <div style={{ position: 'relative', marginBottom: '0.625rem' }}>
                                        <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                        <input
                                            placeholder="Buscar por nombre o DNI…"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            style={{ ...inputStyle, paddingLeft: '2.25rem' }}
                                        />
                                    </div>
                                )}
                                <div style={{ position: 'relative' }}>
                                    <User size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                                    <select
                                        name="dniPaciente"
                                        value={formData.dniPaciente}
                                        onChange={handleChange}
                                        required
                                        disabled={isEditing}
                                        style={{ ...inputStyle, paddingLeft: '2.25rem', appearance: 'none', cursor: 'pointer' }}
                                    >
                                        <option value="">Seleccione un paciente…</option>
                                        {filteredPatients.map(p => (
                                            <option key={p.dniPaciente} value={p.dniPaciente}>
                                                {p.apellido}, {p.nombre} ({p.dniPaciente})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Fecha y Hora */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <h3 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                    Fecha y Hora
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            <Calendar size={12} /> Fecha
                                        </label>
                                        <input type="date" name="fecha" value={formData.fecha || ''} onChange={handleChange} required style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            <Clock size={12} /> Hora
                                        </label>
                                        <input type="time" name="hora" value={formData.hora || ''} onChange={handleChange} required style={inputStyle} />
                                    </div>
                                </div>
                            </div>

                            {/* Motivo y Estado */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                    Detalles
                                </h3>
                                <div style={{ display: 'grid', gap: '0.875rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            <Clipboard size={12} /> Motivo de la Cita
                                        </label>
                                        <input
                                            name="motivo" value={formData.motivo || ''} onChange={handleChange} required
                                            placeholder="Ej: Control, Limpieza, Caries…"
                                            style={inputStyle}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            <CheckCircle size={12} /> Estado
                                        </label>
                                        <select name="estado" value={formData.estado || 'PENDIENTE'} onChange={handleChange} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                                            <option value="PENDIENTE">⏳ Pendiente</option>
                                            <option value="CONFIRMADO">✅ Confirmado</option>
                                            <option value="COMPLETADO">🎉 Completado</option>
                                            <option value="CANCELADO">❌ Cancelado</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Observaciones
                                        </label>
                                        <textarea
                                            name="observaciones" value={formData.observaciones || ''} onChange={handleChange}
                                            rows={2} placeholder="Notas adicionales…"
                                            style={{ ...inputStyle, resize: 'none', fontFamily: 'inherit' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                                <button type="button" onClick={onClose} disabled={isSaving}
                                    style={{ padding: '0.7rem 1.5rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', color: '#475569' }}>
                                    Cancelar
                                </button>
                                <button type="submit" disabled={isSaving}
                                    style={{
                                        padding: '0.7rem 1.75rem', borderRadius: '0.75rem', border: 'none',
                                        background: 'linear-gradient(135deg, #0c1445, #0891b2)',
                                        color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        boxShadow: '0 4px 16px rgba(8, 145, 178, 0.45)',
                                        opacity: isSaving ? 0.8 : 1,
                                    }}>
                                    {isSaving ? <><Loader2 size={16} className="animate-spin" /> Guardando…</> : <><Save size={16} /> {isEditing ? 'Guardar Cambios' : 'Agendar Cita'}</>}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
