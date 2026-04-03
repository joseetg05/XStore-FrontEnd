'use client';
import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CartProvider } from '../../context/CartContext';
import Layout from '../../layout/layout';
import { AuthService } from '../../service/AuthService';

const PUBLIC_ROUTES = ['/products'];

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const isPublic = PUBLIC_ROUTES.includes(pathname);
        if (isPublic) return;

        const user = AuthService.getCurrentUser();

        if (!user) {
            router.replace('/auth/login');
            return;
        }

        const accesos = user.accesos ? user.accesos.split(',').map((r) => r.trim()) : [];
        if (!accesos.includes(pathname)) {
            router.replace('/products');
        }
    }, [pathname, router]);

    return (
        <CartProvider>
            <Layout>{children}</Layout>
        </CartProvider>
    );
}
