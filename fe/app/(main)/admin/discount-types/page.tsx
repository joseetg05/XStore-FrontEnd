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

import { DiscountType } from '@/types/discounttype'
import { DiscountTypeService } from '@/service/DiscountTypeService'

const emptyDiscountType: Omit<DiscountType, 'id'> = {
    name: '',
    status: true
}

const AdminDiscountTypesPage = () => {
    const [discountTypes, setDiscountTypes] = useState<DiscountType[]>([])
    const [typeDialog, setTypeDialog] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState(false)
    const [discountType, setDiscountType] = useState<Partial<DiscountType>>(emptyDiscountType)
    const [submitted, setSubmitted] = useState(false)
    const [globalFilter, setGlobalFilter] = useState('')
    const toast = useRef<Toast>(null)
    const dt = useRef<DataTable<DiscountType[]>>(null)
    const originalName = useRef<string>('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        DiscountTypeService.getAll().then((data) => setDiscountTypes(data))
    }

    // ─── CRUD Actions ──────────────────────────────────────────────────────────

    const openNew = () => {
        setDiscountType(emptyDiscountType)
        setSubmitted(false)
        setTypeDialog(true)
    }

    const hideDialog = () => {
        setSubmitted(false)
        setTypeDialog(false)
    }

    const hideDeleteDialog = () => {
        setDeleteDialog(false)
    }

    const saveDiscountType = async () => {
        setSubmitted(true)
        if (!discountType.name?.trim()) return

        let result
        if (discountType.id) {
            result = await DiscountTypeService.update(originalName.current, discountType as DiscountType)
            if (result.success) {
                toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Categoría actualizada correctamente', life: 3000 })
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error, life: 3000 })
                return
            }
        } else {
            result = await DiscountTypeService.create(discountType as Omit<DiscountType, 'id'>)
            if (result.success) {
                toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Categoría creada correctamente', life: 3000 })
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error, life: 3000 })
                return
            }
        }

        setTypeDialog(false)
        setDiscountType(emptyDiscountType)
        loadData()
    }

    const editDiscountType = (d: DiscountType) => {
        originalName.current = d.name
        setDiscountType({ ...d })
        setSubmitted(false)
        setTypeDialog(true)
    }

    const confirmDelete = (d: DiscountType) => {
        setDiscountType({ ...d })
        setDeleteDialog(true)
    }

    const deleteDiscountType = async () => {
        if (!discountType.name) return
        const res = await DiscountTypeService.delete(discountType.name)
        if (res.success) {
            toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Categoría eliminada correctamente', life: 3000 })
            loadData()
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: res.error, life: 3000 })
        }
        setDeleteDialog(false)
        setDiscountType(emptyDiscountType)
    }

    const toggleStatus = async (d: DiscountType) => {
        const res = await DiscountTypeService.toggleStatus(d.name, d.status)
        if (res.success) {
            toast.current?.show({ severity: 'info', summary: 'Estado actualizado', detail: `"${d.name}" ahora está ${res.discountType?.status ? 'activa' : 'inactiva'}`, life: 2500 })
            loadData()
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: res.error, life: 3000 })
        }
    }

    // ─── Column Templates ──────────────────────────────────────────────────────

    const statusBodyTemplate = (rowData: DiscountType) => (
        <InputSwitch checked={rowData.status} onChange={() => toggleStatus(rowData)} />
    )

    const actionBodyTemplate = (rowData: DiscountType) => (
        <>
            <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editDiscountType(rowData)} />
            <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDelete(rowData)} />
        </>
    )

    const leftToolbarTemplate = () => (
        <div className="my-2">
            <Button label="Nueva" icon="pi pi-plus" severity="success" onClick={openNew} />
        </div>
    )

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gestión de Categorías de Descuento</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar..." />
            </span>
        </div>
    )

    const dialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" text onClick={saveDiscountType} />
        </>
    )

    const deleteDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteDialog} />
            <Button label="Sí" icon="pi pi-check" text onClick={deleteDiscountType} />
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
                        value={discountTypes}
                        dataKey="name"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} categorías"
                        globalFilter={globalFilter}
                        globalFilterFields={['name']}
                        emptyMessage="No se encontraron categorías de descuento."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column field="name" header="Nombre" sortable headerStyle={{ minWidth: '15rem' }} />
                        <Column field="status" header="Activa" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '8rem' }} />
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} />
                    </DataTable>

                    {/* CREATE / EDIT DIALOG */}
                    <Dialog
                        visible={typeDialog}
                        style={{ width: '450px' }}
                        header={discountType.id ? 'Editar Categoría de Descuento' : 'Nueva Categoría de Descuento'}
                        modal
                        className="p-fluid"
                        footer={dialogFooter}
                        onHide={hideDialog}
                    >
                        <div className="field">
                            <label htmlFor="name">Nombre</label>
                            <InputText
                                id="name"
                                value={discountType.name || ''}
                                onChange={(e) => setDiscountType({ ...discountType, name: e.target.value })}
                                required
                                autoFocus
                                className={classNames({ 'p-invalid': submitted && !discountType.name?.trim() })}
                            />
                            {submitted && !discountType.name?.trim() && <small className="p-error">El nombre es obligatorio.</small>}
                        </div>

                        <div className="field flex align-items-center gap-3">
                            <label htmlFor="status" className="mb-0">Activa</label>
                            <InputSwitch
                                id="status"
                                checked={discountType.status ?? true}
                                onChange={(e) => setDiscountType({ ...discountType, status: e.value })}
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
                            {discountType && (
                                <span>
                                    ¿Estás seguro de que quieres eliminar <b>{discountType.name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}

export default AdminDiscountTypesPage
