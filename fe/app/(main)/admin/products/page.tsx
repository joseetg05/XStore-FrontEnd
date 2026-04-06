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

import { CreateProductPayload, UpdateProductPayload, Product, ProductService, ProductType, Brand } from '../../../../service/ProductService'
import { DiscountService } from '../../../../service/DiscountService'
import { InventoryLocationService } from '../../../../service/InventoryLocationService'
import { SupplierService } from '../../../../service/SupplierService'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DropdownOption { name: string; label: string }

const emptyForm: CreateProductPayload = {
    imageUrl: '',
    description: '',
    type: '',
    brand: '',
    provider: '',
    purchasePrice: 0,
    salePrice: 0,
    location: '',
    entryQuantity: 1,
    minStock: 1,
    discountName: ''
}

const formatCurrency = (value: number) =>
    value.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })

// ─── Page ─────────────────────────────────────────────────────────────────────

const AdminProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [productDialog, setProductDialog] = useState(false)
    const [editDialog, setEditDialog] = useState(false)
    const [editForm, setEditForm] = useState<UpdateProductPayload & { salePrice: number; purchasePrice: number; status: boolean }>({
        description: '', nuevaDescripcion: '', nuevaRutaImagen: '', nuevoTipoProducto: '', nuevaMarcaProducto: '',
        nuevoNombreProveedor: '', nuevoPrecioCompra: 0, nuevoPrecioVenta: 0, nuevoNombreDescuento: '', nuevoEstado: true,
        salePrice: 0, purchasePrice: 0, status: true
    })
    const [form, setForm] = useState<CreateProductPayload>(emptyForm)
    const [submitted, setSubmitted] = useState(false)
    const [editSubmitted, setEditSubmitted] = useState(false)
    const [globalFilter, setGlobalFilter] = useState('')
    const toast = useRef<Toast>(null)
    const dt = useRef<DataTable<Product[]>>(null)

    // Dropdown options
    const [types, setTypes] = useState<ProductType[]>([])
    const [brands, setBrands] = useState<Brand[]>([])
    const [providers, setProviders] = useState<string[]>([])
    const [locations, setLocations] = useState<string[]>([])
    const [discountOptions, setDiscountOptions] = useState<DropdownOption[]>([])

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        ProductService.getAllProducts().then(setProducts)
        ProductService.getProductTypes().then(setTypes)
        ProductService.getBrands().then(setBrands)
        SupplierService.getAll().then((s) => setProviders(s.map((x) => x.name)))
        InventoryLocationService.getActiveLocations().then((l) => setLocations(l.map((x) => x.name)))
        DiscountService.getActive().then((d) =>
            setDiscountOptions([
                { name: '', label: 'Sin descuento' },
                ...d.map((x) => ({ name: x.name, label: `${x.name} (${x.percentage}%)` }))
            ])
        )
    }

    const openNew = () => {
        setForm(emptyForm)
        setSubmitted(false)
        setProductDialog(true)
    }

    const hideDialog = () => {
        setSubmitted(false)
        setProductDialog(false)
    }

    const isValid = () =>
        form.description.trim() &&
        form.type &&
        form.brand &&
        form.provider &&
        form.location &&
        form.salePrice > 0 &&
        form.purchasePrice >= 0 &&
        form.entryQuantity >= 1 &&
        form.minStock >= 1

    const saveProduct = async () => {
        setSubmitted(true)
        if (!isValid()) return

        const result = await ProductService.createProduct(form)
        if (result.success) {
            toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Producto registrado correctamente', life: 3000 })
            setProductDialog(false)
            setForm(emptyForm)
            loadData()
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error, life: 3000 })
        }
    }

    // ─── Column Templates ──────────────────────────────────────────────────────

    const imageBodyTemplate = (rowData: Product) => (
        <img
            src={rowData.imageUrl}
            alt={rowData.description}
            className="shadow-2"
            width="64"
            onError={(e) => (e.currentTarget.src = 'https://static.thenounproject.com/png/504708-200.png')}
        />
    )

    const priceBodyTemplate = (rowData: Product) => formatCurrency(rowData.salePrice)

    const statusBodyTemplate = (rowData: Product) => (
        <InputSwitch checked={rowData.status} disabled />
    )

    const actionBodyTemplate = (rowData: Product) => (
        <Button icon="pi pi-pencil" rounded severity="info" onClick={() => openEdit(rowData)} tooltip="Editar" tooltipOptions={{ position: 'left' }} />
    )

    const leftToolbarTemplate = () => (
        <div className="my-2">
            <Button label="Nuevo" icon="pi pi-plus" severity="success" onClick={openNew} />
        </div>
    )

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gestión de Productos</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar..." />
            </span>
        </div>
    )

    const dialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" text onClick={saveProduct} />
        </>
    )

    const openEdit = (product: Product) => {
        setEditForm({
            description: product.description,
            nuevaDescripcion: product.description,
            nuevaRutaImagen: product.imageUrl,
            nuevoTipoProducto: product.type,
            nuevaMarcaProducto: product.brand,
            nuevoNombreProveedor: product.provider,
            nuevoPrecioCompra: product.purchasePrice,
            nuevoPrecioVenta: product.salePrice,
            nuevoNombreDescuento: product.discountName || '',
            nuevoEstado: product.status,
            salePrice: product.salePrice,
            purchasePrice: product.purchasePrice,
            status: product.status
        })
        setEditSubmitted(false)
        setEditDialog(true)
    }

    const saveEdit = async () => {
        setEditSubmitted(true)
        if (!editForm.nuevaDescripcion?.trim() || (editForm.nuevoPrecioVenta ?? 0) <= 0) return

        const result = await ProductService.updateProduct({
            description: editForm.description,
            nuevaDescripcion: editForm.nuevaDescripcion !== editForm.description ? editForm.nuevaDescripcion : null,
            nuevaRutaImagen: editForm.nuevaRutaImagen || null,
            nuevoTipoProducto: editForm.nuevoTipoProducto || null,
            nuevaMarcaProducto: editForm.nuevaMarcaProducto || null,
            nuevoNombreProveedor: editForm.nuevoNombreProveedor || null,
            nuevoPrecioCompra: editForm.nuevoPrecioCompra ?? null,
            nuevoPrecioVenta: editForm.nuevoPrecioVenta ?? null,
            nuevoNombreDescuento: editForm.nuevoNombreDescuento ?? null,
            nuevoEstado: editForm.nuevoEstado ?? null
        })
        if (result.success) {
            toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Producto actualizado correctamente', life: 3000 })
            setEditDialog(false)
            loadData()
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error, life: 3000 })
        }
    }

    const req = (field: boolean) => submitted && !field
    const reqEdit = (field: boolean) => editSubmitted && !field

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} />

                    <DataTable
                        ref={dt}
                        value={products}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos"
                        globalFilter={globalFilter}
                        globalFilterFields={['description', 'type', 'brand', 'provider']}
                        emptyMessage="No se encontraron productos."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column header="Imagen" body={imageBodyTemplate} headerStyle={{ minWidth: '5rem' }} />
                        <Column field="description" header="Descripción" sortable headerStyle={{ minWidth: '15rem' }} />
                        <Column field="type" header="Tipo" sortable headerStyle={{ minWidth: '10rem' }} />
                        <Column field="brand" header="Marca" sortable headerStyle={{ minWidth: '10rem' }} />
                        <Column field="provider" header="Proveedor" sortable headerStyle={{ minWidth: '12rem' }} />
                        <Column field="salePrice" header="Precio Venta" body={priceBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }} />
                        <Column field="status" header="Activo" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '7rem' }} />
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '5rem' }} />
                    </DataTable>

                    {/* CREATE DIALOG */}
                    <Dialog
                        visible={productDialog}
                        style={{ width: '620px' }}
                        header="Nuevo Producto"
                        modal
                        className="p-fluid"
                        footer={dialogFooter}
                        onHide={hideDialog}
                    >
                        {/* Descripción */}
                        <div className="field">
                            <label htmlFor="description">Descripción *</label>
                            <InputText
                                id="description"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                autoFocus
                                className={classNames({ 'p-invalid': req(!!form.description.trim()) })}
                            />
                            {req(!!form.description.trim()) && <small className="p-error">La descripción es obligatoria.</small>}
                        </div>

                        {/* URL Imagen */}
                        <div className="field">
                            <label htmlFor="imageUrl">URL de la Imagen</label>
                            <InputText
                                id="imageUrl"
                                value={form.imageUrl}
                                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>

                        {/* Tipo / Marca */}
                        <div className="formgrid grid">
                            <div className="field col">
                                <label>Tipo de Producto *</label>
                                <Dropdown
                                    value={form.type || null}
                                    options={types}
                                    onChange={(e) => setForm({ ...form, type: e.value })}
                                    optionLabel="name"
                                    optionValue="name"
                                    placeholder="Seleccione uno"
                                    className={classNames({ 'p-invalid': req(!!form.type) })}
                                />
                                {req(!!form.type) && <small className="p-error">Requerido.</small>}
                            </div>
                            <div className="field col">
                                <label>Marca *</label>
                                <Dropdown
                                    value={form.brand || null}
                                    options={brands}
                                    onChange={(e) => setForm({ ...form, brand: e.value })}
                                    optionLabel="name"
                                    optionValue="name"
                                    placeholder="Seleccione una"
                                    className={classNames({ 'p-invalid': req(!!form.brand) })}
                                />
                                {req(!!form.brand) && <small className="p-error">Requerido.</small>}
                            </div>
                        </div>

                        {/* Proveedor / Ubicación */}
                        <div className="formgrid grid">
                            <div className="field col">
                                <label>Proveedor *</label>
                                <Dropdown
                                    value={form.provider || null}
                                    options={providers.map((p) => ({ label: p, value: p }))}
                                    onChange={(e) => setForm({ ...form, provider: e.value })}
                                    placeholder="Seleccione uno"
                                    className={classNames({ 'p-invalid': req(!!form.provider) })}
                                />
                                {req(!!form.provider) && <small className="p-error">Requerido.</small>}
                            </div>
                            <div className="field col">
                                <label>Ubicación *</label>
                                <Dropdown
                                    value={form.location || null}
                                    options={locations.map((l) => ({ label: l, value: l }))}
                                    onChange={(e) => setForm({ ...form, location: e.value })}
                                    placeholder="Seleccione una"
                                    className={classNames({ 'p-invalid': req(!!form.location) })}
                                />
                                {req(!!form.location) && <small className="p-error">Requerido.</small>}
                            </div>
                        </div>

                        {/* Precios */}
                        <div className="formgrid grid">
                            <div className="field col">
                                <label>Precio de Compra *</label>
                                <InputNumber
                                    value={form.purchasePrice}
                                    onValueChange={(e) => setForm({ ...form, purchasePrice: e.value ?? 0 })}
                                    mode="currency"
                                    currency="CRC"
                                    locale="es-CR"
                                />
                            </div>
                            <div className="field col">
                                <label>Precio de Venta *</label>
                                <InputNumber
                                    value={form.salePrice}
                                    onValueChange={(e) => setForm({ ...form, salePrice: e.value ?? 0 })}
                                    mode="currency"
                                    currency="CRC"
                                    locale="es-CR"
                                    className={classNames({ 'p-invalid': req(form.salePrice > 0) })}
                                />
                                {req(form.salePrice > 0) && <small className="p-error">Debe ser mayor a 0.</small>}
                            </div>
                        </div>

                        {/* Cantidad ingreso / Stock mínimo */}
                        <div className="formgrid grid">
                            <div className="field col">
                                <label>Cantidad de Ingreso *</label>
                                <InputNumber
                                    value={form.entryQuantity}
                                    onValueChange={(e) => setForm({ ...form, entryQuantity: e.value ?? 1 })}
                                    min={1}
                                    showButtons
                                    className={classNames({ 'p-invalid': req(form.entryQuantity >= 1) })}
                                />
                                {req(form.entryQuantity >= 1) && <small className="p-error">Debe ser al menos 1.</small>}
                            </div>
                            <div className="field col">
                                <label>Stock Mínimo *</label>
                                <InputNumber
                                    value={form.minStock}
                                    onValueChange={(e) => setForm({ ...form, minStock: e.value ?? 1 })}
                                    min={1}
                                    showButtons
                                    className={classNames({ 'p-invalid': req(form.minStock >= 1) })}
                                />
                                {req(form.minStock >= 1) && <small className="p-error">Debe ser al menos 1.</small>}
                            </div>
                        </div>

                        {/* Descuento */}
                        <div className="field">
                            <label>Descuento</label>
                            <Dropdown
                                value={form.discountName}
                                options={discountOptions}
                                onChange={(e) => setForm({ ...form, discountName: e.value })}
                                optionLabel="label"
                                optionValue="name"
                            />
                        </div>
                    </Dialog>
                    {/* EDIT DIALOG */}
                    <Dialog
                        visible={editDialog}
                        style={{ width: '620px' }}
                        header="Editar Producto"
                        modal
                        className="p-fluid"
                        footer={
                            <>
                                <Button label="Cancelar" icon="pi pi-times" text onClick={() => setEditDialog(false)} />
                                <Button label="Guardar" icon="pi pi-check" text onClick={saveEdit} />
                            </>
                        }
                        onHide={() => setEditDialog(false)}
                    >
                        {/* Descripción */}
                        <div className="field">
                            <label>Descripción *</label>
                            <InputText
                                value={editForm.nuevaDescripcion ?? ''}
                                onChange={(e) => setEditForm({ ...editForm, nuevaDescripcion: e.target.value })}
                                className={classNames({ 'p-invalid': reqEdit(!!(editForm.nuevaDescripcion ?? '').trim()) })}
                            />
                            {reqEdit(!!(editForm.nuevaDescripcion ?? '').trim()) && <small className="p-error">La descripción es obligatoria.</small>}
                        </div>

                        {/* URL Imagen */}
                        <div className="field">
                            <label>URL de la Imagen</label>
                            <InputText
                                value={editForm.nuevaRutaImagen ?? ''}
                                onChange={(e) => setEditForm({ ...editForm, nuevaRutaImagen: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>

                        {/* Tipo / Marca */}
                        <div className="formgrid grid">
                            <div className="field col">
                                <label>Tipo de Producto</label>
                                <Dropdown
                                    value={editForm.nuevoTipoProducto || null}
                                    options={types}
                                    onChange={(e) => setEditForm({ ...editForm, nuevoTipoProducto: e.value })}
                                    optionLabel="name"
                                    optionValue="name"
                                    placeholder="Seleccione uno"
                                />
                            </div>
                            <div className="field col">
                                <label>Marca</label>
                                <Dropdown
                                    value={editForm.nuevaMarcaProducto || null}
                                    options={brands}
                                    onChange={(e) => setEditForm({ ...editForm, nuevaMarcaProducto: e.value })}
                                    optionLabel="name"
                                    optionValue="name"
                                    placeholder="Seleccione una"
                                />
                            </div>
                        </div>

                        {/* Proveedor */}
                        <div className="field">
                            <label>Proveedor</label>
                            <Dropdown
                                value={editForm.nuevoNombreProveedor || null}
                                options={providers.map((p) => ({ label: p, value: p }))}
                                onChange={(e) => setEditForm({ ...editForm, nuevoNombreProveedor: e.value })}
                                placeholder="Seleccione uno"
                            />
                        </div>

                        {/* Precios */}
                        <div className="formgrid grid">
                            <div className="field col">
                                <label>Precio de Compra</label>
                                <InputNumber
                                    value={editForm.nuevoPrecioCompra ?? 0}
                                    onValueChange={(e) => setEditForm({ ...editForm, nuevoPrecioCompra: e.value ?? 0 })}
                                    mode="currency" currency="CRC" locale="es-CR"
                                />
                            </div>
                            <div className="field col">
                                <label>Precio de Venta *</label>
                                <InputNumber
                                    value={editForm.nuevoPrecioVenta ?? 0}
                                    onValueChange={(e) => setEditForm({ ...editForm, nuevoPrecioVenta: e.value ?? 0 })}
                                    mode="currency" currency="CRC" locale="es-CR"
                                    className={classNames({ 'p-invalid': reqEdit((editForm.nuevoPrecioVenta ?? 0) > 0) })}
                                />
                                {reqEdit((editForm.nuevoPrecioVenta ?? 0) > 0) && <small className="p-error">Debe ser mayor a 0.</small>}
                            </div>
                        </div>

                        {/* Descuento / Estado */}
                        <div className="formgrid grid">
                            <div className="field col">
                                <label>Descuento</label>
                                <Dropdown
                                    value={editForm.nuevoNombreDescuento}
                                    options={discountOptions}
                                    onChange={(e) => setEditForm({ ...editForm, nuevoNombreDescuento: e.value })}
                                    optionLabel="label"
                                    optionValue="name"
                                />
                            </div>
                            <div className="field col flex flex-column justify-content-center">
                                <label className="mb-2">Estado</label>
                                <div className="flex align-items-center gap-2">
                                    <InputSwitch
                                        checked={editForm.nuevoEstado ?? true}
                                        onChange={(e) => setEditForm({ ...editForm, nuevoEstado: e.value })}
                                    />
                                    <span>{editForm.nuevoEstado ? 'Activo' : 'Inactivo'}</span>
                                </div>
                            </div>
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}

export default AdminProductsPage
