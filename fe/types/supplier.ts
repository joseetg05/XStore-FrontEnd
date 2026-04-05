export interface Supplier {
    id: number
    name: string
    identification: string
    phone: string
    email: string
    address: string
    status: boolean
}

export interface SupplierResult {
    success: boolean
    supplier?: Supplier
    error?: string
}
