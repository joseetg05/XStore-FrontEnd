import { DiscountType, DiscountTypeResult } from '@/types/discounttype'

// ─── Serialization Helpers ────────────────────────────────────────────────────
// Dates are stored as ISO strings in localStorage and converted back to Date on load.

interface DiscountTypeRaw {
    id: number
    name: string
    startDate: string
    endDate: string
    status: boolean
}

const toRaw = (dt: DiscountType): DiscountTypeRaw => ({
    ...dt,
    startDate: dt.startDate.toISOString(),
    endDate: dt.endDate.toISOString()
})

const fromRaw = (raw: DiscountTypeRaw): DiscountType | null => {
    const startDate = new Date(raw.startDate)
    const endDate = new Date(raw.endDate)
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null
    return { ...raw, startDate, endDate }
}

// ─── Mock Seed Data ───────────────────────────────────────────────────────────
// Dates are calculated dynamically so seed data always appears current.

const buildSeed = (): DiscountType[] => {
    const now = new Date()
    const past30 = new Date(now); past30.setDate(past30.getDate() - 30)
    const future60 = new Date(now); future60.setDate(future60.getDate() + 60)
    const future90 = new Date(now); future90.setDate(future90.getDate() + 90)
    const future120 = new Date(now); future120.setDate(future120.getDate() + 120)

    return [
        { id: 1, name: 'Oferta de Lanzamiento', startDate: past30,  endDate: future60,  status: true },
        { id: 2, name: 'Liquidación de Temporada', startDate: now,    endDate: future90,  status: true },
        { id: 3, name: 'Descuento Especial',    startDate: now,    endDate: future120, status: false }
    ]
}

// ─── localStorage Helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = 'xstore-discount-types'

const loadDiscountTypes = (): DiscountType[] => {
    try {
        if (typeof window === 'undefined') return buildSeed()
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) {
            const seed = buildSeed()
            localStorage.setItem(STORAGE_KEY, JSON.stringify(seed.map(toRaw)))
            return seed
        }
        const parsed = JSON.parse(raw) as DiscountTypeRaw[]
        const result = parsed.map(fromRaw).filter((d): d is DiscountType => d !== null)
        return result.length > 0 ? result : buildSeed()
    } catch {
        const seed = buildSeed()
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed.map(toRaw)))
        return seed
    }
}

const saveDiscountTypes = (types: DiscountType[]): void => {
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(types.map(toRaw)))
        }
    } catch {
        // Silently fail if localStorage is unavailable
    }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const DiscountTypeService = {
    /**
     * Retorna TODOS los tipos de descuento (activos e inactivos).
     * Usado por el panel de administración.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/discount-types`).then(r => r.json())
     */
    getAll(): Promise<DiscountType[]> {
        return Promise.resolve(loadDiscountTypes())
    },

    /**
     * Retorna solo los tipos de descuento con status === true.
     * Usado por el formulario de productos y el catálogo.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/discount-types?status=active`).then(r => r.json())
     */
    getActiveDiscountTypes(): Promise<DiscountType[]> {
        return Promise.resolve(loadDiscountTypes().filter((d) => d.status === true))
    },

    /**
     * Crea un nuevo tipo de descuento.
     * Valida que endDate >= startDate.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/discount-types`, {
     *   method: 'POST', headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify(data)
     * }).then(r => r.json())
     */
    create(data: Omit<DiscountType, 'id'>): Promise<DiscountTypeResult> {
        if (data.endDate < data.startDate) {
            return Promise.resolve({ success: false, error: 'La fecha de fin debe ser mayor o igual a la fecha de inicio.' })
        }
        const types = loadDiscountTypes()
        const newId = types.length > 0 ? Math.max(...types.map((t) => t.id)) + 1 : 1
        const newType: DiscountType = { id: newId, ...data }
        types.push(newType)
        saveDiscountTypes(types)
        return Promise.resolve({ success: true, discountType: newType })
    },

    /**
     * Actualiza un tipo de descuento existente.
     * Valida que endDate >= startDate.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/discount-types/${discountType.id}`, {
     *   method: 'PUT', headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify(discountType)
     * }).then(r => r.json())
     */
    update(discountType: DiscountType): Promise<DiscountTypeResult> {
        if (discountType.endDate < discountType.startDate) {
            return Promise.resolve({ success: false, error: 'La fecha de fin debe ser mayor o igual a la fecha de inicio.' })
        }
        const types = loadDiscountTypes()
        const index = types.findIndex((t) => t.id === discountType.id)
        if (index === -1) return Promise.resolve({ success: false, error: 'Tipo de descuento no encontrado.' })
        types[index] = discountType
        saveDiscountTypes(types)
        return Promise.resolve({ success: true, discountType })
    },

    /**
     * Elimina un tipo de descuento por ID.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/discount-types/${id}`, {
     *   method: 'DELETE'
     * }).then(r => r.json())
     */
    delete(id: number): Promise<{ success: boolean; error?: string }> {
        const types = loadDiscountTypes()
        const index = types.findIndex((t) => t.id === id)
        if (index === -1) return Promise.resolve({ success: false, error: 'Tipo de descuento no encontrado.' })
        types.splice(index, 1)
        saveDiscountTypes(types)
        return Promise.resolve({ success: true })
    },

    /**
     * Cambia el estado activo/inactivo de un tipo de descuento.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/discount-types/${id}/toggle-status`, {
     *   method: 'PATCH'
     * }).then(r => r.json())
     */
    toggleStatus(id: number): Promise<DiscountTypeResult> {
        const types = loadDiscountTypes()
        const index = types.findIndex((t) => t.id === id)
        if (index === -1) return Promise.resolve({ success: false, error: 'Tipo de descuento no encontrado.' })
        types[index] = { ...types[index], status: !types[index].status }
        saveDiscountTypes(types)
        return Promise.resolve({ success: true, discountType: types[index] })
    }
}
