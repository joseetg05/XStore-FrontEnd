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
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'
import { Toolbar } from 'primereact/toolbar'
import { classNames } from 'primereact/utils'

import { Inventory } from '@/types/inventory'
import { InventoryService } from '@/service/InventoryService'
import { Product, ProductService } from '@/service/ProductService'
import { InventoryLocation, InventoryLocationService } from '@/service/InventoryLocationService'

const emptyInventory: Omit<Inventory, 'id'> = {
    productId: 0,
    locationId: 0,
    minStock: 0,
    currentStock: 0,
    status: true
}

const AdminInventoryPage = () => {
    const [items, setItems] = useState<Inventory[]>([])
    const [activeProducts, setActiveProducts] = useState<Product[]>([])
    const [activeLocations, setActiveLocations] = useState<InventoryLocation[]>([])
    const [productMap, setProductMap] = useState<Map<number, string>>(new Map())
    const [locationMap, setLocationMap] = useState<Map<number, string>>(new Map())

    const [inventoryDialog, setInventoryDialog] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState(false)
    const [item, setItem] = useState<Partial<Inventory>>(emptyInventory)
    const [submitted, setSubmitted] = useState(false)
    const [globalFilter, setGlobalFilter] = useState('')
    const toast = useRef<Toast>(null)
    const dt = useRef<DataTable<Inventory[]>>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        Promise.all([
            InventoryService.getAll(),
            ProductService.getAllProducts(),
            InventoryLocationService.getAll()
        ]).then(([inventoryData, productsData, locationsData]) => {
            setItems(inventoryData)

            const activeProds = productsData.filter((p) => p.status)
            setActiveProducts(activeProds)

            const pMap = new Map<number, string>()
            productsData.forEach((p) => pMap.set(p.id, p.description))
            setProductMap(pMap)

            const activeLocs = locationsData.filter((l) => l.status)
            setActiveLocations(activeLocs)

            const lMap = new Map<number, string>()
            locationsData.forEach((l) => lMap.set(l.id, l.name))
            setLocationMap(lMap)
        })
    }

    // ─── CRUD Actions ──────────────────────────────────────────────────────────

    const openNew = () => {
        setItem(emptyInventory)
        setSubmitted(false)
        setInventoryDialog(true)
    }

    const hideDialog = () => {
        setSubmitted(false)
        setInventoryDialog(false)
    }

    const hideDeleteDialog = () => {
        setDeleteDialog(false)
    }

    const saveItem = async () => {
        setSubmitted(true)

        if (!item.productId || !item.locationId) return
        if ((item.minStock ?? 0) < 0 || (item.currentStock ?? 0) < 0) return

        let result
        if (item.id) {
            result = await InventoryService.update(item as Inventory)
            if (result.success) {
                toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Registro actualizado correctamente', life: 3000 })
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error, life: 3000 })
                return
            }
        } else {
            result = await InventoryService.create(item as Omit<Inventory, 'id'>)
            if (result.success) {
                toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Registro creado correctamente', life: 3000 })
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error, life: 3000 })
                return
            }
        }

        setInventoryDialog(false)
        setItem(emptyInventory)
        loadData()
    }

    const editItem = (inv: Inventory) => {
        setItem({ ...inv })
        setSubmitted(false)
        setInventoryDialog(true)
    }

    const confirmDelete = (inv: Inventory) => {
        setItem({ ...inv })
        setDeleteDialog(true)
    }

    const deleteItem = async () => {
        if (!item.id) return
        const res = await InventoryService.delete(item.id)
        if (res.success) {
            toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Registro eliminado correctamente', life: 3000 })
            loadData()
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: res.error, life: 3000 })
        }
        setDeleteDialog(false)
        setItem(emptyInventory)
    }

    const toggleStatus = async (inv: Inventory) => {
        const res = await InventoryService.toggleStatus(inv.id)
        if (res.success) {
            const productName = productMap.get(inv.productId) ?? `ID: ${inv.productId}`
            toast.current?.show({ severity: 'info', summary: 'Estado actualizado', detail: `"${productName}" ahora está ${res.inventory?.status ? 'activo' : 'inactivo'}`, life: 2500 })
            loadData()
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: res.error, life: 3000 })
        }
    }

    // ─── Column Templates ──────────────────────────────────────────────────────

    const productBodyTemplate = (rowData: Inventory) =>
        productMap.get(rowData.productId) ?? `(ID: ${rowData.productId})`

    const locationBodyTemplate = (rowData: Inventory) =>
        locationMap.get(rowData.locationId) ?? `(ID: ${rowData.locationId})`

    const stockAlertBodyTemplate = (rowData: Inventory) => {
        const isLow = rowData.currentStock <= rowData.minStock
        return <Tag severity={isLow ? 'danger' : 'success'} value={isLow ? 'Stock bajo' : 'OK'} />
    }

    const statusBodyTemplate = (rowData: Inventory) => (
        <InputSwitch checked={rowData.status} onChange={() => toggleStatus(rowData)} />
    )

    const actionBodyTemplate = (rowData: Inventory) => (
        <>
            <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editItem(rowData)} />
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
            <h5 className="m-0">Gestión de Inventario</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar..." />
            </span>
        </div>
    )

    const dialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" text onClick={saveItem} />
        </>
    )

    const deleteDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteDialog} />
            <Button label="Sí" icon="pi pi-check" text onClick={deleteItem} />
        </>
    )

    const productName = item.productId ? (productMap.get(item.productId) ?? `ID: ${item.productId}`) : ''

    // ─── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} />

                    <DataTable
                        ref={dt}
                        value={items}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
                        globalFilter={globalFilter}
                        emptyMessage="No se encontraron registros de inventario."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column field="id" header="ID" sortable headerStyle={{ minWidth: '5rem' }} />
                        <Column header="Producto" body={productBodyTemplate} sortable sortField="productId" headerStyle={{ minWidth: '14rem' }} />
                        <Column header="Ubicación" body={locationBodyTemplate} sortable sortField="locationId" headerStyle={{ minWidth: '12rem' }} />
                        <Column field="currentStock" header="Stock Actual" sortable headerStyle={{ minWidth: '10rem' }} />
                        <Column field="minStock" header="Stock Mínimo" sortable headerStyle={{ minWidth: '10rem' }} />
                        <Column header="Alerta" body={stockAlertBodyTemplate} headerStyle={{ minWidth: '9rem' }} />
                        <Column field="status" header="Activo" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '8rem' }} />
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} />
                    </DataTable>

                    {/* CREATE / EDIT DIALOG */}
                    <Dialog
                        visible={inventoryDialog}
                        style={{ width: '500px' }}
                        header={item.id ? 'Editar Registro de Inventario' : 'Nuevo Registro de Inventario'}
                        modal
                        className="p-fluid"
                        footer={dialogFooter}
                        onHide={hideDialog}
                    >
                        <div className="field">
                            <label htmlFor="productId">Producto</label>
                            <Dropdown
                                id="productId"
                                value={item.productId || null}
                                options={activeProducts}
                                onChange={(e) => setItem({ ...item, productId: e.value })}
                                optionLabel="description"
                                optionValue="id"
                                placeholder="Seleccione un producto"
                                className={classNames({ 'p-invalid': submitted && !item.productId })}
                                filter
                            />
                            {submitted && !item.productId && <small className="p-error">El producto es obligatorio.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="locationId">Ubicación</label>
                            <Dropdown
                                id="locationId"
                                value={item.locationId || null}
                                options={activeLocations}
                                onChange={(e) => setItem({ ...item, locationId: e.value })}
                                optionLabel="name"
                                optionValue="id"
                                placeholder="Seleccione una ubicación"
                                className={classNames({ 'p-invalid': submitted && !item.locationId })}
                            />
                            {submitted && !item.locationId && <small className="p-error">La ubicación es obligatoria.</small>}
                        </div>

                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="currentStock">Stock Actual</label>
                                <InputNumber
                                    id="currentStock"
                                    value={item.currentStock ?? 0}
                                    onValueChange={(e) => setItem({ ...item, currentStock: e.value ?? 0 })}
                                    min={0}
                                    showButtons
                                    className={classNames({ 'p-invalid': submitted && (item.currentStock ?? 0) < 0 })}
                                />
                                {submitted && (item.currentStock ?? 0) < 0 && <small className="p-error">No puede ser negativo.</small>}
                            </div>
                            <div className="field col">
                                <label htmlFor="minStock">Stock Mínimo</label>
                                <InputNumber
                                    id="minStock"
                                    value={item.minStock ?? 0}
                                    onValueChange={(e) => setItem({ ...item, minStock: e.value ?? 0 })}
                                    min={0}
                                    showButtons
                                    className={classNames({ 'p-invalid': submitted && (item.minStock ?? 0) < 0 })}
                                />
                                {submitted && (item.minStock ?? 0) < 0 && <small className="p-error">No puede ser negativo.</small>}
                            </div>
                        </div>

                        <div className="field flex align-items-center gap-3">
                            <label htmlFor="status" className="mb-0">Activo</label>
                            <InputSwitch
                                id="status"
                                checked={item.status ?? true}
                                onChange={(e) => setItem({ ...item, status: e.value })}
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
                            <span>
                                ¿Estás seguro de que quieres eliminar el registro de <b>{productName}</b>?
                            </span>
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}

export default AdminInventoryPage
