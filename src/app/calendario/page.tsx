"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    User,
    CalendarDays,
    MoreHorizontal,
    Loader2,
    CalendarX,
} from 'lucide-react';
import { api, Appointment } from '@/lib/api';
import AppointmentModal from '@/components/ui/AppointmentModal';

const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const toDateStr = (year: number, month: number, day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const estadoBadge: Record<string, { bg: string; color: string }> = {
    PENDIENTE: { bg: '#fef9c3', color: '#854d0e' },
    CONFIRMADO: { bg: '#dbeafe', color: '#1d4ed8' },
    COMPLETADO: { bg: '#dcfce7', color: '#166534' },
    CANCELADO: { bg: '#fee2e2', color: '#991b1b' },
};

export default function CalendarPage() {
    const today = new Date();
    const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(todayStr);

    useEffect(() => { loadAppointments(); }, []);

    const loadAppointments = async () => {
        setIsLoading(true);
        try {
            const data = await api.getAppointments();
            setAppointments(data);
        } catch (err) {
            console.error('Error loading appointments', err);
        } finally {
            setIsLoading(false);
        }
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const days = Array.from({ length: 42 }, (_, i) => {
        const day = i - firstDayOfMonth + 1;
        return day > 0 && day <= daysInMonth ? day : null;
    });

    const prevMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

    const selectedDateApps = appointments
        .filter(a => a.fecha === selectedDate)
        .sort((a, b) => a.hora.localeCompare(b.hora));

    const selectedDateObj = selectedDate
        ? new Date(selectedDate + 'T12:00:00') // avoid timezone shift
        : null;

    const selectedLabel = selectedDateObj
        ? `${weekDays[selectedDateObj.getDay()]}, ${selectedDateObj.getDate()} de ${months[selectedDateObj.getMonth()]}`
        : 'Seleccioná una fecha';

    return (
        <div className="page-container" style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Agenda</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Hacé clic en una fecha para ver los turnos de ese día.</p>
                </div>
                <button
                    onClick={() => { setSelectedApp(null); setIsModalOpen(true); }}
                    style={{
                        background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                        color: 'white', padding: '0.7rem 1.4rem', borderRadius: '0.875rem',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        fontWeight: 700, boxShadow: '0 4px 14px rgba(37,99,235,0.4)', border: 'none', cursor: 'pointer',
                    }}
                >
                    <Plus size={20} />
                    <span>Agendar Turno</span>
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', flex: 1, overflow: 'hidden' }}>

                {/* ── Big Calendar ── */}
                <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{months[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <button onClick={prevMonth} style={{ padding: '0.4rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', background: 'white', cursor: 'pointer', display: 'flex' }}>
                                <ChevronLeft size={18} />
                            </button>
                            <button onClick={() => { setCurrentDate(new Date()); setSelectedDate(todayStr); }} style={{ padding: '0.4rem 0.875rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', fontWeight: 600, fontSize: '0.8rem', background: 'white', cursor: 'pointer' }}>
                                Hoy
                            </button>
                            <button onClick={nextMonth} style={{ padding: '0.4rem', borderRadius: '0.5rem', border: '1px solid var(--border-light)', background: 'white', cursor: 'pointer', display: 'flex' }}>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: 'auto repeat(6, 1fr)', position: 'relative', overflow: 'hidden' }}>
                        {isLoading && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Loader2 className="animate-spin" size={32} color="var(--primary)" />
                            </div>
                        )}
                        {/* Day headers */}
                        {weekDays.map(day => (
                            <div key={day} style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-light)' }}>
                                {day}
                            </div>
                        ))}

                        {/* Day cells */}
                        {days.map((day, i) => {
                            if (!day) return (
                                <div key={i} style={{ borderRight: (i + 1) % 7 === 0 ? 'none' : '1px solid var(--border-light)', borderBottom: i >= 35 ? 'none' : '1px solid var(--border-light)', background: '#fafafa' }} />
                            );
                            const dateStr = toDateStr(currentDate.getFullYear(), currentDate.getMonth(), day);
                            const dayApps = appointments.filter(a => a.fecha === dateStr);
                            const isToday = dateStr === todayStr;
                            const isSelected = dateStr === selectedDate;

                            return (
                                <motion.div
                                    key={i}
                                    whileHover={{ backgroundColor: '#f0f9ff' }}
                                    onClick={() => setSelectedDate(dateStr)}
                                    style={{
                                        padding: '0.5rem',
                                        borderRight: (i + 1) % 7 === 0 ? 'none' : '1px solid var(--border-light)',
                                        borderBottom: i >= 35 ? 'none' : '1px solid var(--border-light)',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        background: isSelected ? '#eff6ff' : 'white',
                                        transition: 'background 0.15s',
                                    }}
                                >
                                    {/* Ring for selected */}
                                    {isSelected && (
                                        <div style={{
                                            position: 'absolute', inset: '2px', borderRadius: '6px',
                                            border: '2px solid #3b82f6', pointerEvents: 'none',
                                        }} />
                                    )}
                                    <span style={{
                                        fontSize: '0.875rem', fontWeight: 700,
                                        width: '26px', height: '26px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        borderRadius: '50%',
                                        backgroundColor: isToday ? 'var(--primary)' : 'transparent',
                                        color: isToday ? 'white' : 'var(--text-main)',
                                    }}>
                                        {day}
                                    </span>
                                    {dayApps.length > 0 && (
                                        <div style={{ marginTop: '3px', display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                                            {dayApps.slice(0, 3).map((_, idx) => (
                                                <div key={idx} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }} />
                                            ))}
                                            {dayApps.length > 3 && (
                                                <span style={{ fontSize: '0.55rem', color: '#3b82f6', fontWeight: 700 }}>+{dayApps.length - 3}</span>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Right panel: Appointments for selected date ── */}
                <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Panel header */}
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.2rem' }}>
                            <CalendarDays size={18} color="var(--primary)" />
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                                {selectedLabel}
                            </h3>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '1.625rem' }}>
                            {selectedDateApps.length === 0
                                ? 'Sin turnos'
                                : `${selectedDateApps.length} turno${selectedDateApps.length > 1 ? 's' : ''}`}
                        </p>
                    </div>

                    {/* Appointment list */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                        <AnimatePresence mode="wait">
                            {selectedDateApps.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}
                                >
                                    <CalendarX size={40} color="#cbd5e1" style={{ marginBottom: '0.75rem' }} />
                                    <p style={{ fontWeight: 600, fontSize: '0.95rem', color: '#94a3b8' }}>Sin turnos para este día</p>
                                    <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Hacé clic en "Agendar Turno" para agregar uno.</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={selectedDate}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                                >
                                    {selectedDateApps.map(appt => {
                                        const badge = estadoBadge[appt.estado] || estadoBadge.PENDIENTE;
                                        return (
                                            <motion.div
                                                key={appt.id}
                                                whileHover={{ scale: 1.02, boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}
                                                onClick={() => { setSelectedApp(appt); setIsModalOpen(true); }}
                                                style={{
                                                    padding: '1rem', borderRadius: '1rem',
                                                    border: '1.5px solid #e2e8f0',
                                                    background: 'white', cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem' }}>
                                                        <Clock size={14} />
                                                        {appt.hora}
                                                    </div>
                                                    <span style={{ ...badge, padding: '2px 8px', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 800 }}>
                                                        {appt.estado}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                                                    <User size={14} color="#64748b" />
                                                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                                                        {appt.paciente ? `${appt.paciente.nombre} ${appt.paciente.apellido}` : 'Paciente'}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '1.375rem' }}>{appt.motivo}</p>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <AppointmentModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedApp(null); }}
                onSave={loadAppointments}
                appointment={selectedApp}
                initialDate={selectedDate}
            />
        </div>
    );
}
