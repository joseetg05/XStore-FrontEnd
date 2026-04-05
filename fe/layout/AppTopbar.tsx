/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AppTopbarRef } from '@/types';
import { LayoutContext } from './context/layoutcontext';
import { AuthService } from '@/service/AuthService';

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { layoutConfig, onMenuToggle } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const pathname = usePathname();
    const isCheckout = pathname === '/checkout';
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        setIsAuthenticated(AuthService.isAuthenticated());
    }, [pathname]);

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current
    }));

    return (
        <div className="layout-topbar">
            <Link href="/" className="layout-topbar-logo">
                <img src="/layout/images/logo.png" height="70px" alt="XStore" />
            </Link>

            {isAuthenticated && !isCheckout && (
                <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                    <i className="pi pi-bars" />
                </button>
            )}

            {!isAuthenticated && (
                <Link
                    href="/auth/login"
                    style={{ textDecoration: 'none', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 1.25rem', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}
                >
                    <i className="pi pi-sign-in" />
                    Iniciar Sesión
                </Link>
            )}

            {isAuthenticated && (
                <button
                    type="button"
                    style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 1.25rem', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}
                    onClick={() => {
                        AuthService.logout();
                        setIsAuthenticated(false);
                        window.location.href = '/shop';
                    }}
                >
                    <i className="pi pi-sign-out" />
                    Cerrar Sesión
                </button>
            )}
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
