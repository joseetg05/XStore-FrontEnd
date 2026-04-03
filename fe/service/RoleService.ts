import { apiCall, getCurrentUsername } from './ApiClient'
import { Role, RoleResult } from '@/types/role'

// ─── API shape ────────────────────────────────────────────────────────────────

interface ApiRole {
    Rol: string
    Accesos: string
    'Estado Rol': string
}

const fromApi = (r: ApiRole): Role => ({
    name: r.Rol,
    accesos: r.Accesos,
    status: r['Estado Rol'] === 'Activo'
})

// ─── Service ──────────────────────────────────────────────────────────────────

export const RoleService = {
    async getAll(): Promise<Role[]> {
        const u = getCurrentUsername()
        if (!u) return []
        const data = await apiCall<ApiRole[]>('GET', `/api/roles?nombreUsuario=${u}`)
        return (data ?? []).map(fromApi)
    },

    async create(role: Role): Promise<RoleResult> {
        try {
            await apiCall('POST', '/api/roles', {
                nombreUsuario: getCurrentUsername(),
                nombre: role.name,
                accesos: role.accesos
            })
            return { success: true, role }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    },

    async update(originalName: string, role: Role): Promise<RoleResult> {
        try {
            await apiCall('PUT', '/api/roles', {
                nombreUsuario: getCurrentUsername(),
                nombre: originalName,
                nuevoNombre: role.name,
                nuevosAccesos: role.accesos,
                nuevoEstado: role.status
            })
            return { success: true, role }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    },

    async delete(name: string): Promise<{ success: boolean; error?: string }> {
        try {
            await apiCall('PUT', '/api/roles', {
                nombreUsuario: getCurrentUsername(),
                nombre: name,
                nuevoEstado: false
            })
            return { success: true }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    },

    async toggleStatus(name: string, currentStatus: boolean): Promise<RoleResult> {
        const newStatus = !currentStatus
        try {
            await apiCall('PUT', '/api/roles', {
                nombreUsuario: getCurrentUsername(),
                nombre: name,
                nuevoEstado: newStatus
            })
            return { success: true, role: { name, accesos: '', status: newStatus } }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    }
}
