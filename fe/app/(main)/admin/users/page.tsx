'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { Divider } from 'primereact/divider'
import { Dropdown } from 'primereact/dropdown'
import { InputSwitch } from 'primereact/inputswitch'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Toast } from 'primereact/toast'
import { classNames } from 'primereact/utils'

import { CreateUserPayload, PersonaUser, UserService } from '@/service/UserService'
import { RoleService } from '@/service/RoleService'

const AdminUsersPage = () => {
    const toast = useRef<Toast>(null)
    const [users, setUsers] = useState<PersonaUser[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [form, setForm] = useState<PersonaUser | null>(null)
    const [submitted, setSubmitted] = useState(false)
    const [saving, setSaving] = useState(false)
    const [savingSession, setSavingSession] = useState(false)
    const [loading, setLoading] = useState(true)

    // Sesión
    const [roleOptions, setRoleOptions] = useState<string[]>([])
    const [sessionUsername, setSessionUsername] = useState('')
    const [sessionRol, setSessionRol] = useState('')
    const [sessionEstado, setSessionEstado] = useState(true)
    const [sessionPassword, setSessionPassword] = useState('')

    // Nuevo usuario
    const emptyNewUser: CreateUserPayload = { identificacion: '', nombreCompleto: '', telefono: '', correo: '', direccion: '', tipoPersona: '', newUser: '', password: '', nombreRol: '', esProveedor: false }
    const [showNewDialog, setShowNewDialog] = useState(false)
    const [newUser, setNewUser] = useState<CreateUserPayload>({ ...emptyNewUser })
    const [newSubmitted, setNewSubmitted] = useState(false)
    const [creatingUser, setCreatingUser] = useState(false)
    const [tipoPersonaOptions, setTipoPersonaOptions] = useState<string[]>([])

    useEffect(() => {
        UserService.getAll().then((data) => {
            setUsers(data)
            if (data.length > 0) {
                setForm({ ...data[0] })
                setSessionUsername(data[0].username || '')
                setSessionRol(data[0].role || '')
                setSessionEstado(data[0].estado === 'Activo')
            }
            setLoading(false)
        })
        RoleService.getAll().then((roles) => setRoleOptions(roles.map((r) => r.name)))
        import('@/service/ApiClient').then(({ apiCall, getCurrentUsername }) => {
            const u = getCurrentUsername()
            if (u) {
                apiCall<Record<string, unknown>[]>('GET', `/api/tipos-personas?nombreUsuario=${encodeURIComponent(u)}`).then((data) => {
                    setTipoPersonaOptions(
                        (data ?? []).map((tp) => {
                            if (typeof tp === 'string') return tp
                            const nameKey = Object.keys(tp).find((k) => k.toLowerCase().includes('nombre') || k.toLowerCase().includes('tipo'))
                            return nameKey ? String(tp[nameKey]) : String(Object.values(tp)[0])
                        })
                    )
                }).catch(() => {})
            }
        })
    }, [])

    const openNewDialog = () => {
        setNewUser({ ...emptyNewUser })
        setNewSubmitted(false)
        setShowNewDialog(true)
    }

    const handleCreateUser = async () => {
        setNewSubmitted(true)
        if (!newUser.identificacion.trim() || !newUser.nombreCompleto.trim() || !newUser.newUser.trim() || !newUser.password.trim() || !newUser.nombreRol) return

        setCreatingUser(true)
        const result = await UserService.createUser(newUser)
        setCreatingUser(false)

        if (result.success) {
            toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado correctamente', life: 3000 })
            setShowNewDialog(false)
            // Recargar lista
            const data = await UserService.getAll()
            setUsers(data)
            if (data.length > 0) {
                const lastIndex = data.length - 1
                setCurrentIndex(lastIndex)
                setForm({ ...data[lastIndex] })
                setSessionUsername(data[lastIndex].username || '')
                setSessionRol(data[lastIndex].role || '')
                setSessionEstado(data[lastIndex].estado === 'Activo')
                setSessionPassword('')
            }
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error ?? 'No se pudo crear el usuario', life: 4000 })
        }
    }

    const goTo = (index: number) => {
        setCurrentIndex(index)
        setForm({ ...users[index] })
        setSessionUsername(users[index].username || '')
        setSessionRol(users[index].role || '')
        setSessionEstado(users[index].estado === 'Activo')
        setSessionPassword('')
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
                        <Button label="Agregar Usuario" icon="pi pi-plus" onClick={openNewDialog} />
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
                                icon="pi pi-plus"
                                label="Nuevo"
                                rounded
                                style={{ color: 'white', border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.15)' }}
                                onClick={openNewDialog}
                            />
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
                                    <Button label="Guardar Datos" icon="pi pi-check" loading={saving} onClick={handleSave} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sección Sesión */}
            {!loading && form && form.username && (
                <div className="col-12">
                    <div className="card">
                        <div className="flex align-items-center gap-2 mb-4">
                            <i className="pi pi-lock text-primary" style={{ fontSize: '1.2rem' }} />
                            <h5 className="m-0 text-900">Credenciales y Acceso</h5>
                        </div>
                        <Divider className="mt-0 mb-4" />
                        <div className="formgrid grid">
                            {/* Nombre de usuario */}
                            <div className="field col-12 md:col-6">
                                <label className="font-medium text-700 text-sm block mb-2">
                                    <i className="pi pi-at mr-1" />Nombre de Usuario
                                </label>
                                <InputText
                                    value={sessionUsername}
                                    onChange={(e) => setSessionUsername(e.target.value)}
                                    placeholder="Nuevo username"
                                    className="w-full"
                                />
                            </div>

                            {/* Rol */}
                            <div className="field col-12 md:col-6">
                                <label className="font-medium text-700 text-sm block mb-2">
                                    <i className="pi pi-shield mr-1" />Rol
                                </label>
                                <Dropdown
                                    value={sessionRol}
                                    options={roleOptions}
                                    onChange={(e) => setSessionRol(e.value)}
                                    placeholder="Seleccionar rol"
                                    className="w-full"
                                />
                            </div>

                            {/* Estado */}
                            <div className="field col-12 md:col-6 flex flex-column justify-content-center">
                                <label className="font-medium text-700 text-sm block mb-2">
                                    <i className="pi pi-circle mr-1" />Estado de la cuenta
                                </label>
                                <div className="flex align-items-center gap-3">
                                    <InputSwitch checked={sessionEstado} onChange={(e) => setSessionEstado(e.value)} />
                                    <span className={sessionEstado ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                                        {sessionEstado ? 'Activa' : 'Inactiva'}
                                    </span>
                                </div>
                            </div>

                            {/* Nueva contraseña */}
                            <div className="field col-12">
                                <label className="font-medium text-700 text-sm block mb-2">
                                    <i className="pi pi-key mr-1" />Nueva Contraseña <span className="text-500 font-normal">(dejar vacío para no cambiar)</span>
                                </label>
                                <Password
                                    value={sessionPassword}
                                    onChange={(e) => setSessionPassword(e.target.value)}
                                    placeholder="Nueva contraseña"
                                    className="w-full"
                                    inputClassName="w-full"
                                    feedback={false}
                                    toggleMask
                                />
                            </div>

                            <div className="col-12">
                                <Divider />
                                <div className="flex justify-content-end">
                                    <Button
                                        label="Guardar Credenciales"
                                        icon="pi pi-lock"
                                        severity="warning"
                                        loading={savingSession}
                                        onClick={async () => {
                                            if (!form.username) return
                                            setSavingSession(true)
                                            const result = await UserService.updateSession({
                                                nombreUsuarioAModificar: form.username,
                                                nuevoNombreUsuario: sessionUsername || null,
                                                nuevoRol: sessionRol || null,
                                                nuevoEstado: sessionEstado,
                                                nuevaPasswordHash: sessionPassword || null
                                            })
                                            setSavingSession(false)
                                            if (result.success) {
                                                toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Credenciales actualizadas correctamente', life: 3000 })
                                                setSessionPassword('')
                                            } else {
                                                toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error ?? 'No se pudo actualizar', life: 4000 })
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Dialog Nuevo Usuario */}
            <Dialog
                header="Nuevo Usuario"
                visible={showNewDialog}
                style={{ width: '650px' }}
                modal
                draggable={false}
                onHide={() => setShowNewDialog(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Cancelar" icon="pi pi-times" severity="secondary" text onClick={() => setShowNewDialog(false)} />
                        <Button label="Crear Usuario" icon="pi pi-check" loading={creatingUser} onClick={handleCreateUser} />
                    </div>
                }
            >
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label className="font-medium text-700 text-sm block mb-2"><i className="pi pi-credit-card mr-1" />Identificación <span className="text-red-400">*</span></label>
                        <InputText value={newUser.identificacion} onChange={(e) => setNewUser({ ...newUser, identificacion: e.target.value })} className={classNames('w-full', { 'p-invalid': newSubmitted && !newUser.identificacion.trim() })} placeholder="Ej: 1-1234-5678" />
                        {newSubmitted && !newUser.identificacion.trim() && <small className="p-error">La identificación es obligatoria.</small>}
                    </div>

                    <div className="field col-12 md:col-6">
                        <label className="font-medium text-700 text-sm block mb-2"><i className="pi pi-user mr-1" />Nombre Completo <span className="text-red-400">*</span></label>
                        <InputText value={newUser.nombreCompleto} onChange={(e) => setNewUser({ ...newUser, nombreCompleto: e.target.value })} className={classNames('w-full', { 'p-invalid': newSubmitted && !newUser.nombreCompleto.trim() })} placeholder="Nombre completo" />
                        {newSubmitted && !newUser.nombreCompleto.trim() && <small className="p-error">El nombre es obligatorio.</small>}
                    </div>

                    <div className="field col-12 md:col-6">
                        <label className="font-medium text-700 text-sm block mb-2"><i className="pi pi-phone mr-1" />Teléfono</label>
                        <InputText value={newUser.telefono} onChange={(e) => setNewUser({ ...newUser, telefono: e.target.value })} className="w-full" placeholder="Ej: 8888-8888" />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label className="font-medium text-700 text-sm block mb-2"><i className="pi pi-envelope mr-1" />Correo</label>
                        <InputText value={newUser.correo} onChange={(e) => setNewUser({ ...newUser, correo: e.target.value })} className="w-full" placeholder="correo@ejemplo.com" />
                    </div>

                    <div className="field col-12">
                        <label className="font-medium text-700 text-sm block mb-2"><i className="pi pi-map-marker mr-1" />Dirección</label>
                        <InputText value={newUser.direccion} onChange={(e) => setNewUser({ ...newUser, direccion: e.target.value })} className="w-full" placeholder="Ej: San José, Costa Rica" />
                    </div>

                    <div className="col-12"><Divider /></div>

                    <div className="field col-12 md:col-6">
                        <label className="font-medium text-700 text-sm block mb-2"><i className="pi pi-at mr-1" />Username <span className="text-red-400">*</span></label>
                        <InputText value={newUser.newUser} onChange={(e) => setNewUser({ ...newUser, newUser: e.target.value })} className={classNames('w-full', { 'p-invalid': newSubmitted && !newUser.newUser.trim() })} placeholder="Username de login" />
                        {newSubmitted && !newUser.newUser.trim() && <small className="p-error">El username es obligatorio.</small>}
                    </div>

                    <div className="field col-12 md:col-6">
                        <label className="font-medium text-700 text-sm block mb-2"><i className="pi pi-key mr-1" />Contraseña <span className="text-red-400">*</span></label>
                        <Password value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className={classNames('w-full', { 'p-invalid': newSubmitted && !newUser.password.trim() })} inputClassName="w-full" placeholder="Contraseña" feedback={false} toggleMask />
                        {newSubmitted && !newUser.password.trim() && <small className="p-error">La contraseña es obligatoria.</small>}
                    </div>

                    <div className="field col-12 md:col-6">
                        <label className="font-medium text-700 text-sm block mb-2"><i className="pi pi-shield mr-1" />Rol <span className="text-red-400">*</span></label>
                        <Dropdown value={newUser.nombreRol} options={roleOptions} onChange={(e) => setNewUser({ ...newUser, nombreRol: e.value })} placeholder="Seleccionar rol" className={classNames('w-full', { 'p-invalid': newSubmitted && !newUser.nombreRol })} />
                        {newSubmitted && !newUser.nombreRol && <small className="p-error">El rol es obligatorio.</small>}
                    </div>

                    <div className="field col-12 md:col-6">
                        <label className="font-medium text-700 text-sm block mb-2"><i className="pi pi-tag mr-1" />Tipo de Persona</label>
                        <Dropdown value={newUser.tipoPersona} options={tipoPersonaOptions} onChange={(e) => setNewUser({ ...newUser, tipoPersona: e.value })} placeholder="Seleccionar tipo" className="w-full" />
                    </div>

                    <div className="field col-12 md:col-6 flex flex-column justify-content-center">
                        <label className="font-medium text-700 text-sm block mb-2"><i className="pi pi-box mr-1" />¿Es proveedor?</label>
                        <div className="flex align-items-center gap-3">
                            <InputSwitch checked={newUser.esProveedor ?? false} onChange={(e) => setNewUser({ ...newUser, esProveedor: e.value })} />
                            <span className="font-medium">{newUser.esProveedor ? 'Sí' : 'No'}</span>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default AdminUsersPage
