import { ProductType, ProductTypeResult } from '@/types/producttype'

// ─── Mock Seed Data ───────────────────────────────────────────────────────────

const SEED_PRODUCT_TYPES: ProductType[] = [
    { id: 1, name: 'Celulares', status: true },
    { id: 2, name: 'Ropa', status: true },
    { id: 3, name: 'Accesorios', status: true },
    { id: 4, name: 'Hogar y Jardín', status: true }
]

// ─── localStorage Helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = 'xstore-product-types'

const loadProductTypes = (): ProductType[] => {
    try {
        if (typeof window === 'undefined') return SEED_PRODUCT_TYPES
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PRODUCT_TYPES))
            return SEED_PRODUCT_TYPES
        }
        return JSON.parse(raw) as ProductType[]
    } catch {
        // Handle invalid/corrupt localStorage data — reset with seed
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PRODUCT_TYPES))
        return SEED_PRODUCT_TYPES
    }
}

const saveProductTypes = (types: ProductType[]): void => {
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(types))
        }
    } catch {
        // Silently fail if localStorage is unavailable
    }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const ProductTypeService = {
    /**
     * Retorna TODOS los tipos de producto (activos e inactivos).
     * Usado por el panel de administración.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/product-types`).then(r => r.json())
     */
    getAll(): Promise<ProductType[]> {
        return Promise.resolve(loadProductTypes())
    },

    /**
     * Retorna solo los tipos con status === true.
     * Usado por el formulario de productos y los filtros del catálogo.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/product-types?status=active`).then(r => r.json())
     */
    getActiveProductTypes(): Promise<ProductType[]> {
        return Promise.resolve(loadProductTypes().filter((t) => t.status === true))
    },

    /**
     * Crea un nuevo tipo de producto.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/product-types`, {
     *   method: 'POST', headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify(data)
     * }).then(r => r.json())
     */
    create(data: Omit<ProductType, 'id'>): Promise<ProductTypeResult> {
        const types = loadProductTypes()
        const isDuplicate = types.some((t) => t.name.toLowerCase() === data.name.toLowerCase())
        if (isDuplicate) {
            return Promise.resolve({ success: false, error: 'Ya existe un tipo con ese nombre.' })
        }
        const newId = types.length > 0 ? Math.max(...types.map((t) => t.id)) + 1 : 1
        const newType: ProductType = { id: newId, ...data }
        types.push(newType)
        saveProductTypes(types)
        return Promise.resolve({ success: true, productType: newType })
    },

    /**
     * Actualiza un tipo de producto existente.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/product-types/${productType.id}`, {
     *   method: 'PUT', headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify(productType)
     * }).then(r => r.json())
     */
    update(productType: ProductType): Promise<ProductTypeResult> {
        const types = loadProductTypes()
        const index = types.findIndex((t) => t.id === productType.id)
        if (index === -1) return Promise.resolve({ success: false, error: 'Tipo de producto no encontrado.' })
        const isDuplicate = types.some((t) => t.id !== productType.id && t.name.toLowerCase() === productType.name.toLowerCase())
        if (isDuplicate) {
            return Promise.resolve({ success: false, error: 'Ya existe un tipo con ese nombre.' })
        }
        types[index] = productType
        saveProductTypes(types)
        return Promise.resolve({ success: true, productType })
    },

    /**
     * Elimina un tipo de producto por ID.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/product-types/${id}`, {
     *   method: 'DELETE'
     * }).then(r => r.json())
     */
    delete(id: number): Promise<{ success: boolean; error?: string }> {
        const types = loadProductTypes()
        const index = types.findIndex((t) => t.id === id)
        if (index === -1) return Promise.resolve({ success: false, error: 'Tipo de producto no encontrado.' })
        types.splice(index, 1)
        saveProductTypes(types)
        return Promise.resolve({ success: true })
    },

    /**
     * Cambia el estado activo/inactivo de un tipo de producto.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/product-types/${id}/toggle-status`, {
     *   method: 'PATCH'
     * }).then(r => r.json())
     */
    toggleStatus(id: number): Promise<ProductTypeResult> {
        const types = loadProductTypes()
        const index = types.findIndex((t) => t.id === id)
        if (index === -1) return Promise.resolve({ success: false, error: 'Tipo de producto no encontrado.' })
        types[index] = { ...types[index], status: !types[index].status }
        saveProductTypes(types)
        return Promise.resolve({ success: true, productType: types[index] })
    }
}
