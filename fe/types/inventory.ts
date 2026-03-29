/**
 * Maps to the backend table columns:
 * INV_ID, INV_UBI_INV_ID, INV_PRD_ID, INV_StockMinimo, INV_StockActual, INV_Estado
 */
export interface Inventory {
    id: number
    locationId: number
    productId: number
    minStock: number
    currentStock: number
    status: boolean
}

export interface InventoryResult {
    success: boolean
    inventory?: Inventory
    error?: string
}
