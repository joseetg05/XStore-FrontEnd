import { InventoryLocation, InventoryLocationResult } from '@/types/inventorylocation'

// ─── Mock Seed Data ───────────────────────────────────────────────────────────

const SEED_LOCATIONS: InventoryLocation[] = [
    { id: 1, name: 'Bodega Principal', status: true },
    { id: 2, name: 'Estante A', status: true },
    { id: 3, name: 'Estante B', status: true },
    { id: 4, name: 'Caja', status: true },
    { id: 5, name: 'Mostrador', status: true }
]

// ─── localStorage Helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = 'xstore-inventory-locations'

const loadLocations = (): InventoryLocation[] => {
    try {
        if (typeof window === 'undefined') return SEED_LOCATIONS
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_LOCATIONS))
            return SEED_LOCATIONS
        }
        return JSON.parse(raw) as InventoryLocation[]
    } catch {
        // Handle invalid/corrupt localStorage data — reset with seed
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_LOCATIONS))
        return SEED_LOCATIONS
    }
}

const saveLocations = (locations: InventoryLocation[]): void => {
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(locations))
        }
    } catch {
        // Silently fail if localStorage is unavailable
    }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const InventoryLocationService = {
    /**
     * Retorna TODAS las ubicaciones (activas e inactivas).
     * Usado por el panel de administración.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/inventory-locations`).then(r => r.json())
     */
    getAll(): Promise<InventoryLocation[]> {
        return Promise.resolve(loadLocations())
    },

    /**
     * Retorna solo las ubicaciones con status === true.
     * Usado por el módulo de gestión de inventario/stock.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventory-locations?status=active`).then(r => r.json())
     */
    getActiveLocations(): Promise<InventoryLocation[]> {
        return Promise.resolve(loadLocations().filter((l) => l.status === true))
    },

    /**
     * Crea una nueva ubicación de inventario.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/inventory-locations`, {
     *   method: 'POST', headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify(data)
     * }).then(r => r.json())
     */
    create(data: Omit<InventoryLocation, 'id'>): Promise<InventoryLocationResult> {
        const locations = loadLocations()
        const isDuplicate = locations.some((l) => l.name.toLowerCase() === data.name.toLowerCase())
        if (isDuplicate) {
            return Promise.resolve({ success: false, error: 'Ya existe una ubicación con ese nombre.' })
        }
        const newId = locations.length > 0 ? Math.max(...locations.map((l) => l.id)) + 1 : 1
        const newLocation: InventoryLocation = { id: newId, ...data }
        locations.push(newLocation)
        saveLocations(locations)
        return Promise.resolve({ success: true, location: newLocation })
    },

    /**
     * Actualiza una ubicación existente.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/inventory-locations/${location.id}`, {
     *   method: 'PUT', headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify(location)
     * }).then(r => r.json())
     */
    update(location: InventoryLocation): Promise<InventoryLocationResult> {
        const locations = loadLocations()
        const index = locations.findIndex((l) => l.id === location.id)
        if (index === -1) return Promise.resolve({ success: false, error: 'Ubicación no encontrada.' })
        const isDuplicate = locations.some((l) => l.id !== location.id && l.name.toLowerCase() === location.name.toLowerCase())
        if (isDuplicate) {
            return Promise.resolve({ success: false, error: 'Ya existe una ubicación con ese nombre.' })
        }
        locations[index] = location
        saveLocations(locations)
        return Promise.resolve({ success: true, location })
    },

    /**
     * Elimina una ubicación por ID.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/inventory-locations/${id}`, {
     *   method: 'DELETE'
     * }).then(r => r.json())
     */
    delete(id: number): Promise<{ success: boolean; error?: string }> {
        const locations = loadLocations()
        const index = locations.findIndex((l) => l.id === id)
        if (index === -1) return Promise.resolve({ success: false, error: 'Ubicación no encontrada.' })
        locations.splice(index, 1)
        saveLocations(locations)
        return Promise.resolve({ success: true })
    },

    /**
     * Cambia el estado activo/inactivo de una ubicación.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/inventory-locations/${id}/toggle-status`, {
     *   method: 'PATCH'
     * }).then(r => r.json())
     */
    toggleStatus(id: number): Promise<InventoryLocationResult> {
        const locations = loadLocations()
        const index = locations.findIndex((l) => l.id === id)
        if (index === -1) return Promise.resolve({ success: false, error: 'Ubicación no encontrada.' })
        locations[index] = { ...locations[index], status: !locations[index].status }
        saveLocations(locations)
        return Promise.resolve({ success: true, location: locations[index] })
    }
}
