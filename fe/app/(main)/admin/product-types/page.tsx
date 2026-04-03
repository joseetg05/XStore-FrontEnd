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

import { ProductType } from '@/types/producttype'
import { ProductTypeService } from '@/service/ProductTypeService'

const emptyProductType: Omit<ProductType, 'id'> = {
    name: '',
    status: true
}

const AdminProductTypesPage = () => {
    const [productTypes, setProductTypes] = useState<ProductType[]>([])
    const [typeDialog, setTypeDialog] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState(false)
    const [productType, setProductType] = useState<Partial<ProductType>>(emptyProductType)
    const [submitted, setSubmitted] = useState(false)
    const [globalFilter, setGlobalFilter] = useState('')
    const toast = useRef<Toast>(null)
    const dt = useRef<DataTable<ProductType[]>>(null)
    const originalName = useRef<string>('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        ProductTypeService.getAll().then((data) => setProductTypes(data))
    }

    // ─── CRUD Actions ──────────────────────────────────────────────────────────

    const openNew = () => {
        setProductType(emptyProductType)
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

    const saveProductType = async () => {
        setSubmitted(true)

        if (!productType.name?.trim()) return

        let result
        if (productType.id) {
            result = await ProductTypeService.update(originalName.current, productType as ProductType)
            if (result.success) {
                toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Tipo actualizado correctamente', life: 3000 })
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error, life: 3000 })
                return
            }
        } else {
            result = await ProductTypeService.create(productType as Omit<ProductType, 'id'>)
            if (result.success) {
                toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Tipo creado correctamente', life: 3000 })
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error, life: 3000 })
                return
            }
        }

        setTypeDialog(false)
        setProductType(emptyProductType)
        loadData()
    }

    const editProductType = (pt: ProductType) => {
        originalName.current = pt.name
        setProductType({ ...pt })
        setSubmitted(false)
        setTypeDialog(true)
    }

    const confirmDelete = (pt: ProductType) => {
        setProductType({ ...pt })
        setDeleteDialog(true)
    }

    const deleteProductType = async () => {
        if (!productType.name) return
        const res = await ProductTypeService.delete(productType.name)
        if (res.success) {
            toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Tipo eliminado correctamente', life: 3000 })
            loadData()
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: res.error, life: 3000 })
        }
        setDeleteDialog(false)
        setProductType(emptyProductType)
    }

    const toggleStatus = async (pt: ProductType) => {
        const res = await ProductTypeService.toggleStatus(pt.name, pt.status)
        if (res.success) {
            toast.current?.show({ severity: 'info', summary: 'Estado actualizado', detail: `"${pt.name}" ahora está ${res.productType?.status ? 'activo' : 'inactivo'}`, life: 2500 })
            loadData()
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: res.error, life: 3000 })
        }
    }

    // ─── Column Templates ──────────────────────────────────────────────────────

    const statusBodyTemplate = (rowData: ProductType) => (
        <InputSwitch
            checked={rowData.status}
            onChange={() => toggleStatus(rowData)}
        />
    )

    const actionBodyTemplate = (rowData: ProductType) => (
        <>
            <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editProductType(rowData)} />
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
            <h5 className="m-0">Gestión de Tipos de Producto</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar..." />
            </span>
        </div>
    )

    const typeDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" text onClick={saveProductType} />
        </>
    )

    const deleteDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteDialog} />
            <Button label="Sí" icon="pi pi-check" text onClick={deleteProductType} />
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
                        value={productTypes}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} tipos"
                        globalFilter={globalFilter}
                        globalFilterFields={['name']}
                        emptyMessage="No se encontraron tipos de producto."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column field="name" header="Nombre" sortable headerStyle={{ minWidth: '15rem' }} />
                        <Column field="status" header="Activo" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '8rem' }} />
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} />
                    </DataTable>

                    {/* CREATE / EDIT DIALOG */}
                    <Dialog
                        visible={typeDialog}
                        style={{ width: '450px' }}
                        header={productType.id ? 'Editar Tipo de Producto' : 'Nuevo Tipo de Producto'}
                        modal
                        className="p-fluid"
                        footer={typeDialogFooter}
                        onHide={hideDialog}
                    >
                        <div className="field">
                            <label htmlFor="name">Nombre</label>
                            <InputText
                                id="name"
                                value={productType.name || ''}
                                onChange={(e) => setProductType({ ...productType, name: e.target.value })}
                                required
                                autoFocus
                                className={classNames({ 'p-invalid': submitted && !productType.name?.trim() })}
                            />
                            {submitted && !productType.name?.trim() && <small className="p-error">El nombre es obligatorio.</small>}
                        </div>

                        <div className="field flex align-items-center gap-3">
                            <label htmlFor="status" className="mb-0">Activo</label>
                            <InputSwitch
                                id="status"
                                checked={productType.status ?? true}
                                onChange={(e) => setProductType({ ...productType, status: e.value })}
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
                            {productType && (
                                <span>
                                    ¿Estás seguro de que quieres eliminar <b>{productType.name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}

export default AdminProductTypesPage
