/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AppTopbarRef } from '@/types';
import { LayoutContext } from './context/layoutcontext';
import { AuthService } from '@/service/AuthService';

const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { layoutConfig, layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);
    const pathname = usePathname();
    const isProductsPage = pathname === '/products' || pathname === '/checkout';
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        setIsAuthenticated(AuthService.isAuthenticated());
    }, [pathname]);

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    return (
        <div className="layout-topbar">
            <Link href="/" className="layout-topbar-logo">
                <img src={`/layout/images/logo-${layoutConfig.colorScheme !== 'light' ? 'white' : 'dark'}.svg`} width="47.22px" height={'35px'} alt="logo" />
                <span>SAKAI</span>
            </Link>


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
                    style={{ marginLeft: isProductsPage ? 'auto' : undefined, display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.5rem 1.25rem', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}
                    onClick={() => {
                        AuthService.logout();
                        setIsAuthenticated(false);
                        window.location.href = '/products';
                    }}
                >
                    <i className="pi pi-sign-out" />
                    Cerrar Sesión
                </button>
            )}

            {!isProductsPage && (
                <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                    <i className="pi pi-bars" />
                </button>
            )}

            <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
                <i className="pi pi-ellipsis-v" />
            </button>


            {!isProductsPage && (
                <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
                    <button type="button" className="p-link layout-topbar-button">
                        <i className="pi pi-calendar"></i>
                        <span>Calendar</span>
                    </button>
                    <button type="button" className="p-link layout-topbar-button">
                        <i className="pi pi-user"></i>
                        <span>Profile</span>
                    </button>
                    <Link href="/documentation">
                        <button type="button" className="p-link layout-topbar-button">
                            <i className="pi pi-cog"></i>
                            <span>Settings</span>
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
