'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'
import { ProgressSpinner } from 'primereact/progressspinner'
import { EntregasService, Entrega } from '../../../../service/EntregasService'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (v: number) => (v ?? 0).toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })

const ESTADO_OPTIONS = [
    { label: 'Todos', value: '' },
    { label: 'En Sucursal', value: 'En Sucursal' },
    { label: 'En camino', value: 'En camino' },
    { label: 'Entregado', value: 'Entregado' }
]

type EstadoSeverity = 'warning' | 'info' | 'success'

function estadoSeverity(estado: string): EstadoSeverity {
    const s = estado?.trim().toLowerCase()
    if (s === 'en camino') return 'info'
    if (s === 'entregado') return 'success'
    return 'warning'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const EntregasAdminPage = () => {
    const toast = useRef<Toast>(null)
    const [entregas, setEntregas] = useState<Entrega[]>([])
    const [loading, setLoading] = useState(true)
    const [dispatching, setDispatching] = useState<string | null>(null)

    // Filters
    const [filtroEstado, setFiltroEstado] = useState('')
    const [filtroCliente, setFiltroCliente] = useState('')

    const cargar = useCallback(async () => {
        setLoading(true)
        try {
            const data = await EntregasService.listarEntregas({
                filtroEstado: filtroEstado || undefined,
                filtroCliente: filtroCliente || undefined
            })
            setEntregas(data ?? [])
        } catch (err: unknown) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: err instanceof Error ? err.message : 'Error al cargar entregas', life: 4000 })
        } finally {
            setLoading(false)
        }
    }, [filtroEstado, filtroCliente])

    useEffect(() => { cargar() }, [cargar])

    const handleDespachar = async (entrega: Entrega) => {
        setDispatching(entrega['Número Factura'])
        try {
            await EntregasService.actualizarEstadoEntrega({ numeroFactura: entrega['Número Factura'], enCamino: true, entregado: false })
            toast.current?.show({ severity: 'success', summary: 'Despachado', detail: `Factura ${entrega['Número Factura']} marcada como En camino`, life: 3000 })
            await cargar()
        } catch (err: unknown) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: err instanceof Error ? err.message : 'Error al despachar', life: 4000 })
        } finally {
            setDispatching(null)
        }
    }

    // ─── Column templates ────────────────────────────────────────────────────

    const estadoTemplate = (row: Entrega) => (
        <Tag value={row['Estado Entrega']} severity={estadoSeverity(row['Estado Entrega'])} />
    )

    const totalTemplate = (row: Entrega) => formatCurrency(row['Total Factura'])

    const accionesTemplate = (row: Entrega) => {
        if (row['Estado Entrega']?.trim().toLowerCase() !== 'en sucursal') return null
        return (
            <Button
                label="Despachar"
                icon="pi pi-send"
                size="small"
                severity="info"
                loading={dispatching === row['Número Factura']}
                onClick={() => handleDespachar(row)}
            />
        )
    }

    return (
        <div className="card">
            <Toast ref={toast} />

            <div className="flex align-items-center justify-content-between mb-4">
                <div>
                    <h4 className="m-0 text-900 font-bold">Entregas</h4>
                    <span className="text-500 text-sm">Gestión de despacho de pedidos</span>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
                <Dropdown
                    value={filtroEstado}
                    options={ESTADO_OPTIONS}
                    onChange={(e) => setFiltroEstado(e.value)}
                    placeholder="Estado"
                    style={{ minWidth: '160px' }}
                />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        value={filtroCliente}
                        onChange={(e) => setFiltroCliente(e.target.value)}
                        placeholder="Buscar cliente..."
                        style={{ minWidth: '220px' }}
                    />
                </span>
                <Button icon="pi pi-refresh" text rounded tooltip="Recargar" onClick={cargar} loading={loading} />
            </div>

            {loading && entregas.length === 0 ? (
                <div className="flex justify-content-center py-6">
                    <ProgressSpinner style={{ width: '40px', height: '40px' }} strokeWidth="4" />
                </div>
            ) : (
                <DataTable
                    value={entregas}
                    paginator
                    rows={15}
                    emptyMessage="No hay entregas registradas."
                    className="p-datatable-sm"
                    stripedRows
                >
                    <Column field="Número Factura" header="Factura" sortable style={{ minWidth: '180px' }} />
                    <Column field="Cliente" header="Cliente" sortable style={{ minWidth: '160px' }} />
                    <Column field="Identificación" header="Identificación" style={{ minWidth: '130px' }} />
                    <Column field="Fecha Factura" header="Fecha Factura" sortable style={{ minWidth: '160px' }} />
                    <Column field="Fecha Entrega" header="Fecha Entrega" sortable style={{ minWidth: '130px' }} />
                    <Column field="Tiempo Restante" header="Tiempo" style={{ minWidth: '120px' }} />
                    <Column header="Total" body={totalTemplate} sortable sortField="Total Factura" style={{ minWidth: '130px' }} />
                    <Column field="Dirección Entrega" header="Dirección" style={{ minWidth: '200px' }} />
                    <Column header="Estado" body={estadoTemplate} sortable sortField="Estado Entrega" style={{ minWidth: '130px' }} />
                    <Column header="Acciones" body={accionesTemplate} style={{ minWidth: '130px' }} />
                </DataTable>
            )}
        </div>
    )
}

export default EntregasAdminPage
