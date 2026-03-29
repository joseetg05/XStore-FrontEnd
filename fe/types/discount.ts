/**
 * Maps to the backend table columns:
 * DESC_ID, DESC_Nombre, DESC_TIPO_DESC_ID, DESC_Porcentaje, DESC_Estado
 */
export interface Discount {
    id: number
    name: string
    discountTypeId: number
    percentage: number
    status: boolean
}

export interface DiscountResult {
    success: boolean
    discount?: Discount
    error?: string
}
