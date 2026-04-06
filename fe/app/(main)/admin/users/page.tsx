'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { Divider } from 'primereact/divider'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { classNames } from 'primereact/utils'

import { PersonaUser, UserService } from '@/service/UserService'

const AdminUsersPage = () => {
    const toast = useRef<Toast>(null)
    const [users, setUsers] = useState<PersonaUser[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [form, setForm] = useState<PersonaUser | null>(null)
    const [submitted, setSubmitted] = useState(false)
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        UserService.getAll().then((data) => {
            setUsers(data)
            if (data.length > 0) setForm({ ...data[0] })
            setLoading(false)
        })
    }, [])

    const goTo = (index: number) => {
        setCurrentIndex(index)
        setForm({ ...users[index] })
        setSubmitted(false)
    }

    const handleSave = async () => {
        setSubmitted(true)
        if (!form || !form.fullName.trim()) return

        setSaving(true)
        const result = await UserService.updateUser({
            identification: form.identification,
            fullName: form.fullName,
            phone: form.phone,
            email: form.email,
            address: form.address
        })
        setSaving(false)

        if (result.success) {
            const updated = [...users]
            updated[currentIndex] = { ...form }
            setUsers(updated)
            toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado correctamente', life: 3000 })
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error ?? 'No se pudo actualizar el usuario', life: 4000 })
        }
    }

    // Estado vacío
    if (!loading && users.length === 0) {
        return (
            <div className="grid">
                <div className="col-12">
                    <div className="card flex flex-column align-items-center justify-content-center py-8 gap-3">
                        <i className="pi pi-users" style={{ fontSize: '3rem', color: 'var(--text-color-secondary)' }} />
                        <h4 className="m-0 text-900">No hay usuarios registrados</h4>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="grid">
            <Toast ref={toast} />

            {/* Banner */}
            <div className="col-12">
                <div className="card p-0" style={{ overflow: 'hidden' }}>
                    <div className="flex align-items-center justify-content-between p-5" style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, #6366f1 100%)' }}>
                        <div className="flex align-items-center gap-4">
                            <div className="flex align-items-center justify-content-center border-circle bg-white" style={{ width: '72px', height: '72px', flexShrink: 0 }}>
                                <i className="pi pi-user" style={{ fontSize: '2rem', color: 'var(--primary-color)' }} />
                            </div>
                            <div>
                                <h2 className="m-0 text-white font-bold">
                                    {loading ? 'Cargando…' : (form?.fullName || 'Usuario')}
                                </h2>
                                <span className="text-white opacity-80 text-sm">
                                    {form?.username ? `@${form.username}` : ''}
                                    {form?.role ? ` · ${form.role}` : ''}
                                </span>
                            </div>
                        </div>

                        {/* Navegación carrusel */}
                        <div className="flex align-items-center gap-2">
                            <Button
                                icon="pi pi-chevron-left"
                                rounded
                                text
                                style={{ color: 'white', border: '1px solid rgba(255,255,255,0.5)' }}
                                disabled={loading || currentIndex === 0}
                                onClick={() => goTo(currentIndex - 1)}
                            />
                            <span className="text-white font-medium px-2" style={{ minWidth: '4rem', textAlign: 'center' }}>
                                {loading ? '…' : `${currentIndex + 1} / ${users.length}`}
                            </span>
                            <Button
                                icon="pi pi-chevron-right"
                                rounded
                                text
                                style={{ color: 'white', border: '1px solid rgba(255,255,255,0.5)' }}
                                disabled={loading || currentIndex === users.length - 1}
                                onClick={() => goTo(currentIndex + 1)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Formulario */}
            <div className="col-12">
                <div className="card">
                    <div className="flex align-items-center gap-2 mb-4">
                        <i className="pi pi-id-card text-primary" style={{ fontSize: '1.2rem' }} />
                        <h5 className="m-0 text-900">Información Personal</h5>
                    </div>
                    <Divider className="mt-0 mb-4" />

                    {loading || !form ? (
                        <div className="flex justify-content-center py-6">
                            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }} />
                        </div>
                    ) : (
                        <div className="formgrid grid">
                            {/* Usuario */}
                            {form.username && (
                                <div className="field col-12 md:col-6">
                                    <label className="font-medium text-700 text-sm block mb-2">
                                        <i className="pi pi-at mr-1" />Usuario
                                    </label>
                                    <InputText value={form.username} disabled className="w-full surface-100 border-0" />
                                </div>
                            )}

                            {/* Rol */}
                            <div className="field col-12 md:col-6">
                                <label className="font-medium text-700 text-sm block mb-2">
                                    <i className="pi pi-shield mr-1" />Rol
                                </label>
                                <InputText value={form.role || '—'} disabled className="w-full surface-100 border-0" />
                            </div>

                            {/* Tipo Persona */}
                            <div className="field col-12 md:col-6">
                                <label className="font-medium text-700 text-sm block mb-2">
                                    <i className="pi pi-tag mr-1" />Tipo de Persona
                                </label>
                                <InputText value={form.tipoPersona || '—'} disabled className="w-full surface-100 border-0" />
                            </div>

                            {/* Descuento */}
                            <div className="field col-12 md:col-6">
                                <label className="font-medium text-700 text-sm block mb-2">
                                    <i className="pi pi-percentage mr-1" />Descuento
                                </label>
                                <InputText value={form.descuento || '—'} disabled className="w-full surface-100 border-0" />
                            </div>

                            {/* Estado */}
                            <div className="field col-12 md:col-6">
                                <label className="font-medium text-700 text-sm block mb-2">
                                    <i className="pi pi-circle mr-1" />Estado
                                </label>
                                <InputText value={form.estado || '—'} disabled className="w-full surface-100 border-0" />
                            </div>

                            {/* Identificación */}
                            <div className="field col-12 md:col-6">
                                <label className="font-medium text-700 text-sm block mb-2">
                                    <i className="pi pi-credit-card mr-1" />Identificación
                                </label>
                                <InputText value={form.identification} disabled className="w-full surface-100 border-0" />
                            </div>

                            {/* Fecha Registro */}
                            <div className="field col-12 md:col-6">
                                <label className="font-medium text-700 text-sm block mb-2">
                                    <i className="pi pi-calendar mr-1" />Fecha de Registro
                                </label>
                                <InputText value={form.fechaRegistro || '—'} disabled className="w-full surface-100 border-0" />
                            </div>

                            {/* Nombre completo */}
                            <div className="field col-12">
                                <label className="font-medium text-700 text-sm block mb-2">
                                    <i className="pi pi-user mr-1" />Nombre Completo <span className="text-red-400">*</span>
                                </label>
                                <InputText
                                    value={form.fullName}
                                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                    className={classNames('w-full', { 'p-invalid': submitted && !form.fullName.trim() })}
                                    placeholder="Nombre completo"
                                />
                                {submitted && !form.fullName.trim() && <small className="p-error">El nombre completo es obligatorio.</small>}
                            </div>

                            {/* Teléfono */}
                            <div className="field col-12 md:col-6">
                                <label className="font-medium text-700 text-sm block mb-2">
                                    <i className="pi pi-phone mr-1" />Teléfono
                                </label>
                                <InputText value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full" placeholder="Ej: 8888-8888" />
                            </div>

                            {/* Correo */}
                            <div className="field col-12 md:col-6">
                                <label className="font-medium text-700 text-sm block mb-2">
                                    <i className="pi pi-envelope mr-1" />Correo
                                </label>
                                <InputText value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full" placeholder="correo@ejemplo.com" />
                            </div>

                            {/* Dirección */}
                            <div className="field col-12">
                                <label className="font-medium text-700 text-sm block mb-2">
                                    <i className="pi pi-map-marker mr-1" />Dirección
                                </label>
                                <InputText value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full" placeholder="Ej: San José, Costa Rica" />
                            </div>

                            <div className="col-12">
                                <Divider />
                                <div className="flex justify-content-end">
                                    <Button label="Guardar Cambios" icon="pi pi-check" loading={saving} onClick={handleSave} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AdminUsersPage
