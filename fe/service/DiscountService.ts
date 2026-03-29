import { Discount, DiscountResult } from '@/types/discount'

// ─── Mock Seed Data ───────────────────────────────────────────────────────────
// discountTypeId values reference the seed IDs from DiscountTypeService (1, 2, 3).

const SEED_DISCOUNTS: Discount[] = [
    { id: 1, name: 'Oferta de Lanzamiento 10%',  discountTypeId: 1, percentage: 10,  status: true },
    { id: 2, name: 'Liquidación de Temporada 25%', discountTypeId: 2, percentage: 25, status: true },
    { id: 3, name: 'Descuento Especial 50%',       discountTypeId: 3, percentage: 50, status: false }
]

// ─── localStorage Helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = 'xstore-discounts'

const loadDiscounts = (): Discount[] => {
    try {
        if (typeof window === 'undefined') return SEED_DISCOUNTS
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DISCOUNTS))
            return SEED_DISCOUNTS
        }
        return JSON.parse(raw) as Discount[]
    } catch {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DISCOUNTS))
        return SEED_DISCOUNTS
    }
}

const saveDiscounts = (discounts: Discount[]): void => {
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(discounts))
        }
    } catch {
        // Silently fail if localStorage is unavailable
    }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const DiscountService = {
    /**
     * Retorna TODOS los descuentos (activos e inactivos).
     * Usado por el panel de administración.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/discounts`).then(r => r.json())
     */
    getAll(): Promise<Discount[]> {
        return Promise.resolve(loadDiscounts())
    },

    /**
     * Retorna solo los descuentos con status === true.
     * Usado por el formulario de productos y el catálogo.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/discounts?status=active`).then(r => r.json())
     */
    getActiveDiscounts(): Promise<Discount[]> {
        return Promise.resolve(loadDiscounts().filter((d) => d.status === true))
    },

    /**
     * Crea un nuevo descuento.
     * Valida que el porcentaje esté entre 1 y 100.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/discounts`, {
     *   method: 'POST', headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify(data)
     * }).then(r => r.json())
     */
    create(data: Omit<Discount, 'id'>): Promise<DiscountResult> {
        if (data.percentage < 1 || data.percentage > 100) {
            return Promise.resolve({ success: false, error: 'El porcentaje debe estar entre 1 y 100.' })
        }
        const discounts = loadDiscounts()
        const newId = discounts.length > 0 ? Math.max(...discounts.map((d) => d.id)) + 1 : 1
        const newDiscount: Discount = { id: newId, ...data }
        discounts.push(newDiscount)
        saveDiscounts(discounts)
        return Promise.resolve({ success: true, discount: newDiscount })
    },

    /**
     * Actualiza un descuento existente.
     * Valida que el porcentaje esté entre 1 y 100.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/discounts/${discount.id}`, {
     *   method: 'PUT', headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify(discount)
     * }).then(r => r.json())
     */
    update(discount: Discount): Promise<DiscountResult> {
        if (discount.percentage < 1 || discount.percentage > 100) {
            return Promise.resolve({ success: false, error: 'El porcentaje debe estar entre 1 y 100.' })
        }
        const discounts = loadDiscounts()
        const index = discounts.findIndex((d) => d.id === discount.id)
        if (index === -1) return Promise.resolve({ success: false, error: 'Descuento no encontrado.' })
        discounts[index] = discount
        saveDiscounts(discounts)
        return Promise.resolve({ success: true, discount })
    },

    /**
     * Elimina un descuento por ID.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/discounts/${id}`, {
     *   method: 'DELETE'
     * }).then(r => r.json())
     */
    delete(id: number): Promise<{ success: boolean; error?: string }> {
        const discounts = loadDiscounts()
        const index = discounts.findIndex((d) => d.id === id)
        if (index === -1) return Promise.resolve({ success: false, error: 'Descuento no encontrado.' })
        discounts.splice(index, 1)
        saveDiscounts(discounts)
        return Promise.resolve({ success: true })
    },

    /**
     * Cambia el estado activo/inactivo de un descuento.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/discounts/${id}/toggle-status`, {
     *   method: 'PATCH'
     * }).then(r => r.json())
     */
    toggleStatus(id: number): Promise<DiscountResult> {
        const discounts = loadDiscounts()
        const index = discounts.findIndex((d) => d.id === id)
        if (index === -1) return Promise.resolve({ success: false, error: 'Descuento no encontrado.' })
        discounts[index] = { ...discounts[index], status: !discounts[index].status }
        saveDiscounts(discounts)
        return Promise.resolve({ success: true, discount: discounts[index] })
    }
}
