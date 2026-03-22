'use client';
import React from 'react';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { InputNumber } from 'primereact/inputnumber';
import { Sidebar } from 'primereact/sidebar';

import { useCart } from '../../../context/CartContext';
import { Discount, ProductService } from '../../../service/ProductService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
    value.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' });

const PLACEHOLDER_IMAGE = 'https://static.thenounproject.com/png/504708-200.png';

// ─── CartSidebar ──────────────────────────────────────────────────────────────

interface CartSidebarProps {
    visible: boolean;
    onHide: () => void;
}

const CartSidebar = ({ visible, onHide }: CartSidebarProps) => {
    const { cartItems, removeFromCart, updateQuantity, clearCart, getTotals } = useCart();
    const [discounts, setDiscounts] = React.useState<Discount[]>([]);

    React.useEffect(() => {
        ProductService.getDiscounts().then(setDiscounts);
    }, []);

    const { totalItems, subtotal, total } = getTotals();
    const isEmpty = cartItems.length === 0;

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = PLACEHOLDER_IMAGE;
    };

    return (
        <Sidebar
            visible={visible}
            onHide={onHide}
            position="right"
            header={
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-shopping-cart text-xl" />
                    <span className="font-semibold text-lg">Carrito de Compras</span>
                    {totalItems > 0 && (
                        <span className="ml-1 text-sm text-500">({totalItems} artículo{totalItems !== 1 ? 's' : ''})</span>
                    )}
                </div>
            }
            className="w-full md:w-26rem"
            style={{ display: 'flex', flexDirection: 'column' }}
        >
            <div className="flex flex-column h-full">
                {/* ── Empty State ── */}
                {isEmpty ? (
                    <div className="flex flex-column align-items-center justify-content-center flex-1 gap-3 py-8 text-center">
                        <i className="pi pi-shopping-cart" style={{ fontSize: '3.5rem', color: 'var(--text-color-secondary)' }} />
                        <h4 className="m-0 text-900">Tu carrito está vacío</h4>
                        <p className="text-500 m-0">Agrega algunos productos para comenzar.</p>
                    </div>
                ) : (
                    <>
                        {/* ── Item List ── */}
                        <div className="flex flex-column gap-3 flex-1 overflow-y-auto pb-3">
                            {cartItems.map((item) => {
                                const discount = discounts.find((d) => d.id === item.product.discountId);
                                const unitPrice = discount ? item.product.salePrice * (1 - discount.percentage / 100) : item.product.salePrice;
                                const lineTotal = unitPrice * item.quantity;

                                return (
                                    <div key={item.product.id} className="flex gap-3 align-items-start p-2 border-round surface-50 border-1 surface-border">
                                        {/* Thumbnail */}
                                        <div
                                            className="flex-shrink-0 flex align-items-center justify-content-center border-round surface-100"
                                            style={{ width: '72px', height: '72px', overflow: 'hidden' }}
                                        >
                                            <img
                                                src={item.product.imageUrl}
                                                alt={item.product.description}
                                                onError={handleImageError}
                                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="flex flex-column gap-1 flex-1 min-w-0">
                                            <span className="text-900 font-semibold text-sm line-clamp-2" style={{ lineHeight: '1.3' }}>
                                                {item.product.description}
                                            </span>
                                            <div className="flex align-items-center gap-2">
                                                <span className="text-900 font-medium text-xs" style={{ color: discount ? '#e91e63' : 'inherit' }}>
                                                    {formatCurrency(unitPrice)}
                                                </span>
                                                {discount && (
                                                    <span className="text-500 text-xs line-through">{formatCurrency(item.product.salePrice)}</span>
                                                )}
                                                <span className="text-500 text-xs">/ unidad</span>
                                            </div>

                                            {/* Quantity + Delete row */}
                                            <div className="flex align-items-center gap-2 mt-1">
                                                <InputNumber
                                                    value={item.quantity}
                                                    onValueChange={(e) => updateQuantity(item.product.id, e.value ?? 1)}
                                                    min={1}
                                                    max={999}
                                                    showButtons
                                                    buttonLayout="horizontal"
                                                    decrementButtonClassName="p-button-secondary p-button-sm"
                                                    incrementButtonClassName="p-button-secondary p-button-sm"
                                                    incrementButtonIcon="pi pi-plus"
                                                    decrementButtonIcon="pi pi-minus"
                                                    inputStyle={{ width: '2.5rem', textAlign: 'center', padding: '0.25rem' }}
                                                />
                                                <Button
                                                    icon="pi pi-trash"
                                                    severity="danger"
                                                    text
                                                    rounded
                                                    size="small"
                                                    tooltip="Eliminar"
                                                    tooltipOptions={{ position: 'top' }}
                                                    onClick={() => removeFromCart(item.product.id)}
                                                />
                                            </div>
                                        </div>

                                        {/* Line total */}
                                        <div className="flex-shrink-0 font-bold text-sm text-right" style={{ color: 'var(--primary-color)', minWidth: '4rem' }}>
                                            {formatCurrency(lineTotal)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ── Summary ── */}
                        <div className="mt-auto">
                            <Divider className="mb-2 mt-0" />
                            <div className="flex justify-content-between text-sm text-600 mb-1">
                                <span>Total de artículos</span>
                                <span className="font-medium text-900">{totalItems}</span>
                            </div>
                            <div className="flex justify-content-between text-sm text-600 mb-1">
                                <span>Subtotal</span>
                                <span className="font-medium text-900">{formatCurrency(subtotal)}</span>
                            </div>
                            <Divider className="my-2" />
                            <div className="flex justify-content-between text-base font-bold text-900 mb-3">
                                <span>Total</span>
                                <span style={{ color: 'var(--primary-color)' }}>{formatCurrency(total)}</span>
                            </div>

                            {/* Checkout + Clear buttons */}
                            <Button
                                label="Proceder al Pago"
                                icon="pi pi-credit-card"
                                className="w-full mb-2"
                                disabled={isEmpty}
                                // TODO: connect to checkout flow in a future ticket
                            />
                            <Button
                                label="Vaciar Carrito"
                                icon="pi pi-times"
                                severity="secondary"
                                outlined
                                className="w-full"
                                onClick={clearCart}
                            />
                        </div>
                    </>
                )}
            </div>
        </Sidebar>
    );
};

export default CartSidebar;
