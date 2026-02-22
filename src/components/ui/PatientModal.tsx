"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User, Phone, Mail, MapPin, Calendar, Heart, CreditCard, FileText, Loader2 } from 'lucide-react';
import { api, Patient } from '@/lib/api';

interface PatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    patient?: Patient | null;
}

const emptyForm: Partial<Patient> = {
    dniPaciente: '', nombre: '', apellido: '',
    telefono: '', email: '', direccion: '',
    obraSocial: '', fecha_nac: '', antecedents: '{}',
};

function Field({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
    return (
        <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Icon size={12} />
                {label}
            </label>
            {children}
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.625rem',
    border: '1.5px solid #e2e8f0', background: '#f8fafc',
    fontSize: '0.9rem', color: '#1e293b', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
};

export default function PatientModal({ isOpen, onClose, onSave, patient }: PatientModalProps) {
    const [formData, setFormData] = useState<Partial<Patient>>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isEditing = !!patient;

    useEffect(() => {
        setFormData(patient ?? emptyForm);
        setError(null);
    }, [patient, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        const payload: Patient = {
            dniPaciente: formData.dniPaciente?.trim() || '',
            nombre: formData.nombre?.trim() || '',
            apellido: formData.apellido?.trim() || '',
            telefono: formData.telefono?.trim() || '',
            email: formData.email?.trim() || '',
            direccion: formData.direccion?.trim() || '',
            obraSocial: formData.obraSocial?.trim() || '',
            fecha_nac: formData.fecha_nac?.trim() || '',
            antecedents: formData.antecedents || '{}',
        };
        try {
            if (isEditing) await api.updatePatient(payload);
            else await api.createPatient(payload);
            onSave();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error desconocido al guardar');
        } finally {
            setIsSaving(false);
        }
    };

    const initials = `${formData.nombre?.charAt(0) ?? ''}${formData.apellido?.charAt(0) ?? ''}`.toUpperCase() || '?';

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
                            width: '100%', maxWidth: '620px', maxHeight: '92vh',
                            borderRadius: '1.5rem', overflow: 'hidden',
                            boxShadow: '0 30px 60px -12px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)',
                            display: 'flex', flexDirection: 'column',
                        }}
                    >
                        {/* ── Gradient Header ── */}
                        <div style={{
                            background: isEditing
                                ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%)'
                                : 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #2563eb 100%)',
                            padding: '1.75rem 1.75rem 2.5rem',
                            position: 'relative',
                        }}>
                            {/* Close btn */}
                            <button
                                onClick={onClose}
                                style={{
                                    position: 'absolute', top: '1rem', right: '1rem',
                                    background: 'rgba(255,255,255,0.15)', border: 'none',
                                    color: 'white', borderRadius: '50%', width: '32px', height: '32px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', backdropFilter: 'blur(4px)',
                                }}
                            >
                                <X size={18} />
                            </button>

                            {/* Avatar + title */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.18)',
                                    border: '2px solid rgba(255,255,255,0.35)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.5rem', fontWeight: 800, color: 'white',
                                    backdropFilter: 'blur(4px)',
                                }}>
                                    {initials}
                                </div>
                                <div>
                                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                        {isEditing ? 'Editar ficha' : 'Nueva ficha'}
                                    </p>
                                    <h2 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                                        {isEditing ? `${formData.nombre} ${formData.apellido}` : 'Nuevo Paciente'}
                                    </h2>
                                    {formData.dniPaciente && (
                                        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', marginTop: '0.2rem' }}>DNI: {formData.dniPaciente}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── Form body ── */}
                        <form
                            onSubmit={handleSubmit}
                            style={{
                                background: 'white',
                                flex: 1, overflowY: 'auto',
                                padding: '1.5rem',
                                marginTop: '-1rem',
                                borderRadius: '1.25rem 1.25rem 0 0',
                            }}
                        >
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={{
                                        background: '#fef2f2', border: '1.5px solid #fca5a5',
                                        color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '0.75rem',
                                        fontSize: '0.875rem', marginBottom: '1.25rem', fontWeight: 600,
                                    }}
                                >
                                    ⚠️ {error}
                                </motion.div>
                            )}

                            {/* Section: Identificación */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <h3 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                    Identificación
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                                    <Field icon={CreditCard} label="DNI">
                                        <input required name="dniPaciente" value={formData.dniPaciente || ''} onChange={handleChange}
                                            disabled={isEditing} placeholder="Ej: 38451234"
                                            style={{ ...inputStyle, opacity: isEditing ? 0.6 : 1 }} />
                                    </Field>
                                    <Field icon={Heart} label="Obra Social">
                                        <input name="obraSocial" value={formData.obraSocial || ''} onChange={handleChange}
                                            placeholder="Ej: OSDE, PAMI…" style={inputStyle} />
                                    </Field>
                                </div>
                            </div>

                            {/* Section: Datos Personales */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <h3 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                    Datos Personales
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                                    <Field icon={User} label="Nombre">
                                        <input required name="nombre" value={formData.nombre || ''} onChange={handleChange} placeholder="Juan" style={inputStyle} />
                                    </Field>
                                    <Field icon={User} label="Apellido">
                                        <input required name="apellido" value={formData.apellido || ''} onChange={handleChange} placeholder="Pérez" style={inputStyle} />
                                    </Field>
                                    <Field icon={Calendar} label="Fecha de Nacimiento">
                                        <input type="date" name="fecha_nac" value={formData.fecha_nac || ''} onChange={handleChange} style={inputStyle} />
                                    </Field>
                                    <Field icon={Phone} label="Teléfono">
                                        <input name="telefono" value={formData.telefono || ''} onChange={handleChange} placeholder="+54 11 1234-5678" style={inputStyle} />
                                    </Field>
                                </div>
                            </div>

                            {/* Section: Contacto */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
                                    Contacto
                                </h3>
                                <div style={{ display: 'grid', gap: '0.875rem' }}>
                                    <Field icon={Mail} label="Email">
                                        <input type="email" name="email" value={formData.email || ''} onChange={handleChange} placeholder="juan@email.com" style={inputStyle} />
                                    </Field>
                                    <Field icon={MapPin} label="Dirección">
                                        <input name="direccion" value={formData.direccion || ''} onChange={handleChange} placeholder="Av. Corrientes 1234, CABA" style={inputStyle} />
                                    </Field>
                                </div>
                            </div>

                            {/* Footer actions */}
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                                <button type="button" onClick={onClose} disabled={isSaving}
                                    style={{ padding: '0.7rem 1.5rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', color: '#475569' }}>
                                    Cancelar
                                </button>
                                <button type="submit" disabled={isSaving}
                                    style={{
                                        padding: '0.7rem 1.75rem', borderRadius: '0.75rem', border: 'none',
                                        background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                                        color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        boxShadow: '0 4px 16px rgba(59, 130, 246, 0.45)',
                                        opacity: isSaving ? 0.8 : 1,
                                    }}>
                                    {isSaving ? <><Loader2 size={16} className="animate-spin" /> Guardando…</> : <><Save size={16} /> {isEditing ? 'Guardar Cambios' : 'Crear Paciente'}</>}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
