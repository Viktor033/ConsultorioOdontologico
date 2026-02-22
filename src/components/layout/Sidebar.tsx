"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Home,
    Users,
    Calendar,
    Stethoscope,
    Settings,
    LogOut,
    ChevronLeft,
    Menu
} from 'lucide-react';
import { ToothIcon } from '@/components/ui/Icons';
import { AuthUser, logout } from '@/lib/auth';

const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/' },
    { id: 'pacientes', icon: Users, label: 'Pacientes', path: '/pacientes' },
    { id: 'calendario', icon: Calendar, label: 'Calendario', path: '/calendario' },
    { id: 'odontograma', icon: ToothIcon, label: 'Odontograma', path: '/odontograma' },
];

export default function Sidebar({ user }: { user?: AuthUser | null }) {
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 80 : 280 }}
            style={{
                position: 'fixed',
                left: 0,
                top: 0,
                height: '100vh',
                backgroundColor: 'var(--bg-card)',
                borderRight: '1px solid var(--border-light)',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden'
            }}
        >
            {/* Logo Section */}
            <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--bg-main)' }}>
                <div style={{
                    minWidth: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                }}>
                    <ToothIcon size={24} color="white" />
                </div>
                {!isCollapsed && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.025em' }}>DentalCare</h2>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Portal Premium</p>
                    </motion.div>
                )}
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1, padding: '1.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                        <Link key={item.id} href={item.path} style={{ textDecoration: 'none' }}>
                            <motion.div
                                whileHover={{ x: 4 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '0.875rem 1rem',
                                    borderRadius: '0.75rem',
                                    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                    backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                                    fontWeight: isActive ? 700 : 500,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <item.icon size={22} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
                                {!isCollapsed && <span>{item.label}</span>}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div style={{ padding: '1.5rem 0.75rem', borderTop: '1px solid var(--bg-main)' }}>
                {/* User info */}
                {user && !isCollapsed && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.75rem 1rem', marginBottom: '0.5rem',
                        background: 'var(--primary-light)', borderRadius: '0.75rem',
                    }}>
                        <div style={{
                            width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 800, fontSize: '0.8rem',
                        }}>
                            {user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.2 }}>{user.displayName}</p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{user.role}</p>
                        </div>
                    </div>
                )}
                <Link href="/configuracion" style={{ textDecoration: 'none' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '0.875rem 1rem', borderRadius: '0.75rem',
                        color: pathname === '/configuracion' ? 'var(--primary)' : 'var(--text-muted)',
                        backgroundColor: pathname === '/configuracion' ? 'var(--primary-light)' : 'transparent',
                        fontWeight: pathname === '/configuracion' ? 700 : 500,
                        cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                        <Settings size={22} color={pathname === '/configuracion' ? 'var(--primary)' : 'var(--text-muted)'} />
                        {!isCollapsed && <span>Configuración</span>}
                    </div>
                </Link>
                <div
                    onClick={() => { logout(); router.replace('/login'); }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.875rem 1rem',
                        borderRadius: '0.75rem',
                        color: '#ef4444',
                        cursor: 'pointer'
                    }}
                >
                    <LogOut size={22} />
                    {!isCollapsed && <span>Cerrar Sesión</span>}
                </div>
            </div>

            {/* Collapse Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                style={{
                    position: 'absolute',
                    right: '-12px',
                    top: '90px',
                    padding: '4px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    border: '1px solid var(--border-light)',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)'
                }}
            >
                <ChevronLeft size={16} style={{ transition: 'transform 0.3s', transform: isCollapsed ? 'rotate(180deg)' : 'none' }} />
            </button>
        </motion.aside>
    );
}
