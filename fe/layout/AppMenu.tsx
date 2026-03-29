/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { AppMenuItem } from '@/types';

const AppMenu = () => {
    const { layoutConfig } = useContext(LayoutContext);

    const model: AppMenuItem[] = [
        {
            label: 'Home',
            items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }]
        },
        {
            label: 'Store',
            items: [{ label: 'Products', icon: 'pi pi-fw pi-shopping-bag', to: '/products' }]
        },
        {
            label: 'Admin',
            items: [
                { label: 'Manage Products', icon: 'pi pi-fw pi-cog', to: '/admin/products' },
                { label: 'Tipos de Producto', icon: 'pi pi-fw pi-tags', to: '/admin/product-types' },
                { label: 'Marcas', icon: 'pi pi-fw pi-bookmark', to: '/admin/brands' }
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
