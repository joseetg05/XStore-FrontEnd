import { Brand, BrandResult } from '@/types/brand'

// ─── Mock Seed Data ───────────────────────────────────────────────────────────
// IDs match the brandId values used in MOCK_PRODUCTS so existing product data stays consistent.

const SEED_BRANDS: Brand[] = [
    { id: 1, name: 'Apple', status: true },
    { id: 2, name: 'Motorola', status: true },
    { id: 3, name: 'Nike', status: true },
    { id: 4, name: 'Adidas', status: true },
    { id: 5, name: 'IKEA', status: true },
    { id: 6, name: 'Sony', status: true }
]

// ─── localStorage Helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = 'xstore-brands'

const loadBrands = (): Brand[] => {
    try {
        if (typeof window === 'undefined') return SEED_BRANDS
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_BRANDS))
            return SEED_BRANDS
        }
        return JSON.parse(raw) as Brand[]
    } catch {
        // Handle invalid/corrupt localStorage data — reset with seed
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_BRANDS))
        return SEED_BRANDS
    }
}

const saveBrands = (brands: Brand[]): void => {
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(brands))
        }
    } catch {
        // Silently fail if localStorage is unavailable
    }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const BrandService = {
    /**
     * Retorna TODAS las marcas (activas e inactivas).
     * Usado por el panel de administración.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/brands`).then(r => r.json())
     */
    getAll(): Promise<Brand[]> {
        return Promise.resolve(loadBrands())
    },

    /**
     * Retorna solo las marcas con status === true.
     * Usado por el formulario de productos y los filtros del catálogo.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands?status=active`).then(r => r.json())
     */
    getActiveBrands(): Promise<Brand[]> {
        return Promise.resolve(loadBrands().filter((b) => b.status === true))
    },

    /**
     * Crea una nueva marca.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/brands`, {
     *   method: 'POST', headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify(data)
     * }).then(r => r.json())
     */
    create(data: Omit<Brand, 'id'>): Promise<BrandResult> {
        const brands = loadBrands()
        const isDuplicate = brands.some((b) => b.name.toLowerCase() === data.name.toLowerCase())
        if (isDuplicate) {
            return Promise.resolve({ success: false, error: 'Ya existe una marca con ese nombre.' })
        }
        const newId = brands.length > 0 ? Math.max(...brands.map((b) => b.id)) + 1 : 1
        const newBrand: Brand = { id: newId, ...data }
        brands.push(newBrand)
        saveBrands(brands)
        return Promise.resolve({ success: true, brand: newBrand })
    },

    /**
     * Actualiza una marca existente.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/brands/${brand.id}`, {
     *   method: 'PUT', headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify(brand)
     * }).then(r => r.json())
     */
    update(brand: Brand): Promise<BrandResult> {
        const brands = loadBrands()
        const index = brands.findIndex((b) => b.id === brand.id)
        if (index === -1) return Promise.resolve({ success: false, error: 'Marca no encontrada.' })
        const isDuplicate = brands.some((b) => b.id !== brand.id && b.name.toLowerCase() === brand.name.toLowerCase())
        if (isDuplicate) {
            return Promise.resolve({ success: false, error: 'Ya existe una marca con ese nombre.' })
        }
        brands[index] = brand
        saveBrands(brands)
        return Promise.resolve({ success: true, brand })
    },

    /**
     * Elimina una marca por ID.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/brands/${id}`, {
     *   method: 'DELETE'
     * }).then(r => r.json())
     */
    delete(id: number): Promise<{ success: boolean; error?: string }> {
        const brands = loadBrands()
        const index = brands.findIndex((b) => b.id === id)
        if (index === -1) return Promise.resolve({ success: false, error: 'Marca no encontrada.' })
        brands.splice(index, 1)
        saveBrands(brands)
        return Promise.resolve({ success: true })
    },

    /**
     * Cambia el estado activo/inactivo de una marca.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/brands/${id}/toggle-status`, {
     *   method: 'PATCH'
     * }).then(r => r.json())
     */
    toggleStatus(id: number): Promise<BrandResult> {
        const brands = loadBrands()
        const index = brands.findIndex((b) => b.id === id)
        if (index === -1) return Promise.resolve({ success: false, error: 'Marca no encontrada.' })
        brands[index] = { ...brands[index], status: !brands[index].status }
        saveBrands(brands)
        return Promise.resolve({ success: true, brand: brands[index] })
    }
}
