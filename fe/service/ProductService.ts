import { apiCall, getCurrentUsername } from './ApiClient'
import { BrandService } from './BrandService'
import { ProductTypeService } from './ProductTypeService'
import { DiscountService } from './DiscountService'

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ProductType {
    id: number
    name: string
}

export interface Brand {
    id: number
    name: string
}

export interface Discount {
    name: string
    description: string
    percentage: number
}

export interface Product {
    id: number
    imageUrl: string
    description: string
    type: string        // nombre del tipo de producto
    brand: string       // nombre de la marca
    provider: string    // nombre del proveedor
    purchasePrice: number
    salePrice: number
    location: string    // nombre de la ubicación
    stock: number
    discountName: string
    status: boolean
}

export interface ProductFilters {
    type?: string | null
    brand?: string | null
    search?: string
    sortBy?: 'price' | 'description'
    sortOrder?: 'asc' | 'desc'
}

export interface ProductResult {
    success: boolean
    product?: Product
    error?: string
}

// ─── Create payload (campos adicionales solo para creación) ──────────────────

export interface CreateProductPayload {
    imageUrl: string
    description: string
    type: string
    brand: string
    provider: string
    purchasePrice: number
    salePrice: number
    location: string
    entryQuantity: number
    minStock: number
    discountName: string
}

// ─── API shape ────────────────────────────────────────────────────────────────

interface ApiProduct {
    'Descripción': string
    'Ruta Imagen': string
    'Tipo Producto': string
    'Marca': string
    'Proveedor': string
    'Precio Compra': number
    'Precio Venta': number
    'Precio Con Descuento': number
    'Descuento Asignado': string | null
    'Descuento %': string | null
    'Descuento Vigente Hoy': string
    'Estado': string
}

const fromApi = (p: ApiProduct, index: number): Product => ({
    id: index + 1,
    imageUrl: p['Ruta Imagen'],
    description: p['Descripción'],
    type: p['Tipo Producto'],
    brand: p['Marca'],
    provider: p['Proveedor'],
    purchasePrice: p['Precio Compra'],
    salePrice: p['Precio Venta'],
    location: '',
    stock: 0,
    discountName: p['Descuento Vigente Hoy'] === 'Sí' ? (p['Descuento Asignado'] ?? '') : '',
    status: p['Estado'] === 'Activo'
})

// ─── Service ──────────────────────────────────────────────────────────────────

export const ProductService = {
    getProductTypes(): Promise<ProductType[]> {
        return ProductTypeService.getActiveProductTypes()
    },

    getBrands(): Promise<Brand[]> {
        return BrandService.getActiveBrands()
    },

    async getDiscounts(): Promise<Discount[]> {
        const active = await DiscountService.getActive()
        return active.map((d) => ({ name: d.name, description: d.description, percentage: d.percentage }))
    },

    async getAllProducts(): Promise<Product[]> {
        const u = getCurrentUsername()
        try {
            const data = await apiCall<ApiProduct[]>('GET', `/api/productos?nombreUsuario=${u}`)
            return (data ?? []).map((p, i) => fromApi(p, i))
        } catch {
            return []
        }
    },

    async getActiveProducts(filters?: ProductFilters): Promise<Product[]> {
        const u = getCurrentUsername()
        try {
            const params = new URLSearchParams({ nombreUsuario: u })
            if (filters?.search) params.append('filtroDescripcion', filters.search)
            if (filters?.type) params.append('filtroTipo', filters.type)
            if (filters?.brand) params.append('filtroMarca', filters.brand)

            const data = await apiCall<ApiProduct[]>('GET', `/api/productos?${params}`)
            let results = (data ?? []).map((p, i) => fromApi(p, i)).filter((p) => p.status)

            if (filters?.sortBy) {
                const order = filters.sortOrder === 'desc' ? -1 : 1
                const field = filters.sortBy === 'price' ? 'salePrice' : 'description'
                results.sort((a, b) => {
                    const va = a[field as keyof Product]
                    const vb = b[field as keyof Product]
                    if (typeof va === 'string' && typeof vb === 'string') return va.localeCompare(vb) * order
                    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * order
                    return 0
                })
            }

            return results
        } catch {
            return []
        }
    },

    getProducts(filters?: ProductFilters): Promise<Product[]> {
        return ProductService.getActiveProducts(filters)
    },

    async createProduct(payload: CreateProductPayload): Promise<ProductResult> {
        try {
            await apiCall('POST', '/api/productos', {
                nombreUsuario: getCurrentUsername(),
                rutaImagen: payload.imageUrl,
                descripcion: payload.description,
                tipoProducto: payload.type,
                marcaProducto: payload.brand,
                nombreProveedor: payload.provider,
                precioCompra: payload.purchasePrice,
                precioVenta: payload.salePrice,
                nombreUbicacion: payload.location,
                cantidadIngreso: payload.entryQuantity,
                stockMinimo: payload.minStock,
                nombreDescuento: payload.discountName || null
            })
            return { success: true }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    }
}
