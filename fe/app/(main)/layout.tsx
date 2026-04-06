'use client';
import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CartProvider } from '../../context/CartContext';
import Layout from '../../layout/layout';
import { AuthService } from '../../service/AuthService';

const PUBLIC_ROUTES = ['/shop'];
const AUTH_ROUTES = ['/checkout', '/profile']; // accesibles para cualquier usuario logueado

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (PUBLIC_ROUTES.includes(pathname)) return;

        const user = AuthService.getCurrentUser();

        if (!user) {
            router.replace('/auth/login');
            return;
        }

        if (AUTH_ROUTES.includes(pathname)) return;

        const accesos = user.accesos ? user.accesos.split(',').map((r) => r.trim()) : [];
        if (!accesos.includes(pathname)) {
            router.replace('/shop');
        }
    }, [pathname, router]);

    return (
        <CartProvider>
            <Layout>{children}</Layout>
        </CartProvider>
    );
}
