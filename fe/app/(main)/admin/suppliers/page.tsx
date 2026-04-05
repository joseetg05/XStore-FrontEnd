'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { InputSwitch } from 'primereact/inputswitch'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { Toolbar } from 'primereact/toolbar'
import { classNames } from 'primereact/utils'

import { Supplier } from '@/types/supplier'
import { SupplierService } from '@/service/SupplierService'

const emptySupplier: Omit<Supplier, 'id'> = {
    name: '',
    identification: '',
    phone: '',
    email: '',
    address: '',
    status: true
}

const AdminSuppliersPage = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [supplierDialog, setSupplierDialog] = useState(false)
    const [supplier, setSupplier] = useState<Partial<Supplier>>(emptySupplier)
    const [submitted, setSubmitted] = useState(false)
    const [globalFilter, setGlobalFilter] = useState('')
    const toast = useRef<Toast>(null)
    const dt = useRef<DataTable<Supplier[]>>(null)
    const editingId = useRef<number>(0)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        SupplierService.getAll().then((data) => setSuppliers(data))
    }

    // ─── CRUD Actions ──────────────────────────────────────────────────────────

    const openNew = () => {
        setSupplier(emptySupplier)
        editingId.current = 0
        setSubmitted(false)
        setSupplierDialog(true)
    }

    const hideDialog = () => {
        setSubmitted(false)
        setSupplierDialog(false)
    }

    const saveSupplier = async () => {
        setSubmitted(true)

        if (!supplier.identification?.trim() || !supplier.name?.trim()) return

        let result
        if (editingId.current) {
            result = await SupplierService.update(supplier as Supplier)
            if (result.success) {
                toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Proveedor actualizado correctamente', life: 3000 })
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error, life: 3000 })
                return
            }
        } else {
            result = await SupplierService.create(supplier as Omit<Supplier, 'id'>)
            if (result.success) {
                toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Proveedor creado correctamente', life: 3000 })
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error, life: 3000 })
                return
            }
        }

        setSupplierDialog(false)
        setSupplier(emptySupplier)
        loadData()
    }

    const editSupplier = (s: Supplier) => {
        editingId.current = s.id
        setSupplier({ ...s })
        setSubmitted(false)
        setSupplierDialog(true)
    }

    const toggleStatus = async (s: Supplier) => {
        const res = await SupplierService.toggleStatus(s.identification, s.status)
        if (res.success) {
            toast.current?.show({ severity: 'info', summary: 'Estado actualizado', detail: `"${s.name}" ahora está ${!s.status ? 'activo' : 'inactivo'}`, life: 2500 })
            loadData()
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: res.error, life: 3000 })
        }
    }

    // ─── Column Templates ──────────────────────────────────────────────────────

    const statusBodyTemplate = (rowData: Supplier) => (
        <InputSwitch checked={rowData.status} onChange={() => toggleStatus(rowData)} />
    )

    const actionBodyTemplate = (rowData: Supplier) => (
        <Button icon="pi pi-pencil" rounded severity="success" onClick={() => editSupplier(rowData)} />
    )

    const leftToolbarTemplate = () => (
        <div className="my-2">
            <Button label="Nuevo" icon="pi pi-plus" severity="success" onClick={openNew} />
        </div>
    )

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gestión de Proveedores</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar..." />
            </span>
        </div>
    )

    const supplierDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" text onClick={saveSupplier} />
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
                        value={suppliers}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} proveedores"
                        globalFilter={globalFilter}
                        globalFilterFields={['name', 'identification', 'email']}
                        emptyMessage="No se encontraron proveedores."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column field="name" header="Nombre" sortable headerStyle={{ minWidth: '15rem' }} />
                        <Column field="identification" header="Identificación" sortable headerStyle={{ minWidth: '12rem' }} />
                        <Column field="email" header="Correo" sortable headerStyle={{ minWidth: '15rem' }} />
                        <Column field="status" header="Activo" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '8rem' }} />
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '8rem' }} />
                    </DataTable>

                    {/* CREATE / EDIT DIALOG */}
                    <Dialog
                        visible={supplierDialog}
                        style={{ width: '500px' }}
                        header={editingId.current ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                        modal
                        className="p-fluid"
                        footer={supplierDialogFooter}
                        onHide={hideDialog}
                    >
                        <div className="field">
                            <label htmlFor="identification">Identificación</label>
                            <InputText
                                id="identification"
                                value={supplier.identification || ''}
                                onChange={(e) => setSupplier({ ...supplier, identification: e.target.value })}
                                required
                                autoFocus
                                disabled={!!editingId.current}
                                className={classNames({ 'p-invalid': submitted && !supplier.identification?.trim() })}
                            />
                            {submitted && !supplier.identification?.trim() && <small className="p-error">La identificación es obligatoria.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="name">Nombre Completo</label>
                            <InputText
                                id="name"
                                value={supplier.name || ''}
                                onChange={(e) => setSupplier({ ...supplier, name: e.target.value })}
                                required
                                className={classNames({ 'p-invalid': submitted && !supplier.name?.trim() })}
                            />
                            {submitted && !supplier.name?.trim() && <small className="p-error">El nombre es obligatorio.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="phone">Teléfono</label>
                            <InputText
                                id="phone"
                                value={supplier.phone || ''}
                                onChange={(e) => setSupplier({ ...supplier, phone: e.target.value })}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="email">Correo</label>
                            <InputText
                                id="email"
                                value={supplier.email || ''}
                                onChange={(e) => setSupplier({ ...supplier, email: e.target.value })}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="address">Dirección</label>
                            <InputText
                                id="address"
                                value={supplier.address || ''}
                                onChange={(e) => setSupplier({ ...supplier, address: e.target.value })}
                            />
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}

export default AdminSuppliersPage
