import { apiCall, getCurrentUsername } from './ApiClient'
import { DiscountType, DiscountTypeResult } from '@/types/discounttype'

// ─── API shape ────────────────────────────────────────────────────────────────

interface ApiDiscountType {
    'Categoría Descuento': string
    Estado: string
}

const fromApi = (d: ApiDiscountType, index: number): DiscountType => ({
    id: index + 1,
    name: d['Categoría Descuento'],
    status: d.Estado === 'Activo'
})

// ─── Service ──────────────────────────────────────────────────────────────────

export const DiscountTypeService = {
    async getAll(): Promise<DiscountType[]> {
        const u = getCurrentUsername()
        if (!u) return []
        const data = await apiCall<ApiDiscountType[]>('GET', `/api/cat-descuentos?nombreUsuario=${u}`)
        return (data ?? []).map((d, i) => fromApi(d, i))
    },

    async getActiveDiscountTypes(): Promise<DiscountType[]> {
        const all = await DiscountTypeService.getAll()
        return all.filter((d) => d.status)
    },

    async create(data: Omit<DiscountType, 'id'>): Promise<DiscountTypeResult> {
        try {
            await apiCall('POST', '/api/cat-descuentos', { nombreUsuario: getCurrentUsername(), nombre: data.name })
            return { success: true }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    },

    async update(originalName: string, discountType: DiscountType): Promise<DiscountTypeResult> {
        try {
            await apiCall('PUT', '/api/cat-descuentos', {
                nombreUsuario: getCurrentUsername(),
                nombre: originalName,
                nuevoNombre: discountType.name,
                nuevoEstado: discountType.status
            })
            return { success: true, discountType }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    },

    async delete(name: string): Promise<{ success: boolean; error?: string }> {
        try {
            await apiCall('PUT', '/api/cat-descuentos', { nombreUsuario: getCurrentUsername(), nombre: name, nuevoEstado: false })
            return { success: true }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    },

    async toggleStatus(name: string, currentStatus: boolean): Promise<DiscountTypeResult> {
        const newStatus = !currentStatus
        try {
            await apiCall('PUT', '/api/cat-descuentos', { nombreUsuario: getCurrentUsername(), nombre: name, nuevoEstado: newStatus })
            return { success: true, discountType: { id: 0, name, status: newStatus } }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    }
}
