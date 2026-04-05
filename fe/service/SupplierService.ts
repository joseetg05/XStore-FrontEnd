import { apiCall, getCurrentUsername } from './ApiClient'
import { Supplier, SupplierResult } from '@/types/supplier'

// ─── API shape ────────────────────────────────────────────────────────────────

interface ApiSupplier {
    'Nombre Completo': string
    'Identificación': string
    'Teléfono': string
    'Correo': string
    'Dirección': string
    'Estado': string
}

const fromApi = (s: ApiSupplier, index: number): Supplier => ({
    id: index + 1,
    name: s['Nombre Completo'],
    identification: s['Identificación'],
    phone: s['Teléfono'],
    email: s['Correo'],
    address: s['Dirección'],
    status: s['Estado'] === 'Activo'
})

// ─── Service ──────────────────────────────────────────────────────────────────

export const SupplierService = {
    async getAll(): Promise<Supplier[]> {
        const u = getCurrentUsername()
        if (!u) return []
        try {
            const data = await apiCall<ApiSupplier[]>('GET', `/api/proveedores?nombreUsuario=${u}`)
            return (data ?? []).map((s, i) => fromApi(s, i))
        } catch {
            return []
        }
    },

    async create(supplier: Omit<Supplier, 'id'>): Promise<SupplierResult> {
        try {
            await apiCall('POST', '/api/proveedores', {
                nombreUsuario: getCurrentUsername(),
                identificacion: supplier.identification,
                nombreCompleto: supplier.name,
                telefono: supplier.phone,
                correo: supplier.email,
                direccion: supplier.address
            })
            return { success: true }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    },

    async update(supplier: Supplier): Promise<SupplierResult> {
        try {
            await apiCall('PUT', '/api/proveedores', {
                nombreUsuario: getCurrentUsername(),
                identificacion: supplier.identification,
                nuevoNombre: supplier.name,
                nuevoTelefono: supplier.phone,
                nuevoCorreo: supplier.email,
                nuevaDireccion: supplier.address,
                nuevoEstado: supplier.status
            })
            return { success: true, supplier }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    },

    async toggleStatus(identification: string, currentStatus: boolean): Promise<SupplierResult> {
        try {
            await apiCall('PUT', '/api/proveedores', {
                nombreUsuario: getCurrentUsername(),
                identificacion: identification,
                nuevoEstado: !currentStatus
            })
            return { success: true }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    }
}
