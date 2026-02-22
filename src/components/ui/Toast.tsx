"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    onClose: () => void;
    duration?: number; // ms
}

const config = {
    success: { bg: '#ecfdf5', border: '#6ee7b7', color: '#065f46', Icon: CheckCircle, iconColor: '#10b981' },
    error: { bg: '#fef2f2', border: '#fecaca', color: '#991b1b', Icon: XCircle, iconColor: '#ef4444' },
    info: { bg: '#eff6ff', border: '#bfdbfe', color: '#1e40af', Icon: Info, iconColor: '#3b82f6' },
};

export default function Toast({ message, type = 'success', onClose, duration = 3500 }: ToastProps) {
    useEffect(() => {
        const t = setTimeout(onClose, duration);
        return () => clearTimeout(t);
    }, [onClose, duration]);

    const { bg, border, color, Icon, iconColor } = config[type];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 60, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 60, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{
                    position: 'fixed',
                    bottom: '1.5rem',
                    right: '1.5rem',
                    zIndex: 300,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.875rem 1.25rem',
                    borderRadius: '1rem',
                    background: bg,
                    border: `1px solid ${border}`,
                    color,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                    maxWidth: '380px',
                    minWidth: '240px',
                }}
            >
                <Icon size={20} color={iconColor} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{message}</span>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color, opacity: 0.6 }}
                >
                    <X size={16} />
                </button>
            </motion.div>
        </AnimatePresence>
    );
}
