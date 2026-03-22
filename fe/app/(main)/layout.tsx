'use client';
import React from 'react';
import { CartProvider } from '../../context/CartContext';
import Layout from '../../layout/layout';

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <CartProvider>
            <Layout>{children}</Layout>
        </CartProvider>
    );
}
