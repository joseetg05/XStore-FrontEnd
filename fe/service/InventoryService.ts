import { apiCall, getCurrentUsername } from './ApiClient'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InventoryEntry {
    description: string
    location: string
    stock: number
    minStock: number
    status: boolean
}

export interface InventoryFilters {
    filtroUbicacion?: string
    filtroProducto?: string
}

// ─── API shape ────────────────────────────────────────────────────────────────

interface ApiInventory {
    'Ubicación': string
    'Producto': string
    'Stock Actual': number
    'Stock Mínimo': number
    'Estado': string
}

const fromApi = (i: ApiInventory): InventoryEntry => ({
    description: i['Producto'] ?? '',
    location: i['Ubicación'] ?? '',
    stock: i['Stock Actual'] ?? 0,
    minStock: i['Stock Mínimo'] ?? 0,
    status: i['Estado'] === 'Activo'
})

// ─── Service ──────────────────────────────────────────────────────────────────

export const InventoryService = {
    async getAll(filters?: InventoryFilters): Promise<InventoryEntry[]> {
        const u = getCurrentUsername()
        try {
            const params = new URLSearchParams({ nombreUsuario: u })
            if (filters?.filtroUbicacion) params.append('filtroUbicacion', filters.filtroUbicacion)
            if (filters?.filtroProducto) params.append('filtroProducto', filters.filtroProducto)

            const data = await apiCall<ApiInventory[]>('GET', `/api/inventario?${params}`)
            return (data ?? []).map(fromApi)
        } catch {
            return []
        }
    }
}
