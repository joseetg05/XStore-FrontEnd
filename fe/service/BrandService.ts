import { apiCall, getCurrentUsername } from './ApiClient'
import { Brand, BrandResult } from '@/types/brand'

// ─── API shape ────────────────────────────────────────────────────────────────

interface ApiBrand {
    Marca: string
    Estado: string
}

const fromApi = (b: ApiBrand, index: number): Brand => ({
    id: index + 1,
    name: b.Marca,
    status: b.Estado === 'Activo'
})

// ─── Service ──────────────────────────────────────────────────────────────────

export const BrandService = {
    async getAll(): Promise<Brand[]> {
        const u = getCurrentUsername()
        if (!u) return []
        const data = await apiCall<ApiBrand[]>('GET', `/api/marcas-productos?nombreUsuario=${u}`)
        return (data ?? []).map((b, i) => fromApi(b, i))
    },

    async getActiveBrands(): Promise<Brand[]> {
        const all = await BrandService.getAll()
        return all.filter((b) => b.status)
    },

    async create(data: Omit<Brand, 'id'>): Promise<BrandResult> {
        try {
            await apiCall('POST', '/api/marcas-productos', { nombreUsuario: getCurrentUsername(), nombre: data.name })
            return { success: true }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    },

    async update(originalName: string, brand: Brand): Promise<BrandResult> {
        try {
            await apiCall('PUT', '/api/marcas-productos', {
                nombreUsuario: getCurrentUsername(),
                nombre: originalName,
                nuevoNombre: brand.name,
                nuevoEstado: brand.status
            })
            return { success: true, brand }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    },

    async delete(name: string): Promise<{ success: boolean; error?: string }> {
        try {
            await apiCall('PUT', '/api/marcas-productos', { nombreUsuario: getCurrentUsername(), nombre: name, nuevoEstado: false })
            return { success: true }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    },

    async toggleStatus(name: string, currentStatus: boolean): Promise<BrandResult> {
        const newStatus = !currentStatus
        try {
            await apiCall('PUT', '/api/marcas-productos', { nombreUsuario: getCurrentUsername(), nombre: name, nuevoEstado: newStatus })
            return { success: true, brand: { id: 0, name, status: newStatus } }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    }
}
