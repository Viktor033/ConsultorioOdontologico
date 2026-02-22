"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { login } from '@/lib/auth';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 600)); // subtle loading feel
        const user = login(username.trim(), password);
        if (user) {
            router.replace('/');
        } else {
            setError('Usuario o contraseña incorrectos.');
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0c1445 0%, #1a3a6e 45%, #0891b2 100%)',
            padding: '1rem',
        }}>
            {/* Background blobs */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(59,130,246,0.15)', filter: 'blur(80px)' }} />
                <div style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(8,145,178,0.12)', filter: 'blur(80px)' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 32, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                style={{
                    width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1,
                    background: 'white', borderRadius: '1.75rem',
                    boxShadow: '0 40px 80px -16px rgba(0,0,0,0.45)',
                    overflow: 'hidden',
                }}
            >
                {/* Gradient top stripe */}
                <div style={{
                    height: '5px',
                    background: 'linear-gradient(90deg, #1d4ed8, #3b82f6, #0891b2)',
                }} />

                <div style={{ padding: '2.5rem 2.25rem' }}>
                    {/* Logo / branding */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 1rem',
                            background: 'linear-gradient(135deg, #1d4ed8, #0891b2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem',
                            boxShadow: '0 8px 24px rgba(29,78,216,0.35)',
                        }}>
                            🦷
                        </div>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                            DentalCare
                        </h1>
                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                            Sistema de Gestión Odontológica
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    background: '#fef2f2', border: '1.5px solid #fca5a5',
                                    color: '#b91c1c', borderRadius: '0.75rem',
                                    padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: 600,
                                }}
                            >
                                <AlertCircle size={16} />
                                {error}
                            </motion.div>
                        )}

                        {/* Username */}
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.4rem' }}>
                                Usuario
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="admin"
                                autoComplete="username"
                                required
                                style={{
                                    width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem',
                                    border: '1.5px solid #e2e8f0', background: '#f8fafc',
                                    fontSize: '1rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box',
                                }}
                                onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.4rem' }}>
                                Contraseña
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    required
                                    style={{
                                        width: '100%', padding: '0.75rem 3rem 0.75rem 1rem', borderRadius: '0.75rem',
                                        border: '1.5px solid #e2e8f0', background: '#f8fafc',
                                        fontSize: '1rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box',
                                    }}
                                    onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                                    onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(p => !p)}
                                    style={{
                                        position: 'absolute', right: '0.875rem', top: '50%',
                                        transform: 'translateY(-50%)', background: 'none', border: 'none',
                                        cursor: 'pointer', color: '#94a3b8', display: 'flex',
                                    }}
                                >
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                width: '100%', padding: '0.875rem', borderRadius: '0.875rem', border: 'none',
                                background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                                color: 'white', fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                boxShadow: '0 4px 18px rgba(29,78,216,0.4)',
                                opacity: isLoading ? 0.85 : 1, marginTop: '0.5rem',
                            }}
                        >
                            {isLoading
                                ? <><Loader2 size={20} className="animate-spin" /> Ingresando…</>
                                : <><LogIn size={20} /> Ingresar</>}
                        </motion.button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
                        © 2025 DentalCare · Todos los derechos reservados
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
