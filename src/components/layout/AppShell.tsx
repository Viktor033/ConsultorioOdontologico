"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, AuthUser } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<AuthUser | null | 'loading'>('loading');

    useEffect(() => {
        const current = getCurrentUser();
        if (!current && pathname !== '/login') {
            router.replace('/login');
        } else {
            setUser(current);
        }
    }, [pathname, router]);

    // Login page: render with no sidebar
    if (pathname === '/login') {
        return <>{children}</>;
    }

    // Still resolving auth
    if (user === 'loading') {
        return null;
    }

    // Not authenticated — redirect happening, render nothing
    if (!user) {
        return null;
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
            <Sidebar user={user} />
            <main style={{
                flex: 1,
                marginLeft: '0',
                paddingLeft: 'var(--sidebar-width)',
                width: '100%',
                overflowX: 'hidden',
            }}>
                {children}
            </main>
        </div>
    );
}
