/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useContext, useState } from 'react';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Password } from 'primereact/password';
import { classNames } from 'primereact/utils';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { AuthService, RegisterPayload } from '@/service/AuthService';

const RegisterPage = () => {
    const [form, setForm] = useState<Omit<RegisterPayload, ''>>({
        username: '',
        identification: '',
        fullName: '',
        phone: '',
        email: '',
        address: '',
        password: ''
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { layoutConfig } = useContext(LayoutContext);
    const router = useRouter();
    const searchParams = useSearchParams();

    const containerClassName = classNames(
        'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
        { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
    );

    const setField = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const validate = (): string | null => {
        if (!form.username.trim()) return 'El nombre de usuario es requerido.';
        if (!/^[a-zA-Z0-9_.-]+$/.test(form.username)) return 'El usuario solo puede contener letras, números, puntos, guiones y guiones bajos.';
        if (!form.identification.trim()) return 'La identificación es requerida.';
        if (!form.fullName.trim()) return 'El nombre completo es requerido.';
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
            return 'Ingresá un correo electrónico válido.';
        if (!form.phone.trim()) return 'El teléfono es requerido.';
        if (!form.address.trim()) return 'La dirección es requerida.';
        if (form.password.length < 4) return 'La contraseña debe tener al menos 4 caracteres.';
        if (form.password !== confirmPassword) return 'Las contraseñas no coinciden.';
        return null;
    };

    const handleRegister = async () => {
        setError('');
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }
        setLoading(true);
        const result = await AuthService.register(form);
        setLoading(false);
        if (!result.success) {
            setError(result.error ?? 'Error al crear la cuenta.');
            return;
        }
        const redirect = searchParams.get('redirect') ?? '/';
        router.replace(redirect);
    };

    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center w-full" style={{ maxWidth: '520px', padding: '2rem' }}>
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)',
                        width: '100%'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        {/* Header */}
                        <div className="text-center mb-5">
                            <i className="pi pi-user-plus text-primary" style={{ fontSize: '3rem' }} />
                            <div className="text-900 text-3xl font-bold mt-3 mb-1">Crear cuenta</div>
                            <span className="text-600 font-medium">Completá los datos para registrarte</span>
                        </div>

                        {/* Error */}
                        {error && <Message severity="error" text={error} className="w-full mb-4" />}

                        {/* Form */}
                        <div className="grid">
                            <div className="col-12">
                                <label htmlFor="reg-username" className="block text-900 font-medium mb-2">Nombre de Usuario</label>
                                <InputText
                                    id="reg-username"
                                    value={form.username}
                                    onChange={setField('username')}
                                    placeholder="ej: juan.perez"
                                    className="w-full"
                                    style={{ padding: '0.75rem' }}
                                    autoComplete="username"
                                />
                            </div>

                            <div className="col-12 sm:col-6">
                                <label htmlFor="reg-identification" className="block text-900 font-medium mb-2">Identificación</label>
                                <InputText
                                    id="reg-identification"
                                    value={form.identification}
                                    onChange={setField('identification')}
                                    placeholder="1-2345-6789"
                                    className="w-full"
                                    style={{ padding: '0.75rem' }}
                                />
                            </div>

                            <div className="col-12 sm:col-6">
                                <label htmlFor="reg-phone" className="block text-900 font-medium mb-2">Teléfono</label>
                                <InputText
                                    id="reg-phone"
                                    value={form.phone}
                                    onChange={setField('phone')}
                                    placeholder="+506 8888-1234"
                                    className="w-full"
                                    style={{ padding: '0.75rem' }}
                                />
                            </div>

                            <div className="col-12">
                                <label htmlFor="reg-fullname" className="block text-900 font-medium mb-2">Nombre Completo</label>
                                <InputText
                                    id="reg-fullname"
                                    value={form.fullName}
                                    onChange={setField('fullName')}
                                    placeholder="Juan Pérez García"
                                    className="w-full"
                                    style={{ padding: '0.75rem' }}
                                />
                            </div>

                            <div className="col-12">
                                <label htmlFor="reg-email" className="block text-900 font-medium mb-2">Correo Electrónico</label>
                                <InputText
                                    id="reg-email"
                                    type="email"
                                    value={form.email}
                                    onChange={setField('email')}
                                    placeholder="correo@ejemplo.com"
                                    className="w-full"
                                    style={{ padding: '0.75rem' }}
                                    autoComplete="email"
                                />
                            </div>

                            <div className="col-12">
                                <label htmlFor="reg-address" className="block text-900 font-medium mb-2">Dirección de Entrega</label>
                                <InputText
                                    id="reg-address"
                                    value={form.address}
                                    onChange={setField('address')}
                                    placeholder="San José, Escazú, ..."
                                    className="w-full"
                                    style={{ padding: '0.75rem' }}
                                />
                            </div>
                        </div>

                        <Divider className="my-3" />

                        <div className="grid">
                            <div className="col-12 sm:col-6">
                                <label htmlFor="reg-password" className="block text-900 font-medium mb-2">Contraseña</label>
                                <Password
                                    inputId="reg-password"
                                    value={form.password}
                                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                                    placeholder="Mínimo 4 caracteres"
                                    toggleMask
                                    className="w-full"
                                    inputClassName="w-full p-3"
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className="col-12 sm:col-6">
                                <label htmlFor="reg-confirm-password" className="block text-900 font-medium mb-2">Confirmar Contraseña</label>
                                <Password
                                    inputId="reg-confirm-password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repetí tu contraseña"
                                    toggleMask
                                    feedback={false}
                                    className="w-full"
                                    inputClassName="w-full p-3"
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>

                        <Button
                            label={loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                            icon="pi pi-user-plus"
                            className="w-full p-3 text-xl mt-4 mb-3"
                            onClick={handleRegister}
                            disabled={loading}
                            loading={loading}
                        />

                        <div className="text-center text-600 text-sm">
                            ¿Ya tenés cuenta?{' '}
                            <a
                                className="font-medium cursor-pointer no-underline"
                                style={{ color: 'var(--primary-color)' }}
                                onClick={() => {
                                    const redirect = searchParams.get('redirect');
                                    router.push(redirect ? `/auth/login?redirect=${redirect}` : '/auth/login');
                                }}
                            >
                                Iniciá sesión aquí
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
