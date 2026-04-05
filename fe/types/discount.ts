export interface Discount {
    name: string        // nombreComercial — identificador en la API
    description: string
    category: string    // nombre de la categoría (cat-descuentos)
    percentage: number
    startDate: string   // YYYY-MM-DD
    endDate: string     // YYYY-MM-DD
    status: boolean
}

export interface DiscountResult {
    success: boolean
    discount?: Discount
    error?: string
}
