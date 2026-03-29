'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { Dropdown } from 'primereact/dropdown'
import { InputNumber } from 'primereact/inputnumber'
import { InputSwitch } from 'primereact/inputswitch'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { Toolbar } from 'primereact/toolbar'
import { classNames } from 'primereact/utils'

import { Discount } from '@/types/discount'
import { DiscountType } from '@/types/discounttype'
import { DiscountService } from '@/service/DiscountService'
import { DiscountTypeService } from '@/service/DiscountTypeService'

const emptyDiscount: Omit<Discount, 'id'> = {
    name: '',
    discountTypeId: 0,
    percentage: 10,
    status: true
}

const AdminDiscountsPage = () => {
    const [discounts, setDiscounts] = useState<Discount[]>([])
    const [activeDiscountTypes, setActiveDiscountTypes] = useState<DiscountType[]>([])
    const [discountTypeMap, setDiscountTypeMap] = useState<Map<number, string>>(new Map())

    const [discountDialog, setDiscountDialog] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState(false)
    const [discount, setDiscount] = useState<Partial<Discount>>(emptyDiscount)
    const [submitted, setSubmitted] = useState(false)
    const [globalFilter, setGlobalFilter] = useState('')
    const toast = useRef<Toast>(null)
    const dt = useRef<DataTable<Discount[]>>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        Promise.all([
            DiscountService.getAll(),
            DiscountTypeService.getAll(),
            DiscountTypeService.getActiveDiscountTypes()
        ]).then(([discountsData, allTypes, activeTypes]) => {
            setDiscounts(discountsData)
            setActiveDiscountTypes(activeTypes)
            const map = new Map<number, string>()
            allTypes.forEach((t) => map.set(t.id, t.name))
            setDiscountTypeMap(map)
        })
    }

    // ─── Validation ────────────────────────────────────────────────────────────

    const hasValidationErrors = () => {
        if (!discount.name?.trim()) return true
        if (!discount.discountTypeId) return true
        const pct = discount.percentage ?? 0
        if (pct < 1 || pct > 100) return true
        return false
    }

    // ─── CRUD Actions ──────────────────────────────────────────────────────────

    const openNew = () => {
        setDiscount(emptyDiscount)
        setSubmitted(false)
        setDiscountDialog(true)
    }

    const hideDialog = () => {
        setSubmitted(false)
        setDiscountDialog(false)
    }

    const hideDeleteDialog = () => {
        setDeleteDialog(false)
    }

    const saveDiscount = async () => {
        setSubmitted(true)
        if (hasValidationErrors()) return

        let result
        if (discount.id) {
            result = await DiscountService.update(discount as Discount)
            if (result.success) {
                toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Descuento actualizado correctamente', life: 3000 })
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error, life: 3000 })
                return
            }
        } else {
            result = await DiscountService.create(discount as Omit<Discount, 'id'>)
            if (result.success) {
                toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Descuento creado correctamente', life: 3000 })
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error, life: 3000 })
                return
            }
        }

        setDiscountDialog(false)
        setDiscount(emptyDiscount)
        loadData()
    }

    const editDiscount = (d: Discount) => {
        setDiscount({ ...d })
        setSubmitted(false)
        setDiscountDialog(true)
    }

    const confirmDelete = (d: Discount) => {
        setDiscount({ ...d })
        setDeleteDialog(true)
    }

    const deleteDiscount = async () => {
        if (!discount.id) return
        const res = await DiscountService.delete(discount.id)
        if (res.success) {
            toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Descuento eliminado correctamente', life: 3000 })
            loadData()
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: res.error, life: 3000 })
        }
        setDeleteDialog(false)
        setDiscount(emptyDiscount)
    }

    const toggleStatus = async (d: Discount) => {
        const res = await DiscountService.toggleStatus(d.id)
        if (res.success) {
            toast.current?.show({ severity: 'info', summary: 'Estado actualizado', detail: `"${d.name}" ahora está ${res.discount?.status ? 'activo' : 'inactivo'}`, life: 2500 })
            loadData()
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: res.error, life: 3000 })
        }
    }

    // ─── Column Templates ──────────────────────────────────────────────────────

    const discountTypeBodyTemplate = (rowData: Discount) =>
        discountTypeMap.get(rowData.discountTypeId) ?? `(ID: ${rowData.discountTypeId})`

    const percentageBodyTemplate = (rowData: Discount) => `${rowData.percentage}%`

    const statusBodyTemplate = (rowData: Discount) => (
        <InputSwitch checked={rowData.status} onChange={() => toggleStatus(rowData)} />
    )

    const actionBodyTemplate = (rowData: Discount) => (
        <>
            <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editDiscount(rowData)} />
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
            <h5 className="m-0">Gestión de Descuentos</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar..." />
            </span>
        </div>
    )

    const dialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" text onClick={saveDiscount} />
        </>
    )

    const deleteDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteDialog} />
            <Button label="Sí" icon="pi pi-check" text onClick={deleteDiscount} />
        </>
    )

    const pct = discount.percentage ?? 0
    const percentageInvalid = submitted && (pct < 1 || pct > 100)

    // ─── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} />

                    <DataTable
                        ref={dt}
                        value={discounts}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} descuentos"
                        globalFilter={globalFilter}
                        globalFilterFields={['name']}
                        emptyMessage="No se encontraron descuentos."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column field="id" header="ID" sortable headerStyle={{ minWidth: '5rem' }} />
                        <Column field="name" header="Nombre" sortable headerStyle={{ minWidth: '14rem' }} />
                        <Column header="Tipo de Descuento" body={discountTypeBodyTemplate} sortable sortField="discountTypeId" headerStyle={{ minWidth: '14rem' }} />
                        <Column header="Porcentaje" body={percentageBodyTemplate} sortable sortField="percentage" headerStyle={{ minWidth: '10rem' }} />
                        <Column field="status" header="Activo" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '8rem' }} />
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} />
                    </DataTable>

                    {/* CREATE / EDIT DIALOG */}
                    <Dialog
                        visible={discountDialog}
                        style={{ width: '480px' }}
                        header={discount.id ? 'Editar Descuento' : 'Nuevo Descuento'}
                        modal
                        className="p-fluid"
                        footer={dialogFooter}
                        onHide={hideDialog}
                    >
                        <div className="field">
                            <label htmlFor="name">Nombre</label>
                            <InputText
                                id="name"
                                value={discount.name || ''}
                                onChange={(e) => setDiscount({ ...discount, name: e.target.value })}
                                required
                                autoFocus
                                className={classNames({ 'p-invalid': submitted && !discount.name?.trim() })}
                            />
                            {submitted && !discount.name?.trim() && <small className="p-error">El nombre es obligatorio.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="discountTypeId">Tipo de Descuento</label>
                            {activeDiscountTypes.length === 0 ? (
                                <small className="p-error block">No hay tipos de descuento activos. Active al menos uno antes de crear un descuento.</small>
                            ) : (
                                <>
                                    <Dropdown
                                        id="discountTypeId"
                                        value={discount.discountTypeId || null}
                                        options={activeDiscountTypes}
                                        onChange={(e) => setDiscount({ ...discount, discountTypeId: e.value })}
                                        optionLabel="name"
                                        optionValue="id"
                                        placeholder="Seleccione un tipo"
                                        className={classNames({ 'p-invalid': submitted && !discount.discountTypeId })}
                                    />
                                    {submitted && !discount.discountTypeId && <small className="p-error">El tipo de descuento es obligatorio.</small>}
                                </>
                            )}
                        </div>

                        <div className="field">
                            <label htmlFor="percentage">Porcentaje (%)</label>
                            <InputNumber
                                id="percentage"
                                value={discount.percentage ?? 10}
                                onValueChange={(e) => setDiscount({ ...discount, percentage: e.value ?? 1 })}
                                min={1}
                                max={100}
                                suffix="%"
                                showButtons
                                className={classNames({ 'p-invalid': percentageInvalid })}
                            />
                            {percentageInvalid && <small className="p-error">El porcentaje debe estar entre 1 y 100.</small>}
                        </div>

                        <div className="field flex align-items-center gap-3">
                            <label htmlFor="status" className="mb-0">Activo</label>
                            <InputSwitch
                                id="status"
                                checked={discount.status ?? true}
                                onChange={(e) => setDiscount({ ...discount, status: e.value })}
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
                            {discount && (
                                <span>
                                    ¿Estás seguro de que quieres eliminar <b>{discount.name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}

export default AdminDiscountsPage
