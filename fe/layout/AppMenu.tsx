/* eslint-disable @next/next/no-img-element */

import React, { useContext, useEffect, useState } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { AppMenuItem } from '@/types';
import { AuthService } from '@/service/AuthService';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);

    const [accesos, setAccesos] = useState<string[] | null>(null);

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        setAccesos(user?.accesos ? user.accesos.split(',').map((r) => r.trim()) : null);
    }, []);

    const filterItems = (items: AppMenuItem[]): AppMenuItem[] => {
        if (!accesos) return items;
        return items.filter((item) => !item.to || accesos.includes(item.to));
    };

    const rawModel: AppMenuItem[] = [
        {
            label: 'Home',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
        },
        {
            label: 'Store',
            items: [{ label: 'Tienda', icon: 'pi pi-fw pi-shopping-bag', to: '/products' }]
        },
        {
            label: 'Admin',
            items: [
                { label: 'Gestión de Productos', icon: 'pi pi-fw pi-cog', to: '/admin/products' },
                { label: 'Tipos de Producto', icon: 'pi pi-fw pi-tags', to: '/admin/product-types' },
                { label: 'Marcas', icon: 'pi pi-fw pi-bookmark', to: '/admin/brands' },
                { label: 'Tipos de Descuento', icon: 'pi pi-fw pi-percentage', to: '/admin/discount-types' },
                { label: 'Descuentos', icon: 'pi pi-fw pi-ticket', to: '/admin/discounts' },
                { label: 'Proveedores', icon: 'pi pi-fw pi-truck', to: '/admin/suppliers' },
                { label: 'Roles', icon: 'pi pi-fw pi-users', to: '/admin/roles' }
            ]
        },
        {
            label: 'Inventario',
            items: [
                { label: 'Inventario', icon: 'pi pi-fw pi-box', to: '/admin/inventory' },
                { label: 'Ubicaciones', icon: 'pi pi-fw pi-map-marker', to: '/admin/inventory-locations' }
            ]
        }
    ];

    const model = rawModel
        .map((group) => ({ ...group, items: filterItems(group.items ?? []) }))
        .filter((group) => (group.items ?? []).length > 0);

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator" key={`separator-${i}`}></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
