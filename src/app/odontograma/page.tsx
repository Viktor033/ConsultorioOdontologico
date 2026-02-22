"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save,
    RotateCcw,
    Loader2,
    Search,
    User,
    ChevronRight,
    ArrowLeft,
    FileDown,
} from 'lucide-react';
import Tooth from '@/components/ui/Tooth';
import { api, Patient, Appointment } from '@/lib/api';
import Toast from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { exportClinicalHistory } from '@/lib/exportPDF';

const tools = [
    { id: 'caries', label: 'Caries', color: '#ef4444' },
    { id: 'restauracion', label: 'Restauración', color: '#3b82f6' },
    { id: 'ausente', label: 'Ausente', color: '#64748b' },
    { id: 'protesis', label: 'Prótesis', color: '#f59e0b' },
    { id: 'limpieza', label: 'Limpieza', color: '#10b981' },
];

const upperTeeth = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const lowerTeeth = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

// ─── Patient Selector ───────────────────────────────────────────────────────

function PatientSelector({ onSelect }: { onSelect: (p: Patient) => void }) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getPatients()
            .then(setPatients)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = patients.filter(p =>
        `${p.nombre} ${p.apellido}`.toLowerCase().includes(search.toLowerCase()) ||
        p.dniPaciente.includes(search)
    );

    return (
        <div className="page-container" style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    Odontograma
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Seleccioná un paciente para ver o editar su odontograma.</p>
            </div>

            {/* Search */}
            <div className="premium-card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        autoFocus
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por nombre, apellido o DNI…"
                        style={{
                            width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
                            borderRadius: '0.75rem', border: '1.5px solid #e2e8f0',
                            background: '#f8fafc', fontSize: '1rem', outline: 'none',
                            boxSizing: 'border-box',
                        }}
                    />
                </div>
            </div>

            {/* Patient list */}
            <div className="premium-card" style={{ overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                        <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <User size={40} color="#cbd5e1" style={{ marginBottom: '0.75rem', margin: '0 auto' }} />
                        <p style={{ fontWeight: 600, marginTop: '0.75rem' }}>No se encontraron pacientes</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {filtered.map((p, i) => (
                            <motion.button
                                key={p.dniPaciente}
                                whileHover={{ backgroundColor: '#f0f9ff' }}
                                onClick={() => onSelect(p)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '1rem',
                                    padding: '1rem 1.25rem', background: 'white', border: 'none',
                                    borderBottom: i < filtered.length - 1 ? '1px solid #f1f5f9' : 'none',
                                    cursor: 'pointer', textAlign: 'left', width: '100%',
                                    transition: 'background 0.15s',
                                }}
                            >
                                {/* Avatar */}
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                                    background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontWeight: 800, fontSize: '1rem',
                                }}>
                                    {p.nombre.charAt(0)}{p.apellido.charAt(0)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                                        {p.apellido}, {p.nombre}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                                        DNI: {p.dniPaciente}
                                        {p.obraSocial && ` · ${p.obraSocial}`}
                                    </div>
                                </div>
                                <ChevronRight size={18} color="#94a3b8" />
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Odontogram Viewer ───────────────────────────────────────────────────────

function OdontogramViewer({ patient, onBack }: { patient: Patient; onBack: () => void }) {
    const dni = patient.dniPaciente;
    const [selectedTool, setSelectedTool] = useState('caries');
    const [odontogramData, setOdontogramData] = useState<any>({});
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [confirmClear, setConfirmClear] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        setIsLoading(true);
        Promise.all([
            api.getOdontogram(dni),
            api.getAppointments(),
        ]).then(([odRes, apps]) => {
            if (odRes.odontograma?.estadoDientes) {
                setOdontogramData(odRes.odontograma.estadoDientes);
            } else {
                setOdontogramData({});
            }
            setAppointments(apps);
        }).catch(console.error)
            .finally(() => setIsLoading(false));
    }, [dni]);

    const handleExport = () => {
        setIsExporting(true);
        try {
            exportClinicalHistory(patient, appointments, odontogramData);
        } catch (e) {
            console.error(e);
        } finally {
            setTimeout(() => setIsExporting(false), 1500);
        }
    };

    const handleSurfaceClick = (tooth: number, surface: string) => {
        setOdontogramData((prev: any) => {
            const toothData = prev[tooth] || {};
            const newTreatment = toothData[surface] === selectedTool ? undefined : selectedTool;
            return { ...prev, [tooth]: { ...toothData, [surface]: newTreatment } };
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.saveOdontogram(dni, JSON.stringify(odontogramData), 'Actualización desde Portal');
            setToast({ message: 'Odontograma guardado correctamente', type: 'success' });
        } catch (err: any) {
            setToast({ message: err.message || 'Error al guardar', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    return (
        <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={onBack}
                        style={{
                            padding: '0.5rem', borderRadius: '0.625rem',
                            border: '1.5px solid #e2e8f0', background: 'white',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                            fontWeight: 600, fontSize: '0.875rem', color: '#475569',
                        }}
                    >
                        <ArrowLeft size={18} />
                        <span>Pacientes</span>
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                            {patient.nombre} {patient.apellido}
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            DNI: {patient.dniPaciente}
                            {patient.obraSocial ? ` · ${patient.obraSocial}` : ''}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={() => setConfirmClear(true)}
                        style={{
                            padding: '0.625rem 1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center',
                            gap: '0.5rem', fontWeight: 600, color: '#ef4444', border: '1.5px solid #fca5a5',
                            background: '#fef2f2', cursor: 'pointer',
                        }}
                    >
                        <RotateCcw size={16} />
                        <span>Limpiar</span>
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        style={{
                            padding: '0.625rem 1.25rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center',
                            gap: '0.5rem', fontWeight: 700, border: '1.5px solid #0891b2',
                            background: '#ecfeff', color: '#0891b2', cursor: 'pointer',
                            opacity: isExporting ? 0.7 : 1,
                        }}
                    >
                        {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                        <span>{isExporting ? 'Generando…' : 'Exportar PDF'}</span>
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{
                            background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                            color: 'white', padding: '0.625rem 1.25rem', borderRadius: '0.75rem',
                            fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
                            boxShadow: '0 4px 14px rgba(37,99,235,0.35)', opacity: isSaving ? 0.8 : 1,
                        }}
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        <span>{isSaving ? 'Guardando…' : 'Guardar'}</span>
                    </button>
                </div>
            </div>

            {/* Tool palette */}
            <div className="premium-card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {tools.map(tool => (
                    <button
                        key={tool.id}
                        onClick={() => setSelectedTool(tool.id)}
                        style={{
                            padding: '0.6rem 1.25rem', borderRadius: '2rem', fontWeight: 700, fontSize: '0.875rem',
                            border: `2px solid ${tool.color}`,
                            backgroundColor: selectedTool === tool.id ? tool.color : 'white',
                            color: selectedTool === tool.id ? 'white' : tool.color,
                            cursor: 'pointer', transition: 'all 0.15s',
                            boxShadow: selectedTool === tool.id ? `0 4px 12px ${tool.color}55` : 'none',
                        }}
                    >
                        {tool.label}
                    </button>
                ))}
            </div>

            {/* Odontogram grid */}
            <div className="premium-card" style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '3rem', alignItems: 'center', overflowX: 'auto' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {upperTeeth.map(n => <Tooth key={n} number={n} data={odontogramData[n]} onSurfaceClick={handleSurfaceClick} selectedTool={selectedTool} />)}
                </div>
                <div style={{ width: '100%', height: '1px', background: 'var(--border-light)' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                    {lowerTeeth.map(n => <Tooth key={n} number={n} data={odontogramData[n]} onSurfaceClick={handleSurfaceClick} selectedTool={selectedTool} />)}
                </div>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <ConfirmModal
                isOpen={confirmClear}
                title="¿Limpiar odontograma?"
                message={`Se borrarán todos los tratamientos marcados en el odontograma de ${patient.nombre} ${patient.apellido}. Esta acción no se puede deshacer.`}
                confirmLabel="Sí, limpiar todo"
                cancelLabel="Cancelar"
                isDanger
                onConfirm={() => { setOdontogramData({}); setConfirmClear(false); setToast({ message: 'Odontograma limpiado', type: 'success' }); }}
                onCancel={() => setConfirmClear(false)}
            />
        </div>
    );
}

// ─── Page root ───────────────────────────────────────────────────────────────

function OdontogramContent() {
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    return (
        <AnimatePresence mode="wait">
            {!selectedPatient ? (
                <motion.div key="selector" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                    <PatientSelector onSelect={setSelectedPatient} />
                </motion.div>
            ) : (
                <motion.div key={selectedPatient.dniPaciente} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
                    <OdontogramViewer patient={selectedPatient} onBack={() => setSelectedPatient(null)} />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default function OdontogramPage() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><Loader2 className="animate-spin" size={48} color="var(--primary)" /></div>}>
            <OdontogramContent />
        </Suspense>
    );
}
