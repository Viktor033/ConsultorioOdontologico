"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Users,
    CalendarCheck,
    FilePlus,
    Clock,
    Plus,
    Search,
    ArrowUpRight,
    Loader2,
    X
} from 'lucide-react';
import StatsCard from '@/components/ui/StatsCard';
import { api, DashboardData } from '@/lib/api';
import AppointmentModal from '@/components/ui/AppointmentModal';

export default function Dashboard() {
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        setIsLoading(true);
        try {
            const stats = await api.getStats();
            setData(stats);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100%' }}>
                <Loader2 size={48} className="animate-spin" color="var(--primary)" />
            </div>
        );
    }

    return (
        <div className="page-container">
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}
                    >
                        Panel de Control
                    </motion.h1>
                    <p style={{ color: 'var(--text-muted)' }}>Maneja tu clínica con datos en tiempo real.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {isSearchOpen ? (
                        <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 300, opacity: 1 }} style={{ display: 'flex', gap: '0.5rem' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    autoFocus
                                    placeholder="Buscar en actividad..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                                        width: '100%',
                                        fontSize: '0.875rem',
                                        borderRadius: '0.5rem',
                                        border: '1px solid var(--border-light)',
                                        backgroundColor: 'var(--bg-card)'
                                    }}
                                />
                            </div>
                            <button onClick={() => { setIsSearchOpen(false); setSearchTerm(''); }} style={{ color: 'var(--text-muted)', border: 'none', background: 'none', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </motion.div>
                    ) : (
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="premium-card"
                            style={{ padding: '0.625rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}
                        >
                            <Search size={18} />
                            <span>Buscar...</span>
                        </button>
                    )}
                    <button
                        onClick={() => setIsAppointmentModalOpen(true)}
                        style={{
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '0.625rem 1.25rem',
                            borderRadius: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: 600,
                            boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.39)'
                        }}
                    >
                        <Plus size={20} />
                        <span>Nueva Cita</span>
                    </button>
                </div>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                <StatsCard
                    title="Total Pacientes"
                    value={data?.stats.totalPacientes || 0}
                    icon={Users}
                    color="#3b82f6"
                    trend="Real-time"
                    trendUp={true}
                />
                <StatsCard
                    title="Turnos Hoy"
                    value={data?.stats.turnosHoy || 0}
                    icon={CalendarCheck}
                    color="#10b981"
                    trend="Hoy"
                    trendUp={true}
                />
                <StatsCard
                    title="Consultas Mes"
                    value={data?.stats.consultasMes || 0}
                    icon={FilePlus}
                    color="#8b5cf6"
                />
                <StatsCard
                    title="Casos Pendientes"
                    value={data?.stats.pendientes || 0}
                    icon={Clock}
                    color="#f59e0b"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Actividad de Hoy</h2>
                        <button onClick={() => router.push('/calendario')} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer' }}>Ver Agenda →</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {data?.proximosTurnos.filter(t => t.paciente.toLowerCase().includes(searchTerm.toLowerCase()) || t.motivo.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No se encontraron turnos.</p>
                        ) : (
                            data?.proximosTurnos.filter(t => t.paciente.toLowerCase().includes(searchTerm.toLowerCase()) || t.motivo.toLowerCase().includes(searchTerm.toLowerCase())).map((t, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '1rem',
                                    backgroundColor: 'var(--bg-main)',
                                    borderRadius: '0.75rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '10px',
                                            background: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 700,
                                            color: 'var(--primary)',
                                            border: '1px solid var(--border-light)'
                                        }}>
                                            {t.paciente.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{t.paciente}</h4>
                                            <p style={{ fontSize: '0.813rem', color: 'var(--text-muted)' }}>{t.motivo}</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontWeight: 600 }}>{t.hora}</p>
                                        <p style={{ fontSize: '0.813rem', color: t.estado === 'PENDIENTE' ? '#f59e0b' : '#10b981' }}>{t.estado}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="premium-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem' }}>Pacientes Recientes</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {data?.pacientesRecientes.map((p) => (
                            <div key={p.dni} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{p.nombre} {p.apellido}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DNI: {p.dni}</p>
                                </div>
                                <ArrowUpRight size={16} color="var(--text-muted)" />
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => router.push('/pacientes')}
                        style={{
                            marginTop: '1.5rem',
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--border-light)',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: 'pointer'
                        }}
                    >
                        Ver todos los pacientes
                    </button>
                </div>
            </div>

            <AppointmentModal
                isOpen={isAppointmentModalOpen}
                onClose={() => setIsAppointmentModalOpen(false)}
                onSave={loadDashboard}
            />
        </div>
    );
}
