'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { Chart } from 'primereact/chart'
import { Divider } from 'primereact/divider'
import { SelectButton } from 'primereact/selectbutton'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'

import {
    ReportService,
    RptBestSeller,
    RptClienteInactivo,
    RptDesempenoMarca,
    RptEntregaPendiente,
    RptIngresoPeriodico,
    RptMargenUtilidad,
    RptProductoSinMovimiento,
    RptStockCritico,
    RptValorizacionInventario,
    RptVentaCategoriaCliente
} from '@/service/ReportService'

// ─── Palette ──────────────────────────────────────────────────────────────────

const COLORS = [
    'rgba(99,102,241,0.75)',
    'rgba(16,185,129,0.75)',
    'rgba(245,158,11,0.75)',
    'rgba(239,68,68,0.75)',
    'rgba(59,130,246,0.75)',
    'rgba(168,85,247,0.75)',
    'rgba(236,72,153,0.75)',
    'rgba(20,184,166,0.75)',
    'rgba(251,146,60,0.75)',
    'rgba(132,204,22,0.75)'
]
const BORDERS = COLORS.map((c) => c.replace('0.75', '1'))

const crColones = (v: number) => `₡${v.toLocaleString('es-CR', { maximumFractionDigits: 0 })}`

// ─── Section Card ─────────────────────────────────────────────────────────────

interface SectionProps {
    title: string
    icon: string
    loading: boolean
    empty: boolean
    onRefresh: () => void
    children: React.ReactNode
    colClass?: string
}

const Section = ({ title, icon, loading, empty, onRefresh, children, colClass = 'col-12 lg:col-6' }: SectionProps) => (
    <div className={colClass}>
        <div className="card h-full">
            <div className="flex align-items-center justify-content-between mb-3">
                <div className="flex align-items-center gap-2">
                    <i className={`${icon} text-primary`} style={{ fontSize: '1.1rem' }} />
                    <h5 className="m-0 text-900">{title}</h5>
                </div>
                <Button icon="pi pi-refresh" text rounded size="small" onClick={onRefresh} disabled={loading} />
            </div>
            <Divider className="mt-0 mb-3" />
            {loading ? (
                <div className="flex justify-content-center align-items-center" style={{ height: '320px' }}>
                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem', color: 'var(--primary-color)' }} />
                </div>
            ) : empty ? (
                <div className="flex flex-column justify-content-center align-items-center gap-2" style={{ height: '320px' }}>
                    <i className="pi pi-chart-bar" style={{ fontSize: '2rem', color: 'var(--text-color-secondary)' }} />
                    <span className="text-color-secondary text-sm">Sin datos disponibles</span>
                </div>
            ) : (
                children
            )}
        </div>
    </div>
)

// ─── Page ─────────────────────────────────────────────────────────────────────

const ReportesPage = () => {
    const toast = useRef<Toast>(null)

    const [categoriaCliente, setCategoriaCliente] = useState<RptVentaCategoriaCliente[]>([])
    const [ingresosPeriodicos, setIngresosPeriodicos] = useState<RptIngresoPeriodico[]>([])
    const [bestSellers, setBestSellers] = useState<RptBestSeller[]>([])
    const [margenUtilidad, setMargenUtilidad] = useState<RptMargenUtilidad[]>([])
    const [desempenoMarca, setDesempenoMarca] = useState<RptDesempenoMarca[]>([])
    const [stockCritico, setStockCritico] = useState<RptStockCritico[]>([])
    const [valorizacion, setValorizacion] = useState<RptValorizacionInventario[]>([])
    const [sinMovimiento, setSinMovimiento] = useState<RptProductoSinMovimiento[]>([])
    const [clientesInactivos, setClientesInactivos] = useState<RptClienteInactivo[]>([])
    const [entregas, setEntregas] = useState<RptEntregaPendiente[]>([])

    const [periodo, setPeriodo] = useState<'DIA' | 'SEMANA' | 'MES'>('MES')

    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({
        categoriaCliente: true, ingresosPeriodicos: true, bestSellers: true,
        margenUtilidad: true, desempenoMarca: true, stockCritico: true,
        valorizacion: true, sinMovimiento: true, clientesInactivos: true, entregas: true
    })

    const setLoading = (key: string, val: boolean) =>
        setLoadingMap((prev) => ({ ...prev, [key]: val }))

    const fetchWith = useCallback(async <T,>(key: string, fn: () => Promise<T>, setter: (d: T) => void) => {
        setLoading(key, true)
        try {
            setter(await fn())
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: `No se pudo cargar: ${key}`, life: 3000 })
        } finally {
            setLoading(key, false)
        }
    }, [])

    const loadAll = useCallback(() => {
        fetchWith('categoriaCliente', ReportService.getVentasCategoriaCliente, setCategoriaCliente)
        fetchWith('ingresosPeriodicos', () => ReportService.getIngresosPeriodicos(periodo), setIngresosPeriodicos)
        fetchWith('bestSellers', () => ReportService.getBestSellers(10, 'UNIDADES'), setBestSellers)
        fetchWith('margenUtilidad', ReportService.getMargenUtilidad, setMargenUtilidad)
        fetchWith('desempenoMarca', ReportService.getDesempenoMarca, setDesempenoMarca)
        fetchWith('stockCritico', ReportService.getStockCritico, setStockCritico)
        fetchWith('valorizacion', ReportService.getValorizacionInventario, setValorizacion)
        fetchWith('sinMovimiento', ReportService.getProductosSinMovimiento, setSinMovimiento)
        fetchWith('clientesInactivos', ReportService.getClientesInactivos, setClientesInactivos)
        fetchWith('entregas', ReportService.getEntregasPendientes, setEntregas)
    }, [fetchWith, periodo])

    useEffect(() => { loadAll() }, [loadAll])

    const changePeriodo = (p: 'DIA' | 'SEMANA' | 'MES') => {
        setPeriodo(p)
        fetchWith('ingresosPeriodicos', () => ReportService.getIngresosPeriodicos(p), setIngresosPeriodicos)
    }

    // ── Chart data (PascalCase field access) ──────────────────────────────────

    // 1. Ventas por categoría — Pie
    const categoriaClienteChart = {
        labels: categoriaCliente.map((d) => d.CategoriaCliente),
        datasets: [{
            data: categoriaCliente.map((d) => d.TotalIngresos),
            backgroundColor: COLORS.slice(0, categoriaCliente.length),
            borderColor: BORDERS.slice(0, categoriaCliente.length),
            borderWidth: 1
        }]
    }

    // 2. Ingresos periódicos — Line
    const ingresosPeriodicosChart = {
        labels: ingresosPeriodicos.map((d) => d.Periodo),
        datasets: [
            {
                label: 'Total Ingresos',
                data: ingresosPeriodicos.map((d) => d.TotalIngresos),
                borderColor: BORDERS[0],
                backgroundColor: COLORS[0],
                tension: 0.3,
                fill: false,
                pointRadius: 4
            },
            {
                label: 'Descuentos',
                data: ingresosPeriodicos.map((d) => d.DescuentosAplicados),
                borderColor: BORDERS[3],
                backgroundColor: COLORS[3],
                tension: 0.3,
                fill: false,
                pointRadius: 4
            }
        ]
    }

    // 3. Best sellers — Bar horizontal
    const bestSellersChart = {
        labels: bestSellers.map((d) => d.Producto),
        datasets: [{
            data: bestSellers.map((d) => d.UnidadesVendidas),
            backgroundColor: COLORS[0],
            borderColor: BORDERS[0],
            borderWidth: 1
        }]
    }

    // 4. Margen de utilidad — Bar agrupado top 10 por UtilidadTotal
    const topMargen = [...margenUtilidad].sort((a, b) => b.UtilidadTotal - a.UtilidadTotal).slice(0, 10)
    const margenChart = {
        labels: topMargen.map((d) => d.Producto),
        datasets: [
            { label: 'Precio Compra', data: topMargen.map((d) => d.PrecioCompra), backgroundColor: COLORS[3], borderColor: BORDERS[3], borderWidth: 1 },
            { label: 'Precio Venta Lista', data: topMargen.map((d) => d.PrecioVentaLista), backgroundColor: COLORS[1], borderColor: BORDERS[1], borderWidth: 1 },
            { label: 'Precio Efectivo', data: topMargen.map((d) => d.PrecioEfectivoPromedio), backgroundColor: COLORS[0], borderColor: BORDERS[0], borderWidth: 1 }
        ]
    }

    // 5. Desempeño marca — Bar
    const marcaChart = {
        labels: desempenoMarca.map((d) => d.Marca),
        datasets: [{
            data: desempenoMarca.map((d) => d.IngresosNetos),
            backgroundColor: COLORS.slice(0, desempenoMarca.length),
            borderColor: BORDERS.slice(0, desempenoMarca.length),
            borderWidth: 1
        }]
    }

    // 6. Stock crítico — Bar horizontal
    const stockCriticoChart = {
        labels: stockCritico.map((d) => `${d.Producto} (${d.Ubicacion})`),
        datasets: [{
            data: stockCritico.map((d) => d.UnidadesFaltantes),
            backgroundColor: COLORS[3],
            borderColor: BORDERS[3],
            borderWidth: 1
        }]
    }

    // 7. Valorización inventario — Bar agrupado top 10 por ValorVenta
    const topVal = [...valorizacion].sort((a, b) => b.ValorVenta - a.ValorVenta).slice(0, 10)
    const valorizacionChart = {
        labels: topVal.map((d) => d.Producto),
        datasets: [
            { label: 'Valor Costo', data: topVal.map((d) => d.ValorCosto), backgroundColor: COLORS[2], borderColor: BORDERS[2], borderWidth: 1 },
            { label: 'Valor Venta', data: topVal.map((d) => d.ValorVenta), backgroundColor: COLORS[1], borderColor: BORDERS[1], borderWidth: 1 }
        ]
    }

    // 8. Productos sin movimiento — Bar horizontal (más días inactivos, null = 0)
    const topInactivos = [...sinMovimiento].sort((a, b) => (b.DiasInactivo ?? 0) - (a.DiasInactivo ?? 0)).slice(0, 10)
    const sinMovimientoChart = {
        labels: topInactivos.map((d) => d.Producto),
        datasets: [{
            data: topInactivos.map((d) => d.DiasInactivo ?? 0),
            backgroundColor: COLORS[2],
            borderColor: BORDERS[2],
            borderWidth: 1
        }]
    }

    // 9. Clientes inactivos — Bar horizontal (más días sin comprar, null = 0)
    const topClientesInactivos = [...clientesInactivos].sort((a, b) => (b.DiasDesdeUltimaCompra ?? 0) - (a.DiasDesdeUltimaCompra ?? 0)).slice(0, 10)
    const clientesInactivosChart = {
        labels: topClientesInactivos.map((d) => d.NombreCliente),
        datasets: [{
            data: topClientesInactivos.map((d) => d.DiasDesdeUltimaCompra ?? 0),
            backgroundColor: COLORS[5],
            borderColor: BORDERS[5],
            borderWidth: 1
        }]
    }

    // 10. Entregas pendientes — Doughnut por AlertaEntrega
    const alertaCount: Record<string, number> = {}
    entregas.forEach((e) => { alertaCount[e.AlertaEntrega] = (alertaCount[e.AlertaEntrega] ?? 0) + 1 })
    const alertaColors: Record<string, string> = { 'EN TIEMPO': COLORS[1], 'VENCE HOY': COLORS[2], 'ATRASADA': COLORS[3] }
    const entregasChart = {
        labels: Object.keys(alertaCount),
        datasets: [{
            data: Object.values(alertaCount),
            backgroundColor: Object.keys(alertaCount).map((k) => alertaColors[k] ?? COLORS[4]),
            borderColor: Object.keys(alertaCount).map((k) => (alertaColors[k] ?? COLORS[4]).replace('0.75', '1')),
            borderWidth: 1
        }]
    }

    const totalLoading = Object.values(loadingMap).filter(Boolean).length
    const totalEndpoints = Object.keys(loadingMap).length

    const yColones = { scales: { y: { ticks: { callback: (v: number) => crColones(v) } } } }
    const noLegend = { plugins: { legend: { display: false } } }
    const withLegend = { plugins: { legend: { position: 'bottom' as const } } }
    const hBar = { indexAxis: 'y' as const }

    return (
        <div className="grid">
            <Toast ref={toast} />

            {/* Banner */}
            <div className="col-12">
                <div className="card p-0" style={{ overflow: 'hidden' }}>
                    <div className="flex align-items-center justify-content-between p-5" style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, #6366f1 100%)' }}>
                        <div className="flex align-items-center gap-4">
                            <div className="flex align-items-center justify-content-center border-circle bg-white" style={{ width: '72px', height: '72px', flexShrink: 0 }}>
                                <i className="pi pi-chart-bar" style={{ fontSize: '2rem', color: 'var(--primary-color)' }} />
                            </div>
                            <div>
                                <h2 className="m-0 text-white font-bold">Reportes</h2>
                                <span className="text-white opacity-80 text-sm">Análisis visual del negocio</span>
                            </div>
                        </div>
                        <div className="flex align-items-center gap-3">
                            {totalLoading > 0 && (
                                <Tag value={`Cargando ${totalLoading}/${totalEndpoints}…`} severity="warning" icon="pi pi-spin pi-spinner" />
                            )}
                            <Button
                                label="Actualizar todo"
                                icon="pi pi-refresh"
                                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.4)', color: 'white' }}
                                onClick={loadAll}
                                disabled={totalLoading > 0}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 1. Ventas por categoría de cliente */}
            <Section title="Ventas por Categoría de Cliente" icon="pi pi-users" loading={loadingMap.categoriaCliente} empty={categoriaCliente.length === 0} onRefresh={() => fetchWith('categoriaCliente', ReportService.getVentasCategoriaCliente, setCategoriaCliente)}>
                <Chart type="pie" data={categoriaClienteChart} options={withLegend} style={{ height: '320px' }} />
            </Section>

            {/* 2. Ingresos periódicos */}
            <Section title="Ingresos Periódicos" icon="pi pi-calendar" loading={loadingMap.ingresosPeriodicos} empty={ingresosPeriodicos.length === 0} onRefresh={() => fetchWith('ingresosPeriodicos', () => ReportService.getIngresosPeriodicos(periodo), setIngresosPeriodicos)}>
                <div className="flex justify-content-center mb-3">
                    <SelectButton
                        value={periodo}
                        onChange={(e) => e.value && changePeriodo(e.value)}
                        options={[{ label: 'Día', value: 'DIA' }, { label: 'Semana', value: 'SEMANA' }, { label: 'Mes', value: 'MES' }]}
                        optionLabel="label"
                        optionValue="value"
                    />
                </div>
                <Chart type="line" data={ingresosPeriodicosChart} options={{ ...withLegend, ...yColones }} style={{ height: '280px' }} />
            </Section>

            {/* 3. Best sellers */}
            <Section title="Best Sellers (Top 10 por Unidades)" icon="pi pi-star" loading={loadingMap.bestSellers} empty={bestSellers.length === 0} onRefresh={() => fetchWith('bestSellers', () => ReportService.getBestSellers(10, 'UNIDADES'), setBestSellers)}>
                <Chart type="bar" data={bestSellersChart} options={{ ...hBar, ...noLegend }} style={{ height: '320px' }} />
            </Section>

            {/* 4. Margen de utilidad */}
            <Section title="Margen de Utilidad por Producto" icon="pi pi-percentage" loading={loadingMap.margenUtilidad} empty={margenUtilidad.length === 0} onRefresh={() => fetchWith('margenUtilidad', ReportService.getMargenUtilidad, setMargenUtilidad)}>
                <Chart type="bar" data={margenChart} options={{ ...withLegend, ...yColones }} style={{ height: '320px' }} />
            </Section>

            {/* 5. Desempeño por marca */}
            <Section title="Desempeño por Marca (Ingresos Netos)" icon="pi pi-bookmark" loading={loadingMap.desempenoMarca} empty={desempenoMarca.length === 0} onRefresh={() => fetchWith('desempenoMarca', ReportService.getDesempenoMarca, setDesempenoMarca)}>
                <Chart type="bar" data={marcaChart} options={{ ...noLegend, ...yColones }} style={{ height: '320px' }} />
            </Section>

            {/* 6. Stock crítico */}
            <Section title="Stock Crítico (Unidades Faltantes)" icon="pi pi-exclamation-triangle" loading={loadingMap.stockCritico} empty={stockCritico.length === 0} onRefresh={() => fetchWith('stockCritico', ReportService.getStockCritico, setStockCritico)}>
                <Chart type="bar" data={stockCriticoChart} options={{ ...hBar, ...noLegend }} style={{ height: '320px' }} />
            </Section>

            {/* 7. Valorización del inventario */}
            <Section title="Valorización del Inventario (Top 10)" icon="pi pi-box" loading={loadingMap.valorizacion} empty={valorizacion.length === 0} onRefresh={() => fetchWith('valorizacion', ReportService.getValorizacionInventario, setValorizacion)}>
                <Chart type="bar" data={valorizacionChart} options={{ ...withLegend, ...yColones }} style={{ height: '320px' }} />
            </Section>

            {/* 8. Productos sin movimiento */}
            <Section title="Productos Sin Movimiento (Días inactivo)" icon="pi pi-clock" loading={loadingMap.sinMovimiento} empty={sinMovimiento.length === 0} onRefresh={() => fetchWith('sinMovimiento', ReportService.getProductosSinMovimiento, setSinMovimiento)}>
                <Chart type="bar" data={sinMovimientoChart} options={{ ...hBar, ...noLegend }} style={{ height: '320px' }} />
            </Section>

            {/* 9. Clientes inactivos */}
            <Section title="Clientes Inactivos (Días sin comprar)" icon="pi pi-user-minus" loading={loadingMap.clientesInactivos} empty={clientesInactivos.length === 0} onRefresh={() => fetchWith('clientesInactivos', ReportService.getClientesInactivos, setClientesInactivos)}>
                <Chart type="bar" data={clientesInactivosChart} options={{ ...hBar, ...noLegend }} style={{ height: '320px' }} />
            </Section>

            {/* 10. Entregas pendientes */}
            <Section title="Entregas Pendientes por Alerta" icon="pi pi-truck" loading={loadingMap.entregas} empty={entregas.length === 0} onRefresh={() => fetchWith('entregas', ReportService.getEntregasPendientes, setEntregas)}>
                <div className="flex justify-content-center">
                    <Chart type="doughnut" data={entregasChart} options={withLegend} style={{ height: '320px', maxWidth: '400px' }} />
                </div>
            </Section>
        </div>
    )
}

export default ReportesPage
