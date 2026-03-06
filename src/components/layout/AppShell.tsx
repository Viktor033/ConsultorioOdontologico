"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, AuthUser } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';
import { Menu } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<AuthUser | null | 'loading'>('loading');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle

    useEffect(() => {
        const current = getCurrentUser();
        if (!current && pathname !== '/login') {
            router.replace('/login');
        } else {
            setUser(current);
        }
    }, [pathname, router]);

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    if (pathname === '/login') {
        return <>{children}</>;
    }

    if (user === 'loading') return null;
    if (!user) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)', position: 'relative' }}>
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 45,
                        backdropFilter: 'blur(4px)'
                    }}
                />
            )}

            <Sidebar user={user} isOpenMobile={isSidebarOpen} setIsOpenMobile={setIsSidebarOpen} />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
                {/* Mobile Header */}
                <header className="mobile-only" style={{
                    height: 'var(--header-height)',
                    backgroundColor: 'var(--bg-card)',
                    borderBottom: '1px solid var(--border-light)',
                    padding: '0 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 40
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
                        >
                            <Menu size={24} color="var(--text-main)" />
                        </button>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>DentalCare</h1>
                    </div>
                </header>

                <main style={{
                    flex: 1,
                    width: '100%',
                    paddingLeft: '0',
                    // On desktop, we need padding for the fixed sidebar. 
                    // This is handled via responsive CSS or inline dynamic style.
                    marginLeft: '0',
                    transition: 'all 0.3s'
                }}>
                    <div style={{
                        marginLeft: 'var(--sidebar-width)',
                        // Simple media query fix via standard responsive approach is hard in inline style
                        // We'll use a class that overrides this on mobile
                    }} className="main-content-wrapper">
                        {children}
                    </div>
                </main>
            </div>

            <style jsx global>{`
                @media (min-width: 1025px) {
                    .main-content-wrapper {
                        margin-left: var(--sidebar-width) !important;
                    }
                }
                @media (max-width: 1024px) {
                    .main-content-wrapper {
                        margin-left: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
}
