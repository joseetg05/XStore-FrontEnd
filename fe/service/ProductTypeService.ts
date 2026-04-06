import { apiCall, getCurrentUsername } from './ApiClient'
import { ProductType, ProductTypeResult } from '@/types/producttype'

// ─── API shape ────────────────────────────────────────────────────────────────

interface ApiProductType {
    'Tipos Productos': string
    Estado: string
}

const fromApi = (t: ApiProductType, index: number): ProductType => ({
    id: index + 1,
    name: t['Tipos Productos'],
    status: t.Estado === 'Activo'
})

// ─── Service ──────────────────────────────────────────────────────────────────

export const ProductTypeService = {
    async getAll(): Promise<ProductType[]> {
        const u = getCurrentUsername()
        const data = await apiCall<ApiProductType[]>('GET', `/api/tipos-productos?nombreUsuario=${u}`)
        return (data ?? []).map((t, i) => fromApi(t, i))
    },

    async getActiveProductTypes(): Promise<ProductType[]> {
        const all = await ProductTypeService.getAll()
        return all.filter((t) => t.status)
    },

    async create(data: Omit<ProductType, 'id'>): Promise<ProductTypeResult> {
        try {
            await apiCall('POST', '/api/tipos-productos', { nombreUsuario: getCurrentUsername(), nombre: data.name })
            return { success: true }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    },

    async update(originalName: string, productType: ProductType): Promise<ProductTypeResult> {
        try {
            await apiCall('PUT', '/api/tipos-productos', {
                nombreUsuario: getCurrentUsername(),
                nombre: originalName,
                nuevoNombre: productType.name,
                nuevoEstado: productType.status
            })
            return { success: true, productType }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    },

    async delete(name: string): Promise<{ success: boolean; error?: string }> {
        try {
            await apiCall('PUT', '/api/tipos-productos', { nombreUsuario: getCurrentUsername(), nombre: name, nuevoEstado: false })
            return { success: true }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    },

    async toggleStatus(name: string, currentStatus: boolean): Promise<ProductTypeResult> {
        const newStatus = !currentStatus
        try {
            await apiCall('PUT', '/api/tipos-productos', { nombreUsuario: getCurrentUsername(), nombre: name, nuevoEstado: newStatus })
            return { success: true, productType: { id: 0, name, status: newStatus } }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    }
}
