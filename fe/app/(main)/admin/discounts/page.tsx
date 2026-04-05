'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { Calendar } from 'primereact/calendar'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { Dropdown } from 'primereact/dropdown'
import { InputNumber } from 'primereact/inputnumber'
import { InputSwitch } from 'primereact/inputswitch'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Toast } from 'primereact/toast'
import { Toolbar } from 'primereact/toolbar'
import { classNames } from 'primereact/utils'

import { Discount } from '@/types/discount'
import { DiscountType } from '@/types/discounttype'
import { DiscountService } from '@/service/DiscountService'
import { DiscountTypeService } from '@/service/DiscountTypeService'

const today = new Date().toISOString().split('T')[0]

const emptyDiscount: Discount = {
    name: '',
    description: '',
    category: '',
    percentage: 10,
    startDate: today,
    endDate: today,
    status: true
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

const toDate = (s: string): Date | null => (s ? new Date(s + 'T00:00:00') : null)
const fromDate = (d: Date | null): string => (d ? d.toISOString().split('T')[0] : '')

const AdminDiscountsPage = () => {
    const [discounts, setDiscounts] = useState<Discount[]>([])
    const [activeCategories, setActiveCategories] = useState<DiscountType[]>([])

    const [discountDialog, setDiscountDialog] = useState(false)
    const [discount, setDiscount] = useState<Discount>(emptyDiscount)
    const [submitted, setSubmitted] = useState(false)
    const [globalFilter, setGlobalFilter] = useState('')
    const toast = useRef<Toast>(null)
    const dt = useRef<DataTable<Discount[]>>(null)
    const editingName = useRef<string>('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        Promise.all([DiscountService.getAll(), DiscountTypeService.getActiveDiscountTypes()]).then(([discountsData, activeTypes]) => {
            setDiscounts(discountsData)
            setActiveCategories(activeTypes)
        })
    }

    // ─── Validation ────────────────────────────────────────────────────────────

    const hasErrors = () => {
        if (!discount.name.trim()) return true
        if (!discount.description.trim()) return true
        if (!discount.category) return true
        if (discount.percentage < 1 || discount.percentage > 100) return true
        if (!discount.startDate) return true
        if (!discount.endDate) return true
        if (discount.endDate < discount.startDate) return true
        return false
    }

    // ─── CRUD Actions ──────────────────────────────────────────────────────────

    const openNew = () => {
        editingName.current = ''
        setDiscount(emptyDiscount)
        setSubmitted(false)
        setDiscountDialog(true)
    }

    const hideDialog = () => {
        setSubmitted(false)
        setDiscountDialog(false)
    }

    const saveDiscount = async () => {
        setSubmitted(true)
        if (hasErrors()) return

        let result
        if (editingName.current) {
            result = await DiscountService.update(editingName.current, discount)
            if (result.success) {
                toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Descuento actualizado correctamente', life: 3000 })
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error, life: 3000 })
                return
            }
        } else {
            result = await DiscountService.create(discount)
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
        editingName.current = d.name
        setDiscount({ ...d })
        setSubmitted(false)
        setDiscountDialog(true)
    }

    const toggleStatus = async (d: Discount) => {
        const res = await DiscountService.toggleStatus(d.name, d.status)
        if (res.success) {
            toast.current?.show({ severity: 'info', summary: 'Estado actualizado', detail: `"${d.name}" ahora está ${!d.status ? 'activo' : 'inactivo'}`, life: 2500 })
            loadData()
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: res.error, life: 3000 })
        }
    }

    // ─── Column Templates ──────────────────────────────────────────────────────

    const percentageBodyTemplate = (rowData: Discount) => `${rowData.percentage}%`

    const datesBodyTemplate = (rowData: Discount) => `${rowData.startDate} → ${rowData.endDate}`

    const statusBodyTemplate = (rowData: Discount) => <InputSwitch checked={rowData.status} onChange={() => toggleStatus(rowData)} />

    const actionBodyTemplate = (rowData: Discount) => <Button icon="pi pi-pencil" rounded severity="success" onClick={() => editDiscount(rowData)} />

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

    const pctInvalid = submitted && (discount.percentage < 1 || discount.percentage > 100)
    const dateInvalid = submitted && !!discount.startDate && !!discount.endDate && discount.endDate < discount.startDate

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
                        dataKey="name"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} descuentos"
                        globalFilter={globalFilter}
                        globalFilterFields={['name', 'category', 'description']}
                        emptyMessage="No se encontraron descuentos."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column field="name" header="Nombre" sortable headerStyle={{ minWidth: '14rem' }} />
                        <Column field="category" header="Categoría" sortable headerStyle={{ minWidth: '12rem' }} />
                        <Column field="description" header="Descripción" headerStyle={{ minWidth: '14rem' }} />
                        <Column header="Porcentaje" body={percentageBodyTemplate} sortable sortField="percentage" headerStyle={{ minWidth: '10rem' }} />
                        <Column header="Vigencia" body={datesBodyTemplate} headerStyle={{ minWidth: '16rem' }} />
                        <Column field="status" header="Activo" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '8rem' }} />
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '8rem' }} />
                    </DataTable>

                    {/* CREATE / EDIT DIALOG */}
                    <Dialog
                        visible={discountDialog}
                        style={{ width: '500px' }}
                        header={editingName.current ? 'Editar Descuento' : 'Nuevo Descuento'}
                        modal
                        className="p-fluid"
                        footer={dialogFooter}
                        onHide={hideDialog}
                    >
                        <div className="field">
                            <label htmlFor="name">Nombre Comercial</label>
                            <InputText
                                id="name"
                                value={discount.name}
                                onChange={(e) => setDiscount({ ...discount, name: e.target.value })}
                                required
                                autoFocus
                                className={classNames({ 'p-invalid': submitted && !discount.name.trim() })}
                            />
                            {submitted && !discount.name.trim() && <small className="p-error">El nombre es obligatorio.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="description">Descripción</label>
                            <InputTextarea
                                id="description"
                                value={discount.description}
                                onChange={(e) => setDiscount({ ...discount, description: e.target.value })}
                                rows={3}
                                className={classNames({ 'p-invalid': submitted && !discount.description.trim() })}
                            />
                            {submitted && !discount.description.trim() && <small className="p-error">La descripción es obligatoria.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="category">Categoría</label>
                            {activeCategories.length === 0 ? (
                                <small className="p-error block">No hay categorías de descuento activas.</small>
                            ) : (
                                <>
                                    <Dropdown
                                        id="category"
                                        value={discount.category || null}
                                        options={activeCategories}
                                        onChange={(e) => setDiscount({ ...discount, category: e.value })}
                                        optionLabel="name"
                                        optionValue="name"
                                        placeholder="Seleccione una categoría"
                                        className={classNames({ 'p-invalid': submitted && !discount.category })}
                                    />
                                    {submitted && !discount.category && <small className="p-error">La categoría es obligatoria.</small>}
                                </>
                            )}
                        </div>

                        <div className="field">
                            <label htmlFor="percentage">Porcentaje (%)</label>
                            <InputNumber
                                id="percentage"
                                value={discount.percentage}
                                onValueChange={(e) => setDiscount({ ...discount, percentage: e.value ?? 1 })}
                                min={1}
                                max={100}
                                suffix="%"
                                showButtons
                                className={classNames({ 'p-invalid': pctInvalid })}
                            />
                            {pctInvalid && <small className="p-error">El porcentaje debe estar entre 1 y 100.</small>}
                        </div>

                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="startDate">Fecha Inicio</label>
                                <Calendar
                                    id="startDate"
                                    value={toDate(discount.startDate)}
                                    onChange={(e) => setDiscount({ ...discount, startDate: fromDate(e.value as Date | null) })}
                                    dateFormat="yy-mm-dd"
                                    showIcon
                                    className={classNames({ 'p-invalid': submitted && !discount.startDate })}
                                />
                                {submitted && !discount.startDate && <small className="p-error">La fecha de inicio es obligatoria.</small>}
                            </div>

                            <div className="field col">
                                <label htmlFor="endDate">Fecha Final</label>
                                <Calendar
                                    id="endDate"
                                    value={toDate(discount.endDate)}
                                    onChange={(e) => setDiscount({ ...discount, endDate: fromDate(e.value as Date | null) })}
                                    dateFormat="yy-mm-dd"
                                    showIcon
                                    className={classNames({ 'p-invalid': submitted && (!discount.endDate || dateInvalid) })}
                                />
                                {submitted && !discount.endDate && <small className="p-error">La fecha final es obligatoria.</small>}
                                {dateInvalid && <small className="p-error">La fecha final debe ser mayor o igual a la de inicio.</small>}
                            </div>
                        </div>

                        <div className="field flex align-items-center gap-3">
                            <label htmlFor="status" className="mb-0">Activo</label>
                            <InputSwitch id="status" checked={discount.status} onChange={(e) => setDiscount({ ...discount, status: e.value })} />
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}

export default AdminDiscountsPage
