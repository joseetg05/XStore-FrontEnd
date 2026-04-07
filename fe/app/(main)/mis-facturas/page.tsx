'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'
import { Factura, FacturasListService } from '../../../service/FacturasListService'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (v: number) => (v ?? 0).toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })

type Severity = 'warning' | 'info' | 'success'

function estadoSeverity(estado: string | null): Severity {
    const s = estado?.trim().toLowerCase()
    if (s === 'en camino') return 'info'
    if (s === 'entregado') return 'success'
    return 'warning'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const MisFacturasPage = () => {
    const toast = useRef<Toast>(null)
    const [facturas, setFacturas] = useState<Factura[]>([])
    const [loading, setLoading] = useState(true)
    const [filtroNumero, setFiltroNumero] = useState('')

    const cargar = useCallback(async () => {
        setLoading(true)
        try {
            const data = await FacturasListService.listarFacturas({
                filtroNumero: filtroNumero || undefined
            })
            setFacturas(data ?? [])
        } catch (err: unknown) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: err instanceof Error ? err.message : 'Error al cargar facturas', life: 4000 })
        } finally {
            setLoading(false)
        }
    }, [filtroNumero])

    useEffect(() => { cargar() }, [cargar])

    // ─── Column templates ────────────────────────────────────────────────────

    const montoTemplate = (field: keyof Factura) => (row: Factura) => formatCurrency(row[field] as number)

    const entregaTemplate = (row: Factura) => {
        if (row['Con Entrega'] !== 'Sí') return <span className="text-500 text-sm">No</span>
        return (
            <div className="flex flex-column gap-1">
                <Tag value={row['Estado Entrega'] ?? '—'} severity={estadoSeverity(row['Estado Entrega'])} />
                {row['Fecha Entrega'] && <span className="text-xs text-500">{row['Fecha Entrega']}</span>}
            </div>
        )
    }

    return (
        <div className="card">
            <Toast ref={toast} />

            <div className="flex align-items-center justify-content-between mb-4">
                <div>
                    <h4 className="m-0 text-900 font-bold">Mis Facturas</h4>
                    <span className="text-500 text-sm">Historial de tus compras</span>
                </div>
            </div>

            {/* Filter */}
            <div className="flex flex-wrap gap-3 mb-4">
                <span className="p-input-icon-left">
                    <i className="pi pi-hashtag" />
                    <InputText
                        value={filtroNumero}
                        onChange={(e) => setFiltroNumero(e.target.value)}
                        placeholder="Nº de factura..."
                        style={{ minWidth: '220px' }}
                    />
                </span>
                <Button icon="pi pi-refresh" text rounded tooltip="Recargar" onClick={cargar} loading={loading} />
            </div>

            {loading && facturas.length === 0 ? (
                <div className="flex justify-content-center py-6">
                    <ProgressSpinner style={{ width: '40px', height: '40px' }} strokeWidth="4" />
                </div>
            ) : (
                <DataTable
                    value={facturas}
                    paginator
                    rows={10}
                    emptyMessage="No tienes facturas registradas."
                    className="p-datatable-sm"
                    stripedRows
                    scrollable
                >
                    <Column field="Número Factura" header="Nº Factura" sortable style={{ minWidth: '185px' }} />
                    <Column field="Fecha y Hora" header="Fecha y Hora" sortable style={{ minWidth: '160px' }} />
                    <Column field="Tipo Cliente" header="Tipo Cliente" style={{ minWidth: '130px' }} />
                    <Column header="Subtotal" body={montoTemplate('Subtotal')} sortable sortField="Subtotal" style={{ minWidth: '130px' }} />
                    <Column header="Descuento" body={montoTemplate('Descuento Total')} style={{ minWidth: '130px' }} />
                    <Column field="IVA %" header="IVA %" style={{ minWidth: '80px' }} />
                    <Column header="IVA" body={montoTemplate('IVA')} style={{ minWidth: '120px' }} />
                    <Column header="Total" body={montoTemplate('Total')} sortable sortField="Total" style={{ minWidth: '130px' }} />
                    <Column header="Entrega" body={entregaTemplate} style={{ minWidth: '140px' }} />
                </DataTable>
            )}
        </div>
    )
}

export default MisFacturasPage
