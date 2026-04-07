'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Dropdown } from 'primereact/dropdown'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'
import { ProgressSpinner } from 'primereact/progressspinner'
import { AuthService, User } from '../../../service/AuthService'
import { EntregasService, Entrega } from '../../../service/EntregasService'

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

const MisEntregasPage = () => {
    const toast = useRef<Toast>(null)
    const [customer, setCustomer] = useState<User | null>(null)
    const [entregas, setEntregas] = useState<Entrega[]>([])
    const [loading, setLoading] = useState(true)
    const [receiving, setReceiving] = useState<string | null>(null)
    const [filtroEstado, setFiltroEstado] = useState('')

    useEffect(() => {
        const user = AuthService.getCurrentUser()
        setCustomer(user)
    }, [])

    const cargar = useCallback(async () => {
        if (!customer?.identification) return
        setLoading(true)
        try {
            const data = await EntregasService.listarEntregas({
                filtroCliente: customer.identification,
                filtroEstado: filtroEstado || undefined
            })
            setEntregas(data ?? [])
        } catch (err: unknown) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: err instanceof Error ? err.message : 'Error al cargar entregas', life: 4000 })
        } finally {
            setLoading(false)
        }
    }, [customer, filtroEstado])

    useEffect(() => {
        if (customer !== null) cargar()
    }, [customer, cargar])

    const handleMarcarRecibido = async (entrega: Entrega) => {
        setReceiving(entrega['Número Factura'])
        try {
            await EntregasService.actualizarEstadoEntrega({ numeroFactura: entrega['Número Factura'], enCamino: false, entregado: true })
            toast.current?.show({ severity: 'success', summary: '¡Entregado!', detail: `Factura ${entrega['Número Factura']} marcada como recibida`, life: 3000 })
            await cargar()
        } catch (err: unknown) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: err instanceof Error ? err.message : 'Error al actualizar entrega', life: 4000 })
        } finally {
            setReceiving(null)
        }
    }

    // ─── Column templates ────────────────────────────────────────────────────

    const estadoTemplate = (row: Entrega) => (
        <Tag value={row['Estado Entrega']} severity={estadoSeverity(row['Estado Entrega'])} />
    )

    const totalTemplate = (row: Entrega) => formatCurrency(row['Total Factura'])

    const accionesTemplate = (row: Entrega) => {
        if (row['Estado Entrega']?.trim().toLowerCase() !== 'en camino') return null
        return (
            <Button
                label="Marcar recibido"
                icon="pi pi-check"
                size="small"
                severity="success"
                loading={receiving === row['Número Factura']}
                onClick={() => handleMarcarRecibido(row)}
            />
        )
    }

    // ─── Render ──────────────────────────────────────────────────────────────

    const sinIdentificacion = customer !== null && !customer.identification

    return (
        <div className="card">
            <Toast ref={toast} />

            <div className="flex align-items-center justify-content-between mb-4">
                <div>
                    <h4 className="m-0 text-900 font-bold">Mis Entregas</h4>
                    <span className="text-500 text-sm">Estado de tus pedidos con entrega a domicilio</span>
                </div>
            </div>

            {sinIdentificacion ? (
                <Message
                    severity="warn"
                    className="w-full"
                    text="Para ver tus entregas debes completar tu número de identificación en tu perfil."
                />
            ) : (
                <>
                    {/* Filter */}
                    <div className="flex flex-wrap gap-3 mb-4">
                        <Dropdown
                            value={filtroEstado}
                            options={ESTADO_OPTIONS}
                            onChange={(e) => setFiltroEstado(e.value)}
                            placeholder="Estado"
                            style={{ minWidth: '160px' }}
                        />
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
                            rows={10}
                            emptyMessage="No tienes entregas registradas."
                            className="p-datatable-sm"
                            stripedRows
                        >
                            <Column field="Número Factura" header="Factura" sortable style={{ minWidth: '180px' }} />
                            <Column field="Fecha Factura" header="Fecha Factura" sortable style={{ minWidth: '160px' }} />
                            <Column field="Fecha Entrega" header="Fecha Entrega" sortable style={{ minWidth: '130px' }} />
                            <Column field="Tiempo Restante" header="Tiempo" style={{ minWidth: '120px' }} />
                            <Column header="Total" body={totalTemplate} sortable sortField="Total Factura" style={{ minWidth: '130px' }} />
                            <Column field="Dirección Entrega" header="Dirección" style={{ minWidth: '200px' }} />
                            <Column header="Estado" body={estadoTemplate} sortable sortField="Estado Entrega" style={{ minWidth: '130px' }} />
                            <Column header="Acciones" body={accionesTemplate} style={{ minWidth: '160px' }} />
                        </DataTable>
                    )}
                </>
            )}
        </div>
    )
}

export default MisEntregasPage
