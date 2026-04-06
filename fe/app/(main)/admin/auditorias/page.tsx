'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { Calendar } from 'primereact/calendar'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'

import { AuditEntry, AuditService } from '@/service/AuditService'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toISODateTime = (d: Date | null): string => (d ? `${d.toISOString().split('T')[0]}T00:00:00` : '')

const formatDateTime = (value: string) => {
    if (!value) return '—'
    const normalized = value.endsWith('Z') || value.includes('+') ? value : `${value}Z`
    const d = new Date(normalized)
    if (isNaN(d.getTime())) return value
    return d.toLocaleString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'America/Costa_Rica' })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const AuditPage = () => {
    const toast = useRef<Toast>(null)
    const [entries, setEntries] = useState<AuditEntry[]>([])
    const [loading, setLoading] = useState(false)
    const [fechaDate, setFechaDate] = useState<Date | null>(null)
    const [tablaFiltro, setTablaFiltro] = useState('')

    const loadData = async (fecha: Date | null = fechaDate, tabla = tablaFiltro) => {
        setLoading(true)
        const result = await AuditService.getAll({
            fechaFiltro: toISODateTime(fecha) || undefined,
            tablaFiltro: tabla || undefined
        })
        setEntries(result)
        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleSearch = () => loadData()

    const handleClear = () => {
        setFechaDate(null)
        setTablaFiltro('')
        loadData(null, '')
    }

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Consulta de Auditorías</h5>
        </div>
    )

    return (
        <div className="grid">
            <Toast ref={toast} />

            {/* Filtros */}
            <div className="col-12">
                <div className="card">
                    <div className="flex align-items-center gap-2 mb-4">
                        <i className="pi pi-filter text-primary" style={{ fontSize: '1.1rem' }} />
                        <h5 className="m-0">Filtros</h5>
                    </div>
                    <div className="formgrid grid">
                        <div className="field col-12 md:col-6">
                            <label className="font-medium text-700 text-sm block mb-2">Fecha</label>
                            <Calendar
                                value={fechaDate}
                                onChange={(e) => setFechaDate(e.value as Date | null)}
                                dateFormat="dd/mm/yy"
                                placeholder="Seleccionar fecha"
                                showIcon
                                className="w-full"
                            />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label className="font-medium text-700 text-sm block mb-2">Tabla Afectada</label>
                            <InputText
                                value={tablaFiltro}
                                onChange={(e) => setTablaFiltro(e.target.value)}
                                placeholder="Ej: ROLES, PERSONAS"
                                className="w-full"
                            />
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
                        value={entries}
                        paginator
                        rows={15}
                        rowsPerPageOptions={[10, 15, 25, 50]}
                        loading={loading}
                        header={header}
                        emptyMessage="No se encontraron registros de auditoría."
                        dataKey="dateTime"
                        stripedRows
                        className="p-datatable-sm"
                    >
                        <Column field="dateTime" header="Fecha y Hora" sortable style={{ minWidth: '190px' }} body={(row: AuditEntry) => formatDateTime(row.dateTime)} />
                        <Column field="username" header="Responsable" sortable style={{ minWidth: '160px' }} />
                        <Column field="operationType" header="Acción" sortable style={{ minWidth: '110px' }} />
                        <Column field="affectedTable" header="Tabla Afectada" sortable style={{ minWidth: '170px' }} />
                        <Column field="affectedRow" header="Fila" sortable style={{ minWidth: '80px' }} />
                        <Column field="description" header="Descripción" style={{ minWidth: '260px' }} />
                        <Column field="before" header="Antes" style={{ minWidth: '160px' }} />
                        <Column field="after" header="Después" style={{ minWidth: '160px' }} />
                    </DataTable>
                </div>
            </div>
        </div>
    )
}

export default AuditPage
