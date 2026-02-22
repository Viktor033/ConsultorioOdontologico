"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, User, Users, Lock, Plus, Trash2, Save,
    Eye, EyeOff, CheckCircle, AlertCircle, Shield, Mail,
    Phone, MapPin, Globe, FileText,
} from 'lucide-react';
import {
    getCurrentUser, getClinicInfo, saveClinicInfo, ClinicInfo,
    getAllUsers, addUser, updateUser, deleteUser, StoredUser,
} from '@/lib/auth';
import Toast from '@/components/ui/Toast';
import ConfirmModal from '@/components/ui/ConfirmModal';

// ─── Shared input style ───────────────────────────────────────────────────────

function Field({ label, icon: Icon, value, onChange, type = 'text', placeholder = '', disabled = false }: {
    label: string; icon: React.ElementType; value: string; onChange: (v: string) => void;
    type?: string; placeholder?: string; disabled?: boolean;
}) {
    const [focused, setFocused] = useState(false);
    const [show, setShow] = useState(false);
    const isPass = type === 'password';
    return (
        <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.35rem' }}>
                {label}
            </label>
            <div style={{ position: 'relative' }}>
                <Icon size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: focused ? '#3b82f6' : '#94a3b8' }} />
                <input
                    type={isPass && !show ? 'password' : 'text'}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{
                        width: '100%', padding: `0.7rem 0.85rem 0.7rem 2.4rem`,
                        paddingRight: isPass ? '2.8rem' : '0.85rem',
                        borderRadius: '0.75rem', border: `1.5px solid ${focused ? '#3b82f6' : '#e2e8f0'}`,
                        background: disabled ? '#f1f5f9' : '#f8fafc',
                        fontSize: '0.9rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box',
                        transition: 'border-color 0.15s',
                    }}
                />
                {isPass && (
                    <button type="button" onClick={() => setShow(p => !p)} style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                        {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
            </div>
        </div>
    );
}

function SectionCard({ title, icon: Icon, accent = '#1d4ed8', children }: {
    title: string; icon: React.ElementType; accent?: string; children: React.ReactNode;
}) {
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="premium-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1.1rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.75rem', background: `linear-gradient(135deg, ${accent}10, transparent)` }}>
                <div style={{ width: 36, height: 36, borderRadius: '0.625rem', background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={accent} />
                </div>
                <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{title}</h2>
            </div>
            <div style={{ padding: '1.5rem' }}>{children}</div>
        </motion.div>
    );
}

// ─── Tab: Consultorio ─────────────────────────────────────────────────────────

function ClinicTab({ onToast }: { onToast: (m: string, t: 'success' | 'error') => void }) {
    const [info, setInfo] = useState<ClinicInfo>({ name: '', address: '', phone: '', email: '', cuit: '', website: '' });

    useEffect(() => { setInfo(getClinicInfo()); }, []);

    const set = (k: keyof ClinicInfo) => (v: string) => setInfo(p => ({ ...p, [k]: v }));

    const save = () => {
        saveClinicInfo(info);
        onToast('Información del consultorio guardada', 'success');
    };

    return (
        <SectionCard title="Información del Consultorio" icon={Building2} accent="#1d4ed8">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                <Field label="Nombre del Consultorio" icon={Building2} value={info.name} onChange={set('name')} placeholder="DentalCare Consultorio" />
                <Field label="Dirección" icon={MapPin} value={info.address} onChange={set('address')} placeholder="Av. Siempreviva 742" />
                <Field label="Teléfono" icon={Phone} value={info.phone} onChange={set('phone')} placeholder="+54 11 1234-5678" />
                <Field label="Email" icon={Mail} value={info.email} onChange={set('email')} placeholder="info@dentalcare.com" />
                <Field label="CUIT" icon={FileText} value={info.cuit} onChange={set('cuit')} placeholder="20-12345678-9" />
                <Field label="Sitio web" icon={Globe} value={info.website} onChange={set('website')} placeholder="www.dentalcare.com" />
            </div>
            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={save} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem', borderRadius: '0.75rem', border: 'none', background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)', color: 'white', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(29,78,216,0.35)' }}>
                    <Save size={16} /> Guardar Cambios
                </motion.button>
            </div>
        </SectionCard>
    );
}

// ─── Tab: Mi Cuenta ───────────────────────────────────────────────────────────

function AccountTab({ onToast }: { onToast: (m: string, t: 'success' | 'error') => void }) {
    const me = getCurrentUser();
    const [displayName, setDisplayName] = useState(me?.displayName ?? '');
    const [current, setCurrent] = useState('');
    const [next, setNext] = useState('');
    const [repeat, setRepeat] = useState('');

    const saveName = () => {
        if (!me) return;
        const r = updateUser(me.username, { displayName });
        onToast(r.ok ? 'Nombre actualizado' : r.error!, r.ok ? 'success' : 'error');
    };

    const savePass = () => {
        if (!me) return;
        const users = getAllUsers();
        const stored = users.find(u => u.username === me.username);
        if (!stored || stored.password !== current) { onToast('Contraseña actual incorrecta', 'error'); return; }
        if (!next || next.length < 6) { onToast('La nueva contraseña debe tener al menos 6 caracteres', 'error'); return; }
        if (next !== repeat) { onToast('Las contraseñas no coinciden', 'error'); return; }
        const r = updateUser(me.username, { password: next });
        if (r.ok) { setCurrent(''); setNext(''); setRepeat(''); onToast('Contraseña actualizada', 'success'); }
        else onToast(r.error!, 'error');
    };

    return (
        <>
            <SectionCard title="Mi Perfil" icon={User} accent="#7c3aed">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                    <Field label="Nombre a mostrar" icon={User} value={displayName} onChange={setDisplayName} placeholder="Administrador" />
                    <Field label="Usuario (no editable)" icon={Shield} value={me?.username ?? ''} onChange={() => { }} disabled />
                    <Field label="Rol (no editable)" icon={Shield} value={me?.role ?? ''} onChange={() => { }} disabled />
                </div>
                <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={saveName} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem', borderRadius: '0.75rem', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', color: 'white', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}>
                        <Save size={16} /> Guardar Nombre
                    </motion.button>
                </div>
            </SectionCard>

            <SectionCard title="Cambiar Contraseña" icon={Lock} accent="#0891b2">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                    <Field label="Contraseña actual" icon={Lock} type="password" value={current} onChange={setCurrent} />
                    <Field label="Nueva contraseña" icon={Lock} type="password" value={next} onChange={setNext} placeholder="Mín. 6 caracteres" />
                    <Field label="Repetir nueva contraseña" icon={Lock} type="password" value={repeat} onChange={setRepeat} />
                </div>
                <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={savePass} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem', borderRadius: '0.75rem', border: 'none', background: 'linear-gradient(135deg, #0891b2, #06b6d4)', color: 'white', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(8,145,178,0.3)' }}>
                        <Lock size={16} /> Cambiar Contraseña
                    </motion.button>
                </div>
            </SectionCard>
        </>
    );
}

// ─── Tab: Usuarios ────────────────────────────────────────────────────────────

function UsersTab({ onToast }: { onToast: (m: string, t: 'success' | 'error') => void }) {
    const [users, setUsers] = useState<StoredUser[]>([]);
    const [form, setForm] = useState({ username: '', displayName: '', password: '', role: 'usuario' as 'admin' | 'usuario' | 'secretario' });
    const [showForm, setShowForm] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

    const refresh = () => setUsers(getAllUsers());
    useEffect(refresh, []);

    const handleAdd = () => {
        if (!form.username || !form.password || !form.displayName) { onToast('Completá todos los campos', 'error'); return; }
        if (form.password.length < 6) { onToast('La contraseña debe tener al menos 6 caracteres', 'error'); return; }
        const r = addUser(form as StoredUser);
        if (r.ok) { refresh(); setForm({ username: '', displayName: '', password: '', role: 'usuario' }); setShowForm(false); onToast('Usuario creado', 'success'); }
        else onToast(r.error!, 'error');
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        const r = deleteUser(deleteTarget);
        if (r.ok) { refresh(); onToast('Usuario eliminado', 'success'); }
        else onToast(r.error!, 'error');
        setDeleteTarget(null);
    };

    const roleBadge = (role: string) => {
        const bg = role === 'admin' ? '#dbeafe' : role === 'secretario' ? '#fef9c3' : '#f1f5f9';
        const color = role === 'admin' ? '#1d4ed8' : role === 'secretario' ? '#854d0e' : '#475569';
        return (
            <span style={{ padding: '2px 10px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 700, background: bg, color }}>
                {role}
            </span>
        );
    };

    return (
        <SectionCard title="Gestión de Usuarios" icon={Users} accent="#059669">
            {/* User list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {users.map(u => (
                    <motion.div key={u.username} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', borderRadius: '0.875rem', background: '#f8fafc', border: '1.5px solid #f1f5f9' }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: u.role === 'admin' ? 'linear-gradient(135deg,#1d4ed8,#3b82f6)' : 'linear-gradient(135deg,#059669,#34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
                            {u.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{u.displayName}</p>
                            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>@{u.username}</p>
                        </div>
                        {roleBadge(u.role)}
                        {u.username !== 'admin' && (
                            <button onClick={() => setDeleteTarget(u.username)} style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '0.625rem', padding: '0.375rem 0.625rem', cursor: 'pointer', color: '#ef4444', display: 'flex' }}>
                                <Trash2 size={15} />
                            </button>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Add form toggle */}
            <AnimatePresence>
                {showForm ? (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '1rem', border: '1.5px solid #e2e8f0', marginTop: '0.25rem' }}>
                            <h3 style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', marginBottom: '1rem' }}>Nuevo Usuario</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.875rem' }}>
                                <Field label="Nombre a mostrar" icon={User} value={form.displayName} onChange={v => setForm(p => ({ ...p, displayName: v }))} placeholder="Ejemplo: Dr. García" />
                                <Field label="Nombre de usuario" icon={Shield} value={form.username} onChange={v => setForm(p => ({ ...p, username: v.toLowerCase().replace(/\s/g, '') }))} placeholder="dr.garcia" />
                                <Field label="Contraseña" icon={Lock} type="password" value={form.password} onChange={v => setForm(p => ({ ...p, password: v }))} placeholder="Mín. 6 caracteres" />
                                <div>
                                    <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.35rem' }}>Rol</label>
                                    <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as 'admin' | 'usuario' | 'secretario' }))} style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', color: '#0f172a', outline: 'none' }}>
                                        <option value="usuario">Usuario</option>
                                        <option value="secretario">Secretario</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button onClick={() => setShowForm(false)} style={{ padding: '0.6rem 1.1rem', borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 600, cursor: 'pointer', color: '#475569' }}>Cancelar</button>
                                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: 'none', background: 'linear-gradient(135deg, #059669, #34d399)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                                    <CheckCircle size={15} /> Crear Usuario
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '0.875rem', border: '2px dashed #059669', background: '#f0fdf4', color: '#059669', fontWeight: 700, cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
                        <Plus size={18} /> Agregar Usuario
                    </motion.button>
                )}
            </AnimatePresence>

            <ConfirmModal
                isOpen={!!deleteTarget}
                title="¿Eliminar usuario?"
                message={`El usuario "@${deleteTarget}" será eliminado permanentemente.`}
                confirmLabel="Sí, eliminar"
                cancelLabel="Cancelar"
                isDanger
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </SectionCard>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS = [
    { id: 'consultorio', label: 'Consultorio', icon: Building2 },
    { id: 'cuenta', label: 'Mi Cuenta', icon: User },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
] as const;

type TabId = typeof TABS[number]['id'];

export default function ConfiguracionPage() {
    const [tab, setTab] = useState<TabId>('consultorio');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

    const me = getCurrentUser();

    return (
        <div className="page-container" style={{ maxWidth: '860px' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                    Configuración
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Administrá el consultorio, tu cuenta y los usuarios del sistema.
                </p>
            </div>

            {/* Tab bar */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', background: '#f1f5f9', padding: '0.35rem', borderRadius: '1rem', width: 'fit-content' }}>
                {TABS.map(t => {
                    // Hide users tab for non-admin
                    if (t.id === 'usuarios' && me?.role !== 'admin') return null;
                    const active = tab === t.id;
                    return (
                        <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.1rem', borderRadius: '0.75rem', border: 'none', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.15s', background: active ? 'white' : 'transparent', color: active ? '#1d4ed8' : '#64748b', boxShadow: active ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' }}>
                            <t.icon size={16} />
                            {t.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
                <motion.div key={tab} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>
                    {tab === 'consultorio' && <ClinicTab onToast={showToast} />}
                    {tab === 'cuenta' && <AccountTab onToast={showToast} />}
                    {tab === 'usuarios' && me?.role === 'admin' && <UsersTab onToast={showToast} />}
                </motion.div>
            </AnimatePresence>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
