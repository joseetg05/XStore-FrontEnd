/**
 * Maps to the backend table columns:
 * TIPO_DESC_ID, TIPO_DESC_Nombre, TIPO_DESC_FechaInicio, TIPO_DESC_FechaFin, TIPO_DESC_Estado
 */
export interface DiscountType {
    id: number
    name: string
    startDate: Date
    endDate: Date
    status: boolean
}

export interface DiscountTypeResult {
    success: boolean
    discountType?: DiscountType
    error?: string
}
