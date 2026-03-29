import { Inventory, InventoryResult } from '@/types/inventory'

// ─── Mock Seed Data ───────────────────────────────────────────────────────────
// Product IDs reference MOCK_PRODUCTS (1–4), Location IDs reference SEED_LOCATIONS (1–3).

const SEED_INVENTORY: Inventory[] = [
    { id: 1, productId: 1, locationId: 1, minStock: 5,  currentStock: 12, status: true },
    { id: 2, productId: 2, locationId: 1, minStock: 10, currentStock: 8,  status: true },
    { id: 3, productId: 3, locationId: 2, minStock: 3,  currentStock: 3,  status: true },
    { id: 4, productId: 4, locationId: 3, minStock: 8,  currentStock: 20, status: true }
]

// ─── localStorage Helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = 'xstore-inventory'

const loadInventory = (): Inventory[] => {
    try {
        if (typeof window === 'undefined') return SEED_INVENTORY
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_INVENTORY))
            return SEED_INVENTORY
        }
        return JSON.parse(raw) as Inventory[]
    } catch {
        // Handle invalid/corrupt localStorage data — reset with seed
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_INVENTORY))
        return SEED_INVENTORY
    }
}

const saveInventory = (items: Inventory[]): void => {
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
        }
    } catch {
        // Silently fail if localStorage is unavailable
    }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const InventoryService = {
    /**
     * Retorna TODOS los registros de inventario.
     * Usado por el panel de administración.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/inventory`).then(r => r.json())
     */
    getAll(): Promise<Inventory[]> {
        return Promise.resolve(loadInventory())
    },

    /**
     * Crea un nuevo registro de inventario.
     * Valida que no exista otro registro con la misma combinación productId + locationId.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/inventory`, {
     *   method: 'POST', headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify(data)
     * }).then(r => r.json())
     */
    create(data: Omit<Inventory, 'id'>): Promise<InventoryResult> {
        const items = loadInventory()
        const isDuplicate = items.some(
            (i) => i.productId === data.productId && i.locationId === data.locationId
        )
        if (isDuplicate) {
            return Promise.resolve({ success: false, error: 'Ya existe un registro para ese producto y ubicación.' })
        }
        const newId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1
        const newItem: Inventory = { id: newId, ...data }
        items.push(newItem)
        saveInventory(items)
        return Promise.resolve({ success: true, inventory: newItem })
    },

    /**
     * Actualiza un registro de inventario existente.
     * Valida duplicado productId + locationId excluyendo el propio registro.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/inventory/${inventory.id}`, {
     *   method: 'PUT', headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify(inventory)
     * }).then(r => r.json())
     */
    update(inventory: Inventory): Promise<InventoryResult> {
        const items = loadInventory()
        const index = items.findIndex((i) => i.id === inventory.id)
        if (index === -1) return Promise.resolve({ success: false, error: 'Registro de inventario no encontrado.' })
        const isDuplicate = items.some(
            (i) => i.id !== inventory.id && i.productId === inventory.productId && i.locationId === inventory.locationId
        )
        if (isDuplicate) {
            return Promise.resolve({ success: false, error: 'Ya existe un registro para ese producto y ubicación.' })
        }
        items[index] = inventory
        saveInventory(items)
        return Promise.resolve({ success: true, inventory })
    },

    /**
     * Elimina un registro de inventario por ID.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/inventory/${id}`, {
     *   method: 'DELETE'
     * }).then(r => r.json())
     */
    delete(id: number): Promise<{ success: boolean; error?: string }> {
        const items = loadInventory()
        const index = items.findIndex((i) => i.id === id)
        if (index === -1) return Promise.resolve({ success: false, error: 'Registro de inventario no encontrado.' })
        items.splice(index, 1)
        saveInventory(items)
        return Promise.resolve({ success: true })
    },

    /**
     * Cambia el estado activo/inactivo de un registro de inventario.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/inventory/${id}/toggle-status`, {
     *   method: 'PATCH'
     * }).then(r => r.json())
     */
    toggleStatus(id: number): Promise<InventoryResult> {
        const items = loadInventory()
        const index = items.findIndex((i) => i.id === id)
        if (index === -1) return Promise.resolve({ success: false, error: 'Registro de inventario no encontrado.' })
        items[index] = { ...items[index], status: !items[index].status }
        saveInventory(items)
        return Promise.resolve({ success: true, inventory: items[index] })
    }
}
