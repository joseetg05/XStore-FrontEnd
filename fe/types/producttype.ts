/**
 * Maps to the backend table columns:
 * TIPO_PRD_ID, TIPO_PRD_Nombre, TIPO_PRD_Estado
 */
export interface ProductType {
    id: number
    name: string
    status: boolean
}

export interface ProductTypeResult {
    success: boolean
    productType?: ProductType
    error?: string
}
