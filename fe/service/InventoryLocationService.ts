import { apiCall, getCurrentUsername } from './ApiClient'
import { InventoryLocation, InventoryLocationResult } from '@/types/inventorylocation'

// ─── API shape ────────────────────────────────────────────────────────────────

interface ApiLocation {
    'Ubicación': string
    Estado: string
}

const fromApi = (l: ApiLocation, index: number): InventoryLocation => ({
    id: index + 1,
    name: l['Ubicación'],
    status: l.Estado === 'Activo'
})

// ─── Service ──────────────────────────────────────────────────────────────────

export const InventoryLocationService = {
    async getAll(): Promise<InventoryLocation[]> {
        const u = getCurrentUsername()
        if (!u) return []
        const data = await apiCall<ApiLocation[]>('GET', `/api/ubicaciones?nombreUsuario=${u}`)
        return (data ?? []).map((l, i) => fromApi(l, i))
    },

    async getActiveLocations(): Promise<InventoryLocation[]> {
        const all = await InventoryLocationService.getAll()
        return all.filter((l) => l.status)
    },

    async create(data: Omit<InventoryLocation, 'id'>): Promise<InventoryLocationResult> {
        try {
            await apiCall('POST', '/api/ubicaciones', { nombreUsuario: getCurrentUsername(), nombre: data.name })
            return { success: true }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    },

    async update(originalName: string, location: InventoryLocation): Promise<InventoryLocationResult> {
        try {
            await apiCall('PUT', '/api/ubicaciones', {
                nombreUsuario: getCurrentUsername(),
                nombre: originalName,
                nuevoNombre: location.name,
                nuevoEstado: location.status
            })
            return { success: true, location }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    },

    async delete(name: string): Promise<{ success: boolean; error?: string }> {
        try {
            await apiCall('PUT', '/api/ubicaciones', { nombreUsuario: getCurrentUsername(), nombre: name, nuevoEstado: false })
            return { success: true }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    },

    async toggleStatus(name: string, currentStatus: boolean): Promise<InventoryLocationResult> {
        const newStatus = !currentStatus
        try {
            await apiCall('PUT', '/api/ubicaciones', { nombreUsuario: getCurrentUsername(), nombre: name, nuevoEstado: newStatus })
            return { success: true, location: { id: 0, name, status: newStatus } }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    }
}
