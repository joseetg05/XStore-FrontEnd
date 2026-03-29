'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { Calendar } from 'primereact/calendar'
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

const emptyDiscountType = (): Omit<DiscountType, 'id'> => ({
    name: '',
    startDate: new Date(),
    endDate: new Date(),
    status: true
})

const formatDate = (date: Date) =>
    date instanceof Date && !isNaN(date.getTime())
        ? date.toLocaleDateString('es-CR')
        : '—'

const AdminDiscountTypesPage = () => {
    const [discountTypes, setDiscountTypes] = useState<DiscountType[]>([])
    const [typeDialog, setTypeDialog] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState(false)
    const [discountType, setDiscountType] = useState<Partial<DiscountType>>(emptyDiscountType())
    const [submitted, setSubmitted] = useState(false)
    const [globalFilter, setGlobalFilter] = useState('')
    const toast = useRef<Toast>(null)
    const dt = useRef<DataTable<DiscountType[]>>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        DiscountTypeService.getAll().then((data) => setDiscountTypes(data))
    }

    // ─── Validation ────────────────────────────────────────────────────────────

    const isDateRangeValid = () => {
        if (!discountType.startDate || !discountType.endDate) return false
        return discountType.endDate >= discountType.startDate
    }

    const hasValidationErrors = () => {
        if (!discountType.name?.trim()) return true
        if (!discountType.startDate) return true
        if (!discountType.endDate) return true
        if (!isDateRangeValid()) return true
        return false
    }

    // ─── CRUD Actions ──────────────────────────────────────────────────────────

    const openNew = () => {
        setDiscountType(emptyDiscountType())
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
        if (hasValidationErrors()) return

        let result
        if (discountType.id) {
            result = await DiscountTypeService.update(discountType as DiscountType)
            if (result.success) {
                toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Tipo de descuento actualizado', life: 3000 })
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error, life: 3000 })
                return
            }
        } else {
            result = await DiscountTypeService.create(discountType as Omit<DiscountType, 'id'>)
            if (result.success) {
                toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Tipo de descuento creado', life: 3000 })
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error, life: 3000 })
                return
            }
        }

        setTypeDialog(false)
        setDiscountType(emptyDiscountType())
        loadData()
    }

    const editDiscountType = (dt: DiscountType) => {
        setDiscountType({ ...dt })
        setSubmitted(false)
        setTypeDialog(true)
    }

    const confirmDelete = (dt: DiscountType) => {
        setDiscountType({ ...dt })
        setDeleteDialog(true)
    }

    const deleteDiscountType = async () => {
        if (!discountType.id) return
        const res = await DiscountTypeService.delete(discountType.id)
        if (res.success) {
            toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Tipo de descuento eliminado', life: 3000 })
            loadData()
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: res.error, life: 3000 })
        }
        setDeleteDialog(false)
        setDiscountType(emptyDiscountType())
    }

    const toggleStatus = async (dt: DiscountType) => {
        const res = await DiscountTypeService.toggleStatus(dt.id)
        if (res.success) {
            toast.current?.show({ severity: 'info', summary: 'Estado actualizado', detail: `"${dt.name}" ahora está ${res.discountType?.status ? 'activo' : 'inactivo'}`, life: 2500 })
            loadData()
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: res.error, life: 3000 })
        }
    }

    // ─── Column Templates ──────────────────────────────────────────────────────

    const startDateBodyTemplate = (rowData: DiscountType) => formatDate(rowData.startDate)
    const endDateBodyTemplate = (rowData: DiscountType) => formatDate(rowData.endDate)

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
            <Button label="Nuevo" icon="pi pi-plus" severity="success" onClick={openNew} />
        </div>
    )

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gestión de Tipos de Descuento</h5>
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

    const dateRangeError = submitted && discountType.startDate && discountType.endDate && !isDateRangeValid()

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
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} tipos"
                        globalFilter={globalFilter}
                        globalFilterFields={['name']}
                        emptyMessage="No se encontraron tipos de descuento."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column field="id" header="ID" sortable headerStyle={{ minWidth: '5rem' }} />
                        <Column field="name" header="Nombre" sortable headerStyle={{ minWidth: '14rem' }} />
                        <Column header="Fecha Inicio" body={startDateBodyTemplate} sortable sortField="startDate" headerStyle={{ minWidth: '11rem' }} />
                        <Column header="Fecha Fin" body={endDateBodyTemplate} sortable sortField="endDate" headerStyle={{ minWidth: '11rem' }} />
                        <Column field="status" header="Activo" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '8rem' }} />
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} />
                    </DataTable>

                    {/* CREATE / EDIT DIALOG */}
                    <Dialog
                        visible={typeDialog}
                        style={{ width: '480px' }}
                        header={discountType.id ? 'Editar Tipo de Descuento' : 'Nuevo Tipo de Descuento'}
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

                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="startDate">Fecha de Inicio</label>
                                <Calendar
                                    id="startDate"
                                    value={discountType.startDate ?? null}
                                    onChange={(e) => setDiscountType({ ...discountType, startDate: e.value as Date })}
                                    dateFormat="dd/mm/yy"
                                    showIcon
                                    className={classNames({ 'p-invalid': submitted && !discountType.startDate })}
                                />
                                {submitted && !discountType.startDate && <small className="p-error">La fecha de inicio es obligatoria.</small>}
                            </div>
                            <div className="field col">
                                <label htmlFor="endDate">Fecha de Fin</label>
                                <Calendar
                                    id="endDate"
                                    value={discountType.endDate ?? null}
                                    onChange={(e) => setDiscountType({ ...discountType, endDate: e.value as Date })}
                                    dateFormat="dd/mm/yy"
                                    showIcon
                                    className={classNames({ 'p-invalid': submitted && (!discountType.endDate || dateRangeError) })}
                                />
                                {submitted && !discountType.endDate && <small className="p-error">La fecha de fin es obligatoria.</small>}
                                {dateRangeError && <small className="p-error">La fecha de fin debe ser mayor o igual a la fecha de inicio.</small>}
                            </div>
                        </div>

                        <div className="field flex align-items-center gap-3">
                            <label htmlFor="status" className="mb-0">Activo</label>
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
