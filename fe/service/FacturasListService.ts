/** Lista facturas emitidas — GET /api/facturas. Ver FacturacionService para emitir (POST). */
import { apiCall, getCurrentUsername } from './ApiClient'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Factura {
    'Número Factura': string
    'Fecha y Hora': string
    'Cliente': string
    'Identificación': string
    'Tipo Cliente': string
    'Subtotal': number
    'Descuento Total': number
    'IVA %': number
    'IVA': number
    'Costo Envío': number
    'Total': number
    'Con Entrega': string
    'Fecha Entrega': string | null
    'Dirección Entrega': string | null
    'Observaciones Entrega': string | null
    'Estado Entrega': string | null
}

export interface ListarFacturasParams {
    filtroCliente?: string
    filtroNumero?: string
    fechaDesde?: string
    fechaHasta?: string
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const FacturasListService = {
    async listarFacturas(params: ListarFacturasParams = {}): Promise<Factura[]> {
        const nombreUsuario = getCurrentUsername()
        const query = new URLSearchParams({ nombreUsuario })
        if (params.filtroCliente) query.append('filtroCliente', params.filtroCliente)
        if (params.filtroNumero) query.append('filtroNumero', params.filtroNumero)
        if (params.fechaDesde) query.append('fechaDesde', params.fechaDesde)
        if (params.fechaHasta) query.append('fechaHasta', params.fechaHasta)
        return apiCall<Factura[]>('GET', `/api/facturas?${query.toString()}`) ?? []
    }
}
