'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'

import { InventoryEntry, InventoryService } from '@/service/InventoryService'
import { ProductService } from '@/service/ProductService'

type AdjustMode = 'ingreso' | 'salida'

const AdminInventoryPage = () => {
    const toast = useRef<Toast>(null)
    const [items, setItems] = useState<InventoryEntry[]>([])
    const [loading, setLoading] = useState(false)

    const [filtroUbicacion, setFiltroUbicacion] = useState('')
    const [filtroProducto, setFiltroProducto] = useState('')

    const [adjustDialog, setAdjustDialog] = useState(false)
    const [selectedEntry, setSelectedEntry] = useState<InventoryEntry | null>(null)
    const [mode, setMode] = useState<AdjustMode>('ingreso')
    const [cantidad, setCantidad] = useState<number>(1)
    const [saving, setSaving] = useState(false)

    const loadData = async (ubicacion = filtroUbicacion, producto = filtroProducto) => {
        setLoading(true)
        const data = await InventoryService.getAll({
            filtroUbicacion: ubicacion || undefined,
            filtroProducto: producto || undefined
        })
        setItems(data)
        setLoading(false)
    }

    useEffect(() => { loadData() }, [])

    const handleSearch = () => loadData()
    const handleClear = () => {
        setFiltroUbicacion('')
        setFiltroProducto('')
        loadData('', '')
    }

    // ─── Estadísticas rápidas ───────────────────────────────────────────────────

    const lowStockCount = items.filter((i) => i.stock <= i.minStock).length
    const totalStock = items.reduce((acc, i) => acc + i.stock, 0)

    // ─── Ajuste ─────────────────────────────────────────────────────────────────

    const openAdjust = (entry: InventoryEntry) => {
        setSelectedEntry(entry)
        setMode('ingreso')
        setCantidad(1)
        setAdjustDialog(true)
    }

    const hideAdjustDialog = () => {
        setAdjustDialog(false)
        setSelectedEntry(null)
    }

    const saveAdjust = async () => {
        if (!selectedEntry || cantidad <= 0) return
        setSaving(true)
        const ajuste = mode === 'ingreso' ? cantidad : -cantidad
        const result = await ProductService.adjustStock(selectedEntry.description, ajuste, selectedEntry.location)
        setSaving(false)

        if (result.success) {
            toast.current?.show({ severity: 'success', summary: 'Éxito', detail: `Stock ${mode === 'ingreso' ? 'ingresado' : 'descontado'} correctamente`, life: 3000 })
            setAdjustDialog(false)
            loadData()
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error, life: 3000 })
        }
    }

    // ─── Column templates ───────────────────────────────────────────────────────

    const stockBodyTemplate = (row: InventoryEntry) => {
        const isLow = row.stock <= row.minStock
        return (
            <span className={`font-bold ${isLow ? 'text-red-500' : 'text-green-600'}`}>
                {row.stock}
            </span>
        )
    }

    const alertBodyTemplate = (row: InventoryEntry) => {
        const isLow = row.stock <= row.minStock
        return <Tag severity={isLow ? 'danger' : 'success'} icon={isLow ? 'pi pi-exclamation-triangle' : 'pi pi-check'} value={isLow ? 'Stock bajo' : 'OK'} />
    }

    const statusBodyTemplate = (row: InventoryEntry) => (
        <Tag severity={row.status ? 'success' : 'secondary'} value={row.status ? 'Activo' : 'Inactivo'} />
    )

    const actionBodyTemplate = (row: InventoryEntry) => (
        <Button
            label="Ajustar"
            icon="pi pi-arrow-right-arrow-left"
            size="small"
            severity="info"
            outlined
            onClick={() => openAdjust(row)}
        />
    )

    const stockResultado = selectedEntry
        ? mode === 'ingreso'
            ? selectedEntry.stock + cantidad
            : selectedEntry.stock - cantidad
        : 0

    // ─── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="grid">
            <Toast ref={toast} />

            {/* Estadísticas */}
            <div className="col-12 md:col-4">
                <div className="card h-full" style={{ borderLeft: '4px solid var(--primary-color)' }}>
                    <div className="flex align-items-center gap-3">
                        <div className="flex align-items-center justify-content-center border-circle bg-primary" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                            <i className="pi pi-box text-white" style={{ fontSize: '1.3rem' }} />
                        </div>
                        <div>
                            <div className="text-500 text-sm font-medium">Total de productos</div>
                            <div className="text-900 font-bold text-2xl">{items.length}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12 md:col-4">
                <div className="card h-full" style={{ borderLeft: '4px solid var(--green-500)' }}>
                    <div className="flex align-items-center gap-3">
                        <div className="flex align-items-center justify-content-center border-circle" style={{ width: '48px', height: '48px', flexShrink: 0, background: 'var(--green-500)' }}>
                            <i className="pi pi-database text-white" style={{ fontSize: '1.3rem' }} />
                        </div>
                        <div>
                            <div className="text-500 text-sm font-medium">Unidades en stock</div>
                            <div className="text-900 font-bold text-2xl">{totalStock.toLocaleString('es-CR')}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12 md:col-4">
                <div className="card h-full" style={{ borderLeft: `4px solid ${lowStockCount > 0 ? 'var(--red-500)' : 'var(--green-500)'}` }}>
                    <div className="flex align-items-center gap-3">
                        <div className="flex align-items-center justify-content-center border-circle" style={{ width: '48px', height: '48px', flexShrink: 0, background: lowStockCount > 0 ? 'var(--red-500)' : 'var(--green-500)' }}>
                            <i className={`pi ${lowStockCount > 0 ? 'pi-exclamation-triangle' : 'pi-check-circle'} text-white`} style={{ fontSize: '1.3rem' }} />
                        </div>
                        <div>
                            <div className="text-500 text-sm font-medium">Alertas de stock bajo</div>
                            <div className="font-bold text-2xl" style={{ color: lowStockCount > 0 ? 'var(--red-500)' : 'var(--green-500)' }}>{lowStockCount}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="col-12">
                <div className="card">
                    <div className="flex align-items-center gap-2 mb-4">
                        <i className="pi pi-filter text-primary" style={{ fontSize: '1.1rem' }} />
                        <h5 className="m-0">Filtros</h5>
                    </div>
                    <div className="formgrid grid">
                        <div className="field col-12 md:col-6">
                            <label className="font-medium text-700 text-sm block mb-2">Ubicación</label>
                            <InputText value={filtroUbicacion} onChange={(e) => setFiltroUbicacion(e.target.value)} placeholder="Nombre de ubicación" className="w-full"
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="font-medium text-700 text-sm block mb-2">Producto</label>
                            <InputText value={filtroProducto} onChange={(e) => setFiltroProducto(e.target.value)} placeholder="Descripción del producto" className="w-full"
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                        </div>
                        <div className="col-12 flex justify-content-end gap-2 mt-2">
                            <Button label="Limpiar" icon="pi pi-times" severity="secondary" outlined onClick={handleClear} />
                            <Button label="Buscar" icon="pi pi-search" onClick={handleSearch} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="col-12">
                <div className="card">
                    <DataTable
                        value={items}
                        paginator
                        rows={15}
                        rowsPerPageOptions={[10, 15, 25, 50]}
                        loading={loading}
                        header={
                            <div className="flex align-items-center justify-content-between">
                                <h5 className="m-0">Registros de Inventario</h5>
                                <span className="text-500 text-sm">{items.length} resultado{items.length !== 1 ? 's' : ''}</span>
                            </div>
                        }
                        emptyMessage="No se encontraron registros de inventario."
                        stripedRows
                        className="p-datatable-sm"
                    >
                        <Column field="description" header="Producto" sortable style={{ minWidth: '220px' }} />
                        <Column field="location" header="Ubicación" sortable style={{ minWidth: '130px' }} />
                        <Column field="stock" header="Stock Actual" sortable body={stockBodyTemplate} style={{ minWidth: '120px' }} />
                        <Column field="minStock" header="Stock Mínimo" sortable style={{ minWidth: '130px' }} />
                        <Column header="Alerta" body={alertBodyTemplate} style={{ minWidth: '120px' }} />
                        <Column header="Estado" body={statusBodyTemplate} style={{ minWidth: '100px' }} />
                        <Column header="" body={actionBodyTemplate} style={{ minWidth: '110px' }} />
                    </DataTable>
                </div>
            </div>

            {/* Dialog ajuste de stock */}
            <Dialog
                visible={adjustDialog}
                style={{ width: '460px' }}
                header="Ajuste de Stock"
                modal
                onHide={hideAdjustDialog}
                footer={
                    <>
                        <Button label="Cancelar" icon="pi pi-times" text onClick={hideAdjustDialog} />
                        <Button
                            label={mode === 'ingreso' ? 'Ingresar' : 'Descontar'}
                            icon={mode === 'ingreso' ? 'pi pi-plus' : 'pi pi-minus'}
                            severity={mode === 'ingreso' ? 'success' : 'danger'}
                            loading={saving}
                            onClick={saveAdjust}
                            disabled={cantidad <= 0}
                        />
                    </>
                }
            >
                {selectedEntry && (
                    <div className="flex flex-column gap-4 pt-2">

                        {/* Info del producto */}
                        <div className="border-round p-3" style={{ background: 'var(--surface-50)' }}>
                            <div className="font-bold text-900 mb-1">{selectedEntry.description}</div>
                            <div className="flex gap-4 text-sm text-600">
                                <span><i className="pi pi-map-marker mr-1" />{selectedEntry.location}</span>
                                <span><i className="pi pi-box mr-1" />Stock actual: <strong className="text-900">{selectedEntry.stock}</strong></span>
                                <span>Mínimo: <strong className="text-900">{selectedEntry.minStock}</strong></span>
                            </div>
                        </div>

                        {/* Selector de modo */}
                        <div>
                            <label className="font-medium text-700 text-sm block mb-2">Tipo de movimiento</label>
                            <div className="flex gap-2">
                                <Button
                                    label="Ingreso"
                                    icon="pi pi-plus-circle"
                                    className="flex-1"
                                    severity="success"
                                    outlined={mode !== 'ingreso'}
                                    onClick={() => setMode('ingreso')}
                                />
                                <Button
                                    label="Salida"
                                    icon="pi pi-minus-circle"
                                    className="flex-1"
                                    severity="danger"
                                    outlined={mode !== 'salida'}
                                    onClick={() => setMode('salida')}
                                />
                            </div>
                        </div>

                        {/* Cantidad */}
                        <div className="field mb-0">
                            <label className="font-medium text-700 text-sm block mb-2">Cantidad</label>
                            <InputNumber
                                value={cantidad}
                                onValueChange={(e) => setCantidad(Math.max(1, e.value ?? 1))}
                                min={1}
                                showButtons
                                buttonLayout="horizontal"
                                decrementButtonClassName="p-button-secondary"
                                incrementButtonClassName={mode === 'ingreso' ? 'p-button-success' : 'p-button-danger'}
                                incrementButtonIcon="pi pi-plus"
                                decrementButtonIcon="pi pi-minus"
                                className="w-full"
                                inputClassName="text-center font-bold text-xl"
                            />
                        </div>

                        {/* Vista previa */}
                        <div className="border-round p-3 flex align-items-center justify-content-between"
                            style={{ background: mode === 'ingreso' ? 'var(--green-50)' : 'var(--red-50)', border: `1px solid ${mode === 'ingreso' ? 'var(--green-200)' : 'var(--red-200)'}` }}>
                            <div className="text-center flex-1">
                                <div className="text-500 text-xs mb-1">Actual</div>
                                <div className="font-bold text-2xl text-900">{selectedEntry.stock}</div>
                            </div>
                            <i className={`pi ${mode === 'ingreso' ? 'pi-arrow-right text-green-500' : 'pi-arrow-right text-red-500'} text-xl mx-3`} />
                            <div className="text-center flex-1">
                                <div className="text-500 text-xs mb-1">Resultado</div>
                                <div className={`font-bold text-2xl ${stockResultado < selectedEntry.minStock ? 'text-red-500' : mode === 'ingreso' ? 'text-green-600' : 'text-orange-500'}`}>
                                    {stockResultado}
                                </div>
                            </div>
                            <div className="text-center flex-1">
                                <div className="text-500 text-xs mb-1">Movimiento</div>
                                <div className={`font-bold text-lg ${mode === 'ingreso' ? 'text-green-600' : 'text-red-500'}`}>
                                    {mode === 'ingreso' ? '+' : '-'}{cantidad}
                                </div>
                            </div>
                        </div>

                        {stockResultado < selectedEntry.minStock && (
                            <div className="flex align-items-center gap-2 p-2 border-round" style={{ background: 'var(--yellow-50)', border: '1px solid var(--yellow-300)' }}>
                                <i className="pi pi-exclamation-triangle text-yellow-600" />
                                <span className="text-yellow-700 text-sm">El stock resultante quedará por debajo del mínimo establecido.</span>
                            </div>
                        )}
                    </div>
                )}
            </Dialog>
        </div>
    )
}

export default AdminInventoryPage
