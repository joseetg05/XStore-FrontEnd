import { apiCall, getCurrentUsername } from './ApiClient'
import { Discount, DiscountResult } from '@/types/discount'

// ─── API shape ────────────────────────────────────────────────────────────────

interface ApiDiscount {
    'Nombre Comercial': string
    'Descripción': string
    'Categoría': string
    'Porcentaje': number
    'Fecha Inicio': string
    'Fecha Final': string
    'Estado': string
}

const fromApi = (d: ApiDiscount): Discount => ({
    name: d['Nombre Comercial'],
    description: d['Descripción'],
    category: d['Categoría'],
    percentage: d['Porcentaje'],
    startDate: d['Fecha Inicio']?.split('T')[0] ?? '',
    endDate: d['Fecha Final']?.split('T')[0] ?? '',
    status: d['Estado'] === 'Activo'
})

// ─── Service ──────────────────────────────────────────────────────────────────

export const DiscountService = {
    async getAll(): Promise<Discount[]> {
        const u = getCurrentUsername()
        if (!u) return []
        try {
            const data = await apiCall<ApiDiscount[]>('GET', `/api/descuentos?nombreUsuario=${u}`)
            return (data ?? []).map(fromApi)
        } catch {
            return []
        }
    },

    async getActive(): Promise<Discount[]> {
        const all = await DiscountService.getAll()
        return all.filter((d) => d.status)
    },

    async create(discount: Discount): Promise<DiscountResult> {
        try {
            await apiCall('POST', '/api/descuentos', {
                nombreUsuario: getCurrentUsername(),
                nombreComercial: discount.name,
                descripcion: discount.description,
                categoria: discount.category,
                porcentaje: discount.percentage,
                fechaInicio: discount.startDate,
                fechaFinal: discount.endDate
            })
            return { success: true, discount }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    },

    async update(originalName: string, discount: Discount): Promise<DiscountResult> {
        try {
            await apiCall('PUT', '/api/descuentos', {
                nombreUsuario: getCurrentUsername(),
                nombreComercial: originalName,
                nuevoNombreComercial: discount.name !== originalName ? discount.name : null,
                nuevaDescripcion: discount.description,
                nuevaCategoria: discount.category,
                nuevoPorcentaje: discount.percentage,
                nuevaFechaInicio: discount.startDate,
                nuevaFechaFin: discount.endDate,
                nuevoEstado: discount.status
            })
            return { success: true, discount }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    },

    async toggleStatus(name: string, currentStatus: boolean): Promise<DiscountResult> {
        try {
            await apiCall('PUT', '/api/descuentos', {
                nombreUsuario: getCurrentUsername(),
                nombreComercial: name,
                nuevoEstado: !currentStatus
            })
            return { success: true }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    }
}
