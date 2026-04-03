/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useContext, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { AuthService } from '@/service/AuthService';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { layoutConfig } = useContext(LayoutContext);
    const router = useRouter();
    const searchParams = useSearchParams();
    const toast = useRef<Toast>(null);

    const containerClassName = classNames(
        'surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden',
        { 'p-input-filled': layoutConfig.inputStyle === 'filled' }
    );

    const handleLogin = async () => {
        setError('');
        if (!username.trim() || !password) {
            setError('Por favor ingresá tu usuario y contraseña.');
            return;
        }
        setLoading(true);
        const result = await AuthService.login({ username: username.trim(), password });
        setLoading(false);
        if (!result.success) {
            setError(result.error ?? 'Error al iniciar sesión.');
            return;
        }
        const redirect = searchParams.get('redirect') ?? '/';
        router.replace(redirect);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleLogin();
    };

    return (
        <div className={containerClassName}>
            <Toast ref={toast} />
            <div className="flex flex-column align-items-center justify-content-center w-full" style={{ maxWidth: '480px', padding: '2rem' }}>
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
                            <i className="pi pi-shopping-bag text-primary" style={{ fontSize: '3rem' }} />
                            <div className="text-900 text-3xl font-bold mt-3 mb-1">¡Bienvenido!</div>
                            <span className="text-600 font-medium">Iniciá sesión para continuar</span>
                        </div>

                        {/* Error */}
                        {error && (
                            <Message severity="error" text={error} className="w-full mb-4" />
                        )}

                        {/* Form */}
                        <div onKeyDown={handleKeyDown}>
                            <label htmlFor="login-username" className="block text-900 text-xl font-medium mb-2">
                                Usuario
                            </label>
                            <InputText
                                id="login-username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Nombre de usuario"
                                className="w-full mb-5"
                                style={{ padding: '1rem' }}
                                autoComplete="username"
                            />

                            <label htmlFor="login-password" className="block text-900 font-medium text-xl mb-2">
                                Contraseña
                            </label>
                            <Password
                                inputId="login-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Contraseña"
                                toggleMask
                                feedback={false}
                                className="w-full mb-5"
                                inputClassName="w-full p-3"
                                autoComplete="current-password"
                            />

                            <Button
                                label={loading ? 'Ingresando...' : 'Iniciar Sesión'}
                                icon="pi pi-sign-in"
                                className="w-full p-3 text-xl mb-3"
                                onClick={handleLogin}
                                disabled={loading}
                                loading={loading}
                            />

                            <div className="text-center text-600 text-sm">
                                ¿No tenés cuenta?{' '}
                                <a
                                    className="font-medium cursor-pointer no-underline"
                                    style={{ color: 'var(--primary-color)' }}
                                    onClick={() => {
                                        const redirect = searchParams.get('redirect');
                                        router.push(redirect ? `/auth/register?redirect=${redirect}` : '/auth/register');
                                    }}
                                >
                                    Creá una aquí
                                </a>
                            </div>
                        </div>

                        {/* Demo hint */}
                        <div className="mt-5 p-3 border-round surface-100 border-1 surface-border text-center text-xs text-500">
                            <i className="pi pi-info-circle mr-1" />
                            Demo: <strong>jose@xstore.cr</strong> / <strong>1234</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
