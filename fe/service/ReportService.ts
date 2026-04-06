import { apiCall, getCurrentUsername } from './ApiClient'

const u = () => getCurrentUsername()

// ─── Types (PascalCase — matches API response) ────────────────────────────────

export interface RptVentaCategoriaCliente {
    CategoriaCliente: string
    TotalFacturas: number
    TotalClientes: number
    Subtotal: number
    DescuentosAplicados: number
    ImpuestosRecaudados: number
    TotalIngresos: number
    TicketPromedio: number
}

export interface RptIngresoPeriodico {
    Periodo: string
    TotalFacturas: number
    Subtotal: number
    DescuentosAplicados: number
    ImpuestosRecaudados: number
    CostoEnvioTotal: number
    TotalIngresos: number
}

export interface RptBestSeller {
    Ranking: number
    Producto: string
    Tipo: string
    Marca: string
    UnidadesVendidas: number
    NumeroFacturas: number
    IngresosBrutos: number
    DescuentosAplicados: number
    IngresosNetos: number
}

export interface RptMargenUtilidad {
    Producto: string
    Tipo: string
    Marca: string
    PrecioCompra: number
    PrecioVentaLista: number
    PrecioEfectivoPromedio: number
    MargenUnitario: number
    MargenPct: number
    UnidadesVendidas: number
    IngresosNetos: number
    UtilidadTotal: number
}

export interface RptDesempenoMarca {
    Ranking: number
    Marca: string
    TotalProductos: number
    UnidadesVendidas: number
    NumeroFacturas: number
    IngresosBrutos: number
    DescuentosAplicados: number
    IngresosNetos: number
    PrecioPromedioVenta: number
}

export interface RptStockCritico {
    Ubicacion: string
    Producto: string
    Tipo: string
    Marca: string
    StockMinimo: number
    StockActual: number
    UnidadesFaltantes: number
    CostoReposicion: number
}

export interface RptValorizacionInventario {
    Ubicacion: string
    Producto: string
    Tipo: string
    Marca: string
    PrecioCompra: number
    PrecioVenta: number
    StockActual: number
    ValorCosto: number
    ValorVenta: number
    UtilidadPotencial: number
}

export interface RptProductoSinMovimiento {
    Producto: string
    Tipo: string
    Marca: string
    PrecioCompra: number
    PrecioVenta: number
    StockTotal: number
    ValorInmovilizado: number
    UltimaVenta: string | null
    DiasInactivo: number | null
}

export interface RptClienteInactivo {
    NombreCliente: string
    Identificacion: string
    Correo: string
    Telefono: string
    CategoriaCliente: string
    FechaRegistro: string
    TotalCompras: number
    TotalGastado: number
    UltimaCompra: string | null
    DiasDesdeUltimaCompra: number | null
}

export interface RptEntregaPendiente {
    NumeroFactura: string
    Cliente: string
    Telefono: string
    Correo: string
    FechaFactura: string
    TotalFactura: number
    DireccionEntrega: string
    FechaEntregaCompromiso: string
    EstadoEntrega: string
    Observaciones: string | null
    DiasRetraso: number
    AlertaEntrega: string
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const ReportService = {
    async getVentasCategoriaCliente(): Promise<RptVentaCategoriaCliente[]> {
        const params = new URLSearchParams({ nombreUsuario: u() })
        return (await apiCall<RptVentaCategoriaCliente[]>('GET', `/api/reportes/ventas-categoria-cliente?${params}`)) ?? []
    },

    async getIngresosPeriodicos(periodo: 'DIA' | 'SEMANA' | 'MES' = 'MES'): Promise<RptIngresoPeriodico[]> {
        const params = new URLSearchParams({ nombreUsuario: u(), periodo })
        return (await apiCall<RptIngresoPeriodico[]>('GET', `/api/reportes/ingresos-periodicos?${params}`)) ?? []
    },

    async getBestSellers(top = 10, ordenarPor: 'UNIDADES' | 'INGRESOS' = 'UNIDADES'): Promise<RptBestSeller[]> {
        const params = new URLSearchParams({ nombreUsuario: u(), top: String(top), ordenarPor })
        return (await apiCall<RptBestSeller[]>('GET', `/api/reportes/best-sellers?${params}`)) ?? []
    },

    async getMargenUtilidad(): Promise<RptMargenUtilidad[]> {
        const params = new URLSearchParams({ nombreUsuario: u() })
        return (await apiCall<RptMargenUtilidad[]>('GET', `/api/reportes/margen-utilidad?${params}`)) ?? []
    },

    async getDesempenoMarca(): Promise<RptDesempenoMarca[]> {
        const params = new URLSearchParams({ nombreUsuario: u() })
        return (await apiCall<RptDesempenoMarca[]>('GET', `/api/reportes/desempeno-marca?${params}`)) ?? []
    },

    async getStockCritico(): Promise<RptStockCritico[]> {
        const params = new URLSearchParams({ nombreUsuario: u() })
        return (await apiCall<RptStockCritico[]>('GET', `/api/reportes/stock-critico?${params}`)) ?? []
    },

    async getValorizacionInventario(): Promise<RptValorizacionInventario[]> {
        const params = new URLSearchParams({ nombreUsuario: u() })
        return (await apiCall<RptValorizacionInventario[]>('GET', `/api/reportes/valorizacion-inventario?${params}`)) ?? []
    },

    async getProductosSinMovimiento(diasInactividad = 90): Promise<RptProductoSinMovimiento[]> {
        const params = new URLSearchParams({ nombreUsuario: u(), diasInactividad: String(diasInactividad) })
        return (await apiCall<RptProductoSinMovimiento[]>('GET', `/api/reportes/productos-sin-movimiento?${params}`)) ?? []
    },

    async getClientesInactivos(diasInactividad = 180): Promise<RptClienteInactivo[]> {
        const params = new URLSearchParams({ nombreUsuario: u(), diasInactividad: String(diasInactividad) })
        return (await apiCall<RptClienteInactivo[]>('GET', `/api/reportes/clientes-inactivos?${params}`)) ?? []
    },

    async getEntregasPendientes(): Promise<RptEntregaPendiente[]> {
        const params = new URLSearchParams({ nombreUsuario: u() })
        return (await apiCall<RptEntregaPendiente[]>('GET', `/api/reportes/entregas-pendientes?${params}`)) ?? []
    }
}
