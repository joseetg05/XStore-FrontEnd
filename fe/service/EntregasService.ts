import { apiCall, getCurrentUsername } from './ApiClient'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Entrega {
    'Número Factura': string
    'Cliente': string
    'Identificación': string
    'Teléfono': string
    'Correo': string
    'Estado Entrega': 'En Sucursal' | 'En camino' | 'Entregado'
    'Fecha Entrega': string
    'Tiempo Restante': string
    'Dirección Entrega': string
    'Observaciones': string | null
    'Fecha Factura': string
    'Total Factura': number
}

export interface ListarEntregasParams {
    filtroEstado?: string
    filtroCliente?: string
    fechaDesde?: string
    fechaHasta?: string
}

export interface ActualizarEntregaPayload {
    numeroFactura: string
    enCamino: boolean
    entregado: boolean
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const EntregasService = {
    async listarEntregas(params: ListarEntregasParams = {}): Promise<Entrega[]> {
        const nombreUsuario = getCurrentUsername()
        const query = new URLSearchParams({ nombreUsuario })
        if (params.filtroEstado) query.append('filtroEstado', params.filtroEstado)
        if (params.filtroCliente) query.append('filtroCliente', params.filtroCliente)
        if (params.fechaDesde) query.append('fechaDesde', params.fechaDesde)
        if (params.fechaHasta) query.append('fechaHasta', params.fechaHasta)
        return apiCall<Entrega[]>('GET', `/api/entregas?${query.toString()}`) ?? []
    },

    async actualizarEstadoEntrega(payload: ActualizarEntregaPayload): Promise<void> {
        const nombreUsuario = getCurrentUsername()
        await apiCall('PUT', '/api/entregas', { nombreUsuario, ...payload })
    }
}
