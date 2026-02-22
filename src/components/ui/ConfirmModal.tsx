"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDanger?: boolean;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    onConfirm,
    onCancel,
    isDanger = true,
}: ConfirmModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onCancel}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 200,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(15, 23, 42, 0.55)',
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 30 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                        onClick={e => e.stopPropagation()}
                        style={{
                            width: '90%',
                            maxWidth: '420px',
                            borderRadius: '1.5rem',
                            overflow: 'hidden',
                            boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5)',
                        }}
                    >
                        {/* Gradient top bar */}
                        <div style={{
                            height: '6px',
                            background: isDanger
                                ? 'linear-gradient(90deg, #ef4444, #f97316)'
                                : 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                        }} />

                        <div style={{ background: 'white', padding: '2rem' }}>
                            {/* Close button */}
                            <button onClick={onCancel} style={{
                                position: 'absolute', top: '1.25rem', right: '1.25rem',
                                background: '#f1f5f9', border: 'none', borderRadius: '50%',
                                width: '28px', height: '28px', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                            }}>
                                <X size={14} color="#64748b" />
                            </button>

                            {/* Icon */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                                style={{
                                    width: '64px', height: '64px', borderRadius: '50%',
                                    background: isDanger ? '#fef2f2' : '#eff6ff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '1.25rem',
                                }}
                            >
                                {isDanger
                                    ? <Trash2 size={28} color="#ef4444" />
                                    : <AlertTriangle size={28} color="#3b82f6" />}
                            </motion.div>

                            {/* Title */}
                            <h3 style={{
                                fontSize: '1.25rem', fontWeight: 800, color: '#0f172a',
                                marginBottom: '0.5rem',
                            }}>
                                {title}
                            </h3>
                            <p style={{
                                fontSize: '0.9rem', color: '#64748b',
                                lineHeight: 1.65, marginBottom: '2rem',
                            }}>
                                {message}
                            </p>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button
                                    onClick={onCancel}
                                    style={{
                                        flex: 1, padding: '0.75rem', borderRadius: '0.875rem',
                                        border: '1.5px solid #e2e8f0', background: 'white',
                                        fontWeight: 700, cursor: 'pointer', color: '#475569',
                                        fontSize: '0.9rem',
                                    }}
                                >
                                    {cancelLabel}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    style={{
                                        flex: 1, padding: '0.75rem', borderRadius: '0.875rem',
                                        border: 'none',
                                        background: isDanger
                                            ? 'linear-gradient(135deg, #ef4444, #f97316)'
                                            : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                                        color: 'white', fontWeight: 700, cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        boxShadow: isDanger
                                            ? '0 4px 16px rgba(239, 68, 68, 0.4)'
                                            : '0 4px 16px rgba(59, 130, 246, 0.4)',
                                    }}
                                >
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
