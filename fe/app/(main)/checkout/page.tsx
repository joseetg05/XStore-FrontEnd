'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';

import { useCart } from '../../../context/CartContext';
import { AuthService, User } from '../../../service/AuthService';
import { FacturacionService, buildFacturaPayload } from '../../../service/FacturacionService';
import { UserService } from '../../../service/UserService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
    value.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' });

const formatCardNumber = (raw: string) =>
    raw.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

const formatExpiry = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    if (digits.length === 0) return '';
    // Corregir mes al completar los 2 dígitos
    let mm = digits.slice(0, 2);
    if (mm.length === 2) {
        const m = parseInt(mm, 10);
        if (m === 0) mm = '01';
        else if (m > 12) mm = '12';
    }
    if (digits.length >= 3) return `${mm}/${digits.slice(2)}`;
    return mm;
};

// ─── Installment Options ──────────────────────────────────────────────────────

const INSTALLMENT_OPTIONS = [
    { label: 'Contado (sin cuotas)', value: 0 },
    { label: '3 meses', value: 3 },
    { label: '6 meses', value: 6 },
    { label: '12 meses', value: 12 },
    { label: '24 meses', value: 24 }
];

// ─── Success Screen ───────────────────────────────────────────────────────────

interface SuccessScreenProps {
    onContinue: () => void
    invoiceNumber?: string
    upgrade?: { anterior: string; actual: string; mensaje: string } | null
}

const SuccessScreen = ({ onContinue, invoiceNumber, upgrade }: SuccessScreenProps) => (
    <div className="flex flex-column align-items-center justify-content-center py-8 gap-4 text-center" style={{ minHeight: '60vh' }}>
        <div
            className="flex align-items-center justify-content-center border-circle"
            style={{ width: '100px', height: '100px', background: 'linear-gradient(135deg, #4CAF50, #2E7D32)' }}
        >
            <i className="pi pi-check text-white" style={{ fontSize: '3rem' }} />
        </div>
        <h2 className="m-0 text-900 font-bold" style={{ fontSize: '1.75rem' }}>¡Pedido confirmado!</h2>
        {invoiceNumber && (
            <p className="m-0 text-500 text-sm font-medium">
                <i className="pi pi-receipt mr-2" />
                Factura: <span className="text-900 font-bold">{invoiceNumber}</span>
            </p>
        )}
        {upgrade && (
            <div
                className="flex flex-column align-items-center gap-1 px-4 py-3 border-round"
                style={{ background: 'linear-gradient(135deg, #fff8e1, #fffde7)', border: '2px solid #f9a825', maxWidth: '420px' }}
            >
                <i className="pi pi-star-fill" style={{ fontSize: '1.5rem', color: '#f9a825' }} />
                <span className="font-bold text-900" style={{ fontSize: '1.1rem' }}>{upgrade.mensaje}</span>
                <span className="text-sm text-700">
                    {upgrade.anterior} → <strong>{upgrade.actual}</strong>
                </span>
            </div>
        )}
        <p className="text-600 m-0" style={{ maxWidth: '520px', lineHeight: '1.7', fontSize: '1.05rem' }}>
            Tu pedido fue confirmado con éxito. Ahora comenzaremos a prepararlo cuidadosamente para su entrega.
            Te mantendremos al tanto del estado de tu compra y te avisaremos en cuanto tu pedido vaya en camino.
        </p>
        <div className="flex gap-3 mt-3">
            <i className="pi pi-box text-primary" style={{ fontSize: '1.5rem' }} />
            <i className="pi pi-truck text-primary" style={{ fontSize: '1.5rem' }} />
            <i className="pi pi-home text-primary" style={{ fontSize: '1.5rem' }} />
        </div>
        <Button
            label="Seguir comprando"
            icon="pi pi-arrow-left"
            className="mt-3"
            onClick={onContinue}
        />
    </div>
);

// ─── Checkout Page ────────────────────────────────────────────────────────────

const CheckoutPage = () => {
    const router = useRouter();
    const { cartItems, clearCart, getTotals, discounts } = useCart();
    const { subtotal, total, totalItems } = getTotals();

    const [customer, setCustomer] = useState<User | null>(null);

    // Card form state
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [installments, setInstallments] = useState<number>(0);

    const [isEditingCustomer, setIsEditingCustomer] = useState(false);
    const [tempCustomer, setTempCustomer] = useState<User | null>(null);

    // Process state
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [invoiceNumber, setInvoiceNumber] = useState<string | undefined>(undefined);
    const [invoiceUpgrade, setInvoiceUpgrade] = useState<{ anterior: string; actual: string; mensaje: string } | null>(null);
    const [clientDiscountPct, setClientDiscountPct] = useState(0);
    const [clientDiscountLabel, setClientDiscountLabel] = useState('');

    // Auth guard: redirect to login if not authenticated
    useEffect(() => {
        if (!AuthService.isAuthenticated()) {
            router.replace('/auth/login?redirect=/checkout');
            return;
        }
        const currentUser = AuthService.getCurrentUser();
        setCustomer(currentUser);
        setTempCustomer(currentUser ? { ...currentUser } : null);
        UserService.getOwn().then((persona) => {
            if (!persona?.descuento) return
            const pct = parseFloat(persona.descuento)
            if (!isNaN(pct) && pct > 0) {
                setClientDiscountPct(pct)
                setClientDiscountLabel(persona.tipoPersona || 'Tu categoría')
            }
        })
    }, [router]);

    // Redirect if cart is empty (and not yet in success state)
    useEffect(() => {
        if (!isSuccess && cartItems.length === 0) {
            router.replace('/shop');
        }
    }, [cartItems, isSuccess, router]);

    const getItemPrice = useCallback((salePrice: number, discountName: string) => {
        const discount = discounts.find((d) => d.name === discountName);
        return discount && discountName ? salePrice * (1 - discount.percentage / 100) : salePrice;
    }, [discounts]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (cardNumber.replace(/\s/g, '').length < 16)
            newErrors.cardNumber = 'Ingresa un número de tarjeta válido de 16 dígitos.';

        if (!cardName.trim())
            newErrors.cardName = 'Ingresa el nombre impreso en la tarjeta.';

        // Validar fecha de vencimiento
        if (expiry.length < 5) {
            newErrors.expiry = 'Ingresa la fecha en formato MM/AA.';
        } else {
            const [mmStr, yyStr] = expiry.split('/');
            const month = parseInt(mmStr, 10);
            const year = parseInt(yyStr, 10);
            if (isNaN(month) || month < 1 || month > 12) {
                newErrors.expiry = 'El mes debe estar entre 01 y 12.';
            } else if (isNaN(year) || yyStr.length !== 2) {
                newErrors.expiry = 'El año debe tener 2 dígitos (ej: 27).';
            } else {
                const now = new Date();
                const currentYear = now.getFullYear() % 100;  // últimos 2 dígitos
                const currentMonth = now.getMonth() + 1;
                if (year < currentYear || (year === currentYear && month < currentMonth)) {
                    newErrors.expiry = 'La tarjeta está vencida.';
                }
            }
        }

        if (cvv.replace(/\D/g, '').length !== 3)
            newErrors.cvv = 'El CVV debe tener exactamente 3 dígitos.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleConfirm = async () => {
        if (!validate()) return;
        if (!customer) return;
        setIsProcessing(true);
        setErrors({});
        try {
            const payload = buildFacturaPayload(cartItems, customer);
            const result = await FacturacionService.emitirFactura(payload);
            setInvoiceNumber(result?.encabezado?.['Número Factura']);

            // Detectar upgrade de categoría
            const enc = result?.encabezado
            if (enc?.['Upgrade'] && enc['Categoría Anterior'] !== enc['Categoría Actual']) {
                setInvoiceUpgrade({
                    anterior: enc['Categoría Anterior'],
                    actual: enc['Categoría Actual'],
                    mensaje: enc['Upgrade']
                })
            }

            // Refrescar perfil en sesión para que /shop muestre el nuevo descuento sin F5
            UserService.getOwn().then((persona) => {
                if (!persona) return
                const session = localStorage.getItem('xstore-session')
                if (!session) return
                const user = JSON.parse(session)
                localStorage.setItem('xstore-session', JSON.stringify({ ...user, _discountRefresh: Date.now() }))
            })

            clearCart();
            setIsSuccess(true);
        } catch (err: unknown) {
            setErrors({ api: err instanceof Error ? err.message : 'Error al procesar la factura.' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleContinue = () => {
        router.push('/shop');
    };

    const handleSaveCustomer = async () => {
        if (!tempCustomer) return;
        setIsProcessing(true);
        const res = await AuthService.updateUser(tempCustomer);
        setIsProcessing(false);
        if (res.success) {
            setCustomer(res.user!);
            setIsEditingCustomer(false);
        } else {
            // Error handling could be added here (e.g., Toast)
        }
    };

    if (isSuccess) {
        return <SuccessScreen onContinue={handleContinue} invoiceNumber={invoiceNumber} upgrade={invoiceUpgrade} />;
    }

    return (
        <div className="grid" style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem' }}>
            {/* Page Header */}
            <div className="col-12 mb-2">
                <div className="flex align-items-center gap-3">
                    <Button
                        icon="pi pi-arrow-left"
                        text
                        rounded
                        tooltip="Volver a Productos"
                        tooltipOptions={{ position: 'right' }}
                        onClick={() => router.push('/shop')}
                    />
                    <div>
                        <h2 className="m-0 text-900 font-bold">Finalizar Compra</h2>
                        <span className="text-500 text-sm">{totalItems} artículo{totalItems !== 1 ? 's' : ''} en tu carrito</span>
                    </div>
                </div>
            </div>

            {/* LEFT COLUMN */}
            <div className="col-12 lg:col-8">

                {/* Customer Info */}
                {customer && (
                    <Card className="shadow-2 mb-3">
                        <div className="flex align-items-center justify-content-between mb-3">
                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-user text-primary" style={{ fontSize: '1.2rem' }} />
                                <h5 className="m-0 text-900 font-semibold">Información de Contacto y Entrega</h5>
                            </div>
                            {!isEditingCustomer ? (
                                <Button
                                    icon="pi pi-pencil"
                                    label="Editar"
                                    text
                                    size="small"
                                    onClick={() => {
                                        setTempCustomer({ ...customer });
                                        setIsEditingCustomer(true);
                                    }}
                                />
                            ) : (
                                <div className="flex gap-2">
                                    <Button
                                        icon="pi pi-times"
                                        label="Cancelar"
                                        text
                                        severity="secondary"
                                        size="small"
                                        onClick={() => setIsEditingCustomer(false)}
                                    />
                                    <Button
                                        icon="pi pi-check"
                                        label="Guardar"
                                        size="small"
                                        onClick={handleSaveCustomer}
                                        loading={isProcessing}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid">
                            <div className="col-12 sm:col-6">
                                <span className="text-500 text-xs uppercase font-medium">Nombre</span>
                                {!isEditingCustomer ? (
                                    <p className="m-0 text-900 font-medium mt-1">{customer.fullName}</p>
                                ) : (
                                    <InputText
                                        value={tempCustomer?.fullName || ''}
                                        onChange={(e) => setTempCustomer((p) => p ? ({ ...p, fullName: e.target.value }) : null)}
                                        className="w-full mt-1 p-inputtext-sm"
                                    />
                                )}
                            </div>
                            <div className="col-12 sm:col-6">
                                <span className="text-500 text-xs uppercase font-medium">Identificación</span>
                                {!isEditingCustomer ? (
                                    <p className="m-0 text-900 font-medium mt-1">{customer.identification}</p>
                                ) : (
                                    <InputText
                                        value={tempCustomer?.identification || ''}
                                        onChange={(e) => setTempCustomer((p) => p ? ({ ...p, identification: e.target.value }) : null)}
                                        className="w-full mt-1 p-inputtext-sm"
                                    />
                                )}
                            </div>
                            <div className="col-12 sm:col-6">
                                <span className="text-500 text-xs uppercase font-medium">Correo</span>
                                <p className="m-0 text-600 font-medium mt-1">{customer.email}</p>
                                {isEditingCustomer && <small className="text-400">El correo no es editable</small>}
                            </div>
                            <div className="col-12 sm:col-6">
                                <span className="text-500 text-xs uppercase font-medium">Teléfono</span>
                                {!isEditingCustomer ? (
                                    <p className="m-0 text-900 font-medium mt-1">{customer.phone}</p>
                                ) : (
                                    <InputText
                                        value={tempCustomer?.phone || ''}
                                        onChange={(e) => setTempCustomer((p) => p ? ({ ...p, phone: e.target.value }) : null)}
                                        className="w-full mt-1 p-inputtext-sm"
                                    />
                                )}
                            </div>
                            <div className="col-12">
                                <span className="text-500 text-xs uppercase font-medium">Dirección de Entrega</span>
                                {!isEditingCustomer ? (
                                    <p className="m-0 text-900 font-medium mt-1">{customer.address}</p>
                                ) : (
                                    <InputText
                                        value={tempCustomer?.address || ''}
                                        onChange={(e) => setTempCustomer((p) => p ? ({ ...p, address: e.target.value }) : null)}
                                        className="w-full mt-1 p-inputtext-sm"
                                    />
                                )}
                            </div>
                        </div>
                    </Card>
                )}

                {/* Payment Method */}
                <Card className="shadow-2 mb-3">
                    <div className="flex align-items-center gap-2 mb-3">
                        <i className="pi pi-credit-card text-primary" style={{ fontSize: '1.2rem' }} />
                        <h5 className="m-0 text-900 font-semibold">Método de Pago</h5>
                    </div>

                    {/* Selected method (card only) */}
                    <div
                        className="flex align-items-center gap-3 p-3 border-round border-2 mb-4"
                        style={{ borderColor: 'var(--primary-color)', background: 'var(--primary-50, #f0f4ff)' }}
                    >
                        <i className="pi pi-credit-card" style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }} />
                        <div>
                            <p className="m-0 font-semibold text-900">Tarjeta de Crédito / Débito</p>
                            <p className="m-0 text-500 text-sm">Pago seguro procesado localmente</p>
                        </div>
                        <Tag value="Seleccionado" severity="success" className="ml-auto" />
                    </div>

                    {/* Card Form */}
                    <div className="grid">
                        <div className="col-12">
                            <label className="block text-900 font-medium mb-2">Número de Tarjeta</label>
                            <InputText
                                value={cardNumber}
                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                placeholder="1234 5678 9012 3456"
                                className={`w-full ${errors.cardNumber ? 'p-invalid' : ''}`}
                                maxLength={19}
                                keyfilter={/[\d\s]/}
                            />
                            {errors.cardNumber && <small className="p-error">{errors.cardNumber}</small>}
                        </div>

                        <div className="col-12">
                            <label className="block text-900 font-medium mb-2">Nombre en la Tarjeta</label>
                            <InputText
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                placeholder="JUAN PÉREZ"
                                className={`w-full ${errors.cardName ? 'p-invalid' : ''}`}
                            />
                            {errors.cardName && <small className="p-error">{errors.cardName}</small>}
                        </div>

                        <div className="col-12 sm:col-6">
                            <label className="block text-900 font-medium mb-2">Fecha de Vencimiento</label>
                            <InputText
                                value={expiry}
                                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                placeholder="MM/AA"
                                className={`w-full ${errors.expiry ? 'p-invalid' : ''}`}
                                maxLength={5}
                            />
                            {errors.expiry && <small className="p-error">{errors.expiry}</small>}
                        </div>

                        <div className="col-12 sm:col-6">
                            <label className="block text-900 font-medium mb-2">CVV</label>
                            <InputText
                                value={cvv}
                                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                placeholder="123"
                                className={`w-full ${errors.cvv ? 'p-invalid' : ''}`}
                                maxLength={3}
                                keyfilter="int"
                                type="password"
                            />
                            {errors.cvv && <small className="p-error">{errors.cvv}</small>}
                        </div>
                    </div>

                    {/* Tasa Cero */}
                    <Divider />
                    <div>
                        <label className="block text-900 font-medium mb-2">
                            <i className="pi pi-percentage mr-2 text-primary" />
                            Tasa Cero (cuotas sin interés)
                        </label>
                        <Dropdown
                            value={installments}
                            options={INSTALLMENT_OPTIONS}
                            onChange={(e) => setInstallments(e.value)}
                            className="w-full"
                            placeholder="Selecciona el plazo"
                        />
                        {installments > 0 && (
                            <Message
                                severity="info"
                                className="mt-2 w-full"
                                text={`Pagarás ${installments} cuotas de ${formatCurrency(total / installments)} sin interés.`}
                            />
                        )}
                    </div>
                </Card>
            </div>

            {/* RIGHT COLUMN — Order Summary */}
            <div className="col-12 lg:col-4">
                <div className="sticky" style={{ top: '5rem' }}>
                    <Card className="shadow-2">
                        <div className="flex align-items-center gap-2 mb-3">
                            <i className="pi pi-shopping-bag text-primary" style={{ fontSize: '1.2rem' }} />
                            <h5 className="m-0 text-900 font-semibold">Resumen del Pedido</h5>
                        </div>

                        {/* Items */}
                        <div className="flex flex-column gap-2 mb-3">
                            {cartItems.map((item) => {
                                const unitPrice = getItemPrice(item.product.salePrice, item.product.discountName);
                                const lineTotal = unitPrice * item.quantity;
                                return (
                                    <div key={item.product.id} className="flex align-items-start justify-content-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="m-0 text-900 text-sm font-medium line-clamp-2">{item.product.description}</p>
                                            <span className="text-500 text-xs">x{item.quantity}</span>
                                        </div>
                                        <div className="flex-shrink-0 text-right">
                                            <p className="m-0 text-900 font-medium text-sm">{formatCurrency(lineTotal)}</p>
                                            {!!item.product.discountName && (
                                                <span className="text-500 text-xs line-through">
                                                    {formatCurrency(item.product.salePrice * item.quantity)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <Divider className="my-2" />

                        <div className="flex justify-content-between text-sm text-600 mb-1">
                            <span>Subtotal</span>
                            <span className="font-medium text-900">{formatCurrency(subtotal)}</span>
                        </div>
                        {clientDiscountPct > 0 && (
                            <div className="flex justify-content-between text-sm mb-1" style={{ color: 'var(--green-600)' }}>
                                <span className="flex align-items-center gap-1">
                                    <i className="pi pi-percentage" style={{ fontSize: '0.75rem' }} />
                                    {clientDiscountLabel} ({clientDiscountPct}%)
                                </span>
                                <span className="font-medium">Aplicado en factura</span>
                            </div>
                        )}
                        <div className="flex justify-content-between text-sm text-600 mb-3">
                            <span>Envío</span>
                            <Tag value="Gratis" severity="success" rounded />
                        </div>

                        <Divider className="my-2" />

                        <div className="flex justify-content-between font-bold text-900 text-base mb-4">
                            <span>Total</span>
                            <span style={{ color: 'var(--primary-color)' }}>{formatCurrency(total)}</span>
                        </div>

                        {/* API error */}
                        {errors.api && (
                            <Message severity="error" className="w-full mb-3" text={errors.api} />
                        )}

                        {/* Confirm button */}
                        <Button
                            label={isProcessing ? 'Procesando...' : 'Confirmar Pago'}
                            icon={isProcessing ? undefined : 'pi pi-lock'}
                            iconPos="left"
                            className="w-full"
                            onClick={handleConfirm}
                            disabled={isProcessing || cartItems.length === 0}
                        >
                            {isProcessing && (
                                <ProgressSpinner
                                    style={{ width: '1.2rem', height: '1.2rem', marginRight: '0.5rem' }}
                                    strokeWidth="6"
                                    animationDuration="0.8s"
                                />
                            )}
                        </Button>

                        <p className="text-center text-500 text-xs mt-2">
                            <i className="pi pi-shield mr-1" />
                            Pago simulado — sin cobro real
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
