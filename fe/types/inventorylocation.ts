/**
 * Maps to the backend table columns:
 * UBI_INV_ID, UBI_INV_Nombre, UBI_INV_Estado
 */
export interface InventoryLocation {
    id: number
    name: string
    status: boolean
}

export interface InventoryLocationResult {
    success: boolean
    location?: InventoryLocation
    error?: string
}
