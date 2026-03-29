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

import { Brand } from '@/types/brand'
import { BrandService } from '@/service/BrandService'

const emptyBrand: Omit<Brand, 'id'> = {
    name: '',
    status: true
}

const AdminBrandsPage = () => {
    const [brands, setBrands] = useState<Brand[]>([])
    const [brandDialog, setBrandDialog] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState(false)
    const [brand, setBrand] = useState<Partial<Brand>>(emptyBrand)
    const [submitted, setSubmitted] = useState(false)
    const [globalFilter, setGlobalFilter] = useState('')
    const toast = useRef<Toast>(null)
    const dt = useRef<DataTable<Brand[]>>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        BrandService.getAll().then((data) => setBrands(data))
    }

    // ─── CRUD Actions ──────────────────────────────────────────────────────────

    const openNew = () => {
        setBrand(emptyBrand)
        setSubmitted(false)
        setBrandDialog(true)
    }

    const hideDialog = () => {
        setSubmitted(false)
        setBrandDialog(false)
    }

    const hideDeleteDialog = () => {
        setDeleteDialog(false)
    }

    const saveBrand = async () => {
        setSubmitted(true)

        if (!brand.name?.trim()) return

        let result
        if (brand.id) {
            result = await BrandService.update(brand as Brand)
            if (result.success) {
                toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Marca actualizada correctamente', life: 3000 })
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error, life: 3000 })
                return
            }
        } else {
            result = await BrandService.create(brand as Omit<Brand, 'id'>)
            if (result.success) {
                toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Marca creada correctamente', life: 3000 })
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error, life: 3000 })
                return
            }
        }

        setBrandDialog(false)
        setBrand(emptyBrand)
        loadData()
    }

    const editBrand = (b: Brand) => {
        setBrand({ ...b })
        setSubmitted(false)
        setBrandDialog(true)
    }

    const confirmDelete = (b: Brand) => {
        setBrand({ ...b })
        setDeleteDialog(true)
    }

    const deleteBrand = async () => {
        if (!brand.id) return
        const res = await BrandService.delete(brand.id)
        if (res.success) {
            toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Marca eliminada correctamente', life: 3000 })
            loadData()
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: res.error, life: 3000 })
        }
        setDeleteDialog(false)
        setBrand(emptyBrand)
    }

    const toggleStatus = async (b: Brand) => {
        const res = await BrandService.toggleStatus(b.id)
        if (res.success) {
            toast.current?.show({ severity: 'info', summary: 'Estado actualizado', detail: `"${b.name}" ahora está ${res.brand?.status ? 'activa' : 'inactiva'}`, life: 2500 })
            loadData()
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: res.error, life: 3000 })
        }
    }

    // ─── Column Templates ──────────────────────────────────────────────────────

    const statusBodyTemplate = (rowData: Brand) => (
        <InputSwitch
            checked={rowData.status}
            onChange={() => toggleStatus(rowData)}
        />
    )

    const actionBodyTemplate = (rowData: Brand) => (
        <>
            <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editBrand(rowData)} />
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
            <h5 className="m-0">Gestión de Marcas</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar..." />
            </span>
        </div>
    )

    const brandDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" text onClick={saveBrand} />
        </>
    )

    const deleteDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteDialog} />
            <Button label="Sí" icon="pi pi-check" text onClick={deleteBrand} />
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
                        value={brands}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} marcas"
                        globalFilter={globalFilter}
                        globalFilterFields={['name']}
                        emptyMessage="No se encontraron marcas."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column field="id" header="ID" sortable headerStyle={{ minWidth: '5rem' }} />
                        <Column field="name" header="Nombre" sortable headerStyle={{ minWidth: '15rem' }} />
                        <Column field="status" header="Activa" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '8rem' }} />
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} />
                    </DataTable>

                    {/* CREATE / EDIT DIALOG */}
                    <Dialog
                        visible={brandDialog}
                        style={{ width: '450px' }}
                        header={brand.id ? 'Editar Marca' : 'Nueva Marca'}
                        modal
                        className="p-fluid"
                        footer={brandDialogFooter}
                        onHide={hideDialog}
                    >
                        <div className="field">
                            <label htmlFor="name">Nombre</label>
                            <InputText
                                id="name"
                                value={brand.name || ''}
                                onChange={(e) => setBrand({ ...brand, name: e.target.value })}
                                required
                                autoFocus
                                className={classNames({ 'p-invalid': submitted && !brand.name?.trim() })}
                            />
                            {submitted && !brand.name?.trim() && <small className="p-error">El nombre es obligatorio.</small>}
                        </div>

                        <div className="field flex align-items-center gap-3">
                            <label htmlFor="status" className="mb-0">Activa</label>
                            <InputSwitch
                                id="status"
                                checked={brand.status ?? true}
                                onChange={(e) => setBrand({ ...brand, status: e.value })}
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
                            {brand && (
                                <span>
                                    ¿Estás seguro de que quieres eliminar <b>{brand.name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}

export default AdminBrandsPage
