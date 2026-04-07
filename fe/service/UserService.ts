import { apiCall, getCurrentUsername } from './ApiClient'
import { AuthService } from './AuthService'

async function hashPassword(password: string): Promise<string> {
    const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PersonaUser {
    id: number
    username: string
    fullName: string
    identification: string
    phone: string
    email: string
    address: string
    role: string
    tipoPersona: string
    descuento: string
    fechaRegistro: string
    estado: string
}

export interface UpdateUserPayload {
    identification: string
    fullName: string
    phone: string
    email: string
    address: string
}

export interface UpdateSessionPayload {
    nombreUsuarioAModificar: string
    nuevoNombreUsuario?: string | null
    nuevaPasswordHash?: string | null
    nuevoRol?: string | null
    nuevoEstado?: boolean | null
}

export interface CreateUserPayload {
    identificacion: string
    nombreCompleto: string
    telefono?: string
    correo?: string
    direccion?: string
    tipoPersona?: string
    newUser: string
    password: string
    nombreRol: string
    esProveedor?: boolean
}

export interface UserResult {
    success: boolean
    error?: string
}

// ─── API shape ────────────────────────────────────────────────────────────────

interface ApiPersona {
    'Identificación': string
    'Nombre Completo': string
    'Teléfono': string
    Correo: string
    'Dirección': string
    'Tipo Persona': string
    'Descuento %': string
    'Rol': string
    'Nombre Usuario': string
    'Fecha Registro': string
    'Estado': string
}

const fromApi = (p: ApiPersona, index: number): PersonaUser => ({
    id: index,
    username: p['Nombre Usuario'] !== 'N/A' ? p['Nombre Usuario'] : '',
    fullName: p['Nombre Completo'] ?? '',
    identification: p['Identificación'] ?? '',
    phone: p['Teléfono'] ?? '',
    email: p.Correo ?? '',
    address: p['Dirección'] ?? '',
    role: p['Rol'] ?? '',
    tipoPersona: p['Tipo Persona'] ?? '',
    descuento: p['Descuento %'] ?? '',
    fechaRegistro: p['Fecha Registro'] ?? '',
    estado: p['Estado'] ?? ''
})

// ─── Service ──────────────────────────────────────────────────────────────────

export const UserService = {
    async getAll(): Promise<PersonaUser[]> {
        const u = getCurrentUsername()
        if (!u) return []
        try {
            const data = await apiCall<ApiPersona[]>('GET', `/api/personas?nombreUsuario=${encodeURIComponent(u)}`)
            return (data ?? []).map((p, i) => fromApi(p, i))
        } catch {
            return []
        }
    },

    async getOwn(): Promise<PersonaUser | null> {
        const u = getCurrentUsername()
        if (!u) return null
        try {
            const data = await apiCall<ApiPersona[]>('GET', `/api/personas?nombreUsuario=${encodeURIComponent(u)}&busqueda=${encodeURIComponent(u)}`)
            if (!data || data.length === 0) return null
            return fromApi(data[0], 0)
        } catch {
            return null
        }
    },

    // Tasks 1.2 + 1.3 — update and sync session if editing own profile
    async updateUser(payload: UpdateUserPayload): Promise<UserResult> {
        try {
            await apiCall('PUT', '/api/personas', {
                identificacion: payload.identification,
                nuevoNombre: payload.fullName || null,
                nuevoTelefono: payload.phone ?? null,
                nuevoCorreo: payload.email ?? null,
                nuevaDireccion: payload.address ?? null
            })

            // Sync local session if editing own profile
            const current = AuthService.getCurrentUser()
            if (current && current.identification === payload.identification) {
                AuthService.updateUser({
                    ...current,
                    fullName: payload.fullName,
                    phone: payload.phone,
                    email: payload.email,
                    address: payload.address
                })
            }

            return { success: true }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    },

    async createUser(payload: CreateUserPayload): Promise<UserResult> {
        try {
            const hashedPassword = await hashPassword(payload.password)
            await apiCall('POST', '/api/usuarios', {
                nombreUsuario: getCurrentUsername() || null,
                identificacion: payload.identificacion,
                nombreCompleto: payload.nombreCompleto,
                telefono: payload.telefono || null,
                correo: payload.correo || null,
                direccion: payload.direccion || null,
                tipoPersona: payload.tipoPersona || null,
                newUser: payload.newUser,
                passwordHash: hashedPassword,
                nombreRol: payload.nombreRol,
                esProveedor: payload.esProveedor ?? false
            })
            return { success: true }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    },

    async updateSession(payload: UpdateSessionPayload): Promise<UserResult> {
        try {
            const hashedPassword = payload.nuevaPasswordHash
                ? await hashPassword(payload.nuevaPasswordHash)
                : null

            await apiCall('PUT', '/api/sesiones', {
                nombreUsuario: getCurrentUsername(),
                nombreUsuarioAModificar: payload.nombreUsuarioAModificar,
                nuevoNombreUsuario: payload.nuevoNombreUsuario ?? null,
                nuevaPasswordHash: hashedPassword,
                nuevoRol: payload.nuevoRol ?? null,
                nuevoEstado: payload.nuevoEstado ?? null
            })
            return { success: true }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    }
}
