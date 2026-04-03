/**
 * Maps to the backend table columns:
 * CAT_DESC_ID, CAT_DESC_Nombre, CAT_DESC_Estado
 */
export interface DiscountType {
    id: number
    name: string
    status: boolean
}

export interface DiscountTypeResult {
    success: boolean
    discountType?: DiscountType
    error?: string
}
