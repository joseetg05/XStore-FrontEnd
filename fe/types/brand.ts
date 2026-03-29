/**
 * Maps to the backend table columns:
 * MARC_PRD_ID, MARC_PRD_Nombre, MARC_PRD_Estado
 */
export interface Brand {
    id: number
    name: string
    status: boolean
}

export interface BrandResult {
    success: boolean
    brand?: Brand
    error?: string
}
