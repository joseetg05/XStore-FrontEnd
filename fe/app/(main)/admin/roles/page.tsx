'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { InputSwitch } from 'primereact/inputswitch'
import { InputText } from 'primereact/inputtext'
import { MultiSelect } from 'primereact/multiselect'
import { Toast } from 'primereact/toast'
import { Toolbar } from 'primereact/toolbar'
import { classNames } from 'primereact/utils'

import { Role } from '@/types/role'
import { RoleService } from '@/service/RoleService'

// ─── Rutas del sistema ────────────────────────────────────────────────────────

const SYSTEM_ROUTES = [
    { label: 'Dashboard', value: '/' },
    { label: 'Tienda (Productos)', value: '/shop' },
    { label: 'Mis Entregas', value: '/mis-entregas' },
    { label: 'Mis Facturas', value: '/mis-facturas' },
    { label: 'Gestión de Productos', value: '/admin/products' },
    { label: 'Tipos de Producto', value: '/admin/product-types' },
    { label: 'Marcas', value: '/admin/brands' },
    { label: 'Tipos de Descuento', value: '/admin/discount-types' },
    { label: 'Descuentos', value: '/admin/discounts' },
    { label: 'Inventario', value: '/admin/inventory' },
    { label: 'Ubicaciones', value: '/admin/inventory-locations' },
    { label: 'Proveedores', value: '/admin/suppliers' },
    { label: 'Usuarios', value: '/admin/users' },
    { label: 'Roles', value: '/admin/roles' },
    { label: 'Auditorías', value: '/admin/auditorias' },
    { label: 'Entregas', value: '/admin/entregas' },
    { label: 'Facturas', value: '/admin/facturas' },
    { label: 'Reportes', value: '/admin/reportes' }
]

const emptyRole: Role = { name: '', accesos: '', status: true }

const AdminRolesPage = () => {
    const [roles, setRoles] = useState<Role[]>([])
    const [roleDialog, setRoleDialog] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState(false)
    const [role, setRole] = useState<Role>(emptyRole)
    const [selectedRoutes, setSelectedRoutes] = useState<string[]>([])
    const [submitted, setSubmitted] = useState(false)
    const [globalFilter, setGlobalFilter] = useState('')
    const toast = useRef<Toast>(null)
    const dt = useRef<DataTable<Role[]>>(null)
    const originalName = useRef<string>('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        RoleService.getAll().then((data) => setRoles(data))
    }

    // ─── CRUD Actions ──────────────────────────────────────────────────────────

    const openNew = () => {
        setRole(emptyRole)
        setSelectedRoutes([])
        setSubmitted(false)
        setRoleDialog(true)
    }

    const hideDialog = () => {
        setSubmitted(false)
        setRoleDialog(false)
    }

    const hideDeleteDialog = () => setDeleteDialog(false)

    const saveRole = async () => {
        setSubmitted(true)
        if (!role.name?.trim()) return
        if (selectedRoutes.length === 0) return

        const payload: Role = { ...role, accesos: selectedRoutes.join(',') }
        let result

        if (originalName.current) {
            result = await RoleService.update(originalName.current, payload)
            if (result.success) {
                toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Rol actualizado correctamente', life: 3000 })
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error, life: 3000 })
                return
            }
        } else {
            result = await RoleService.create(payload)
            if (result.success) {
                toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Rol creado correctamente', life: 3000 })
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error, life: 3000 })
                return
            }
        }

        setRoleDialog(false)
        setRole(emptyRole)
        loadData()
    }

    const editRole = (r: Role) => {
        originalName.current = r.name
        setRole({ ...r })
        setSelectedRoutes(r.accesos ? r.accesos.split(',').map((s) => s.trim()).filter(Boolean) : [])
        setSubmitted(false)
        setRoleDialog(true)
    }

    const confirmDelete = (r: Role) => {
        setRole({ ...r })
        setDeleteDialog(true)
    }

    const deleteRole = async () => {
        const res = await RoleService.delete(role.name)
        if (res.success) {
            toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Rol eliminado correctamente', life: 3000 })
            loadData()
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: res.error, life: 3000 })
        }
        setDeleteDialog(false)
        setRole(emptyRole)
    }

    const toggleStatus = async (r: Role) => {
        const res = await RoleService.toggleStatus(r.name, r.status)
        if (res.success) {
            toast.current?.show({ severity: 'info', summary: 'Estado actualizado', detail: `"${r.name}" ahora está ${res.role?.status ? 'activo' : 'inactivo'}`, life: 2500 })
            loadData()
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: res.error, life: 3000 })
        }
    }

    // ─── Column Templates ──────────────────────────────────────────────────────

    const accesosBodyTemplate = (rowData: Role) => (
        <div className="flex flex-wrap gap-1">
            {rowData.accesos.split(',').filter(Boolean).map((route) => {
                const found = SYSTEM_ROUTES.find((r) => r.value === route.trim())
                return (
                    <span key={route} className="border-round px-2 py-1 text-xs" style={{ background: 'var(--primary-100)', color: 'var(--primary-700)' }}>
                        {found?.label ?? route.trim()}
                    </span>
                )
            })}
        </div>
    )

    const statusBodyTemplate = (rowData: Role) => (
        <InputSwitch checked={rowData.status} onChange={() => toggleStatus(rowData)} />
    )

    const actionBodyTemplate = (rowData: Role) => (
        <>
            <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editRole(rowData)} />
            <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDelete(rowData)} />
        </>
    )

    const leftToolbarTemplate = () => (
        <div className="my-2">
            <Button label="Nuevo" icon="pi pi-plus" severity="success" onClick={openNew} />
        </div>
    )

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gestión de Roles</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar..." />
            </span>
        </div>
    )

    const dialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" text onClick={saveRole} />
        </>
    )

    const deleteDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteDialog} />
            <Button label="Sí" icon="pi pi-check" text onClick={deleteRole} />
        </>
    )

    // ─── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} />

                    <DataTable
                        ref={dt}
                        value={roles}
                        dataKey="name"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} roles"
                        globalFilter={globalFilter}
                        globalFilterFields={['name', 'accesos']}
                        emptyMessage="No se encontraron roles."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column field="name" header="Nombre" sortable headerStyle={{ minWidth: '12rem' }} />
                        <Column header="Pantallas con acceso" body={accesosBodyTemplate} headerStyle={{ minWidth: '20rem' }} />
                        <Column field="status" header="Activo" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '8rem' }} />
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} />
                    </DataTable>

                    {/* CREATE / EDIT DIALOG */}
                    <Dialog
                        visible={roleDialog}
                        style={{ width: '520px' }}
                        header={originalName.current ? 'Editar Rol' : 'Nuevo Rol'}
                        modal
                        className="p-fluid"
                        footer={dialogFooter}
                        onHide={hideDialog}
                    >
                        <div className="field">
                            <label htmlFor="name">Nombre del Rol</label>
                            <InputText
                                id="name"
                                value={role.name}
                                onChange={(e) => setRole({ ...role, name: e.target.value })}
                                required
                                autoFocus
                                className={classNames({ 'p-invalid': submitted && !role.name?.trim() })}
                            />
                            {submitted && !role.name?.trim() && <small className="p-error">El nombre es obligatorio.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="accesos">Pantallas con acceso</label>
                            <MultiSelect
                                id="accesos"
                                value={selectedRoutes}
                                options={SYSTEM_ROUTES}
                                onChange={(e) => setSelectedRoutes(e.value)}
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Selecciona las pantallas"
                                display="chip"
                                className={classNames({ 'p-invalid': submitted && selectedRoutes.length === 0 })}
                                filter
                            />
                            {submitted && selectedRoutes.length === 0 && <small className="p-error">Debe seleccionar al menos una pantalla.</small>}
                        </div>

                        <div className="field flex align-items-center gap-3">
                            <label htmlFor="status" className="mb-0">Activo</label>
                            <InputSwitch
                                id="status"
                                checked={role.status}
                                onChange={(e) => setRole({ ...role, status: e.value })}
                            />
                        </div>
                    </Dialog>

                    {/* DELETE CONFIRM DIALOG */}
                    <Dialog
                        visible={deleteDialog}
                        style={{ width: '450px' }}
                        header="Confirmar eliminación"
                        modal
                        footer={deleteDialogFooter}
                        onHide={hideDeleteDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            <span>¿Estás seguro de que quieres eliminar el rol <b>{role.name}</b>?</span>
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}

export default AdminRolesPage
