import { apiCall } from './ApiClient'

// ─── SHA-256 ──────────────────────────────────────────────────────────────────

async function hashPassword(password: string): Promise<string> {
    const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
}

// ─── API shapes ───────────────────────────────────────────────────────────────

interface ApiSessionUser {
    'Nombre Usuario': string
    'Nombre Completo': string
    Correo: string
    Rol: string
    Accesos: string
}

interface ApiPersona {
    ID: number
    'Nombre Completo': string
    'Identificación': string
    'Teléfono': string
    Correo: string
    'Dirección': string
}

// ─── Domain types ─────────────────────────────────────────────────────────────

export interface User {
    username: string
    fullName: string
    email: string
    role: string
    accesos: string
    // Campos editables en checkout — se actualizan con PUT /api/personas
    id: number
    identification: string
    phone: string
    address: string
}

const STORAGE_KEY = 'xstore-session'

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface LoginPayload {
    username: string
    password: string
}

export interface RegisterPayload {
    username: string
    identification: string
    fullName: string
    phone: string
    email: string
    address: string
    password: string
}

export interface AuthResult {
    success: boolean
    user?: User
    error?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mapApiUser = (raw: ApiSessionUser): User => ({
    username: raw['Nombre Usuario'],
    fullName: raw['Nombre Completo'],
    email: raw.Correo,
    role: raw.Rol,
    accesos: raw.Accesos,
    // Estos campos no vienen en el login — se completan al editar perfil
    id: 0,
    identification: '',
    phone: '',
    address: ''
})

async function fetchPersonaData(username: string, email: string): Promise<Partial<User>> {
    try {
        const data = await apiCall<ApiPersona[]>(
            'GET',
            `/api/personas?nombreUsuario=${encodeURIComponent(username)}&busqueda=${encodeURIComponent(email)}`
        )
        if (!data || data.length === 0) return {}
        const p = data[0]
        return {
            id: p.ID,
            identification: p['Identificación'],
            phone: p['Teléfono'],
            address: p['Dirección']
        }
    } catch {
        return {}
    }
}

const saveSession = (user: User): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    }
}

// ─── AuthService ──────────────────────────────────────────────────────────────

export const AuthService = {
    async login(payload: LoginPayload): Promise<AuthResult> {
        try {
            const passwordHash = await hashPassword(payload.password)
            const data = await apiCall<ApiSessionUser[]>('POST', '/api/sesiones/verificar', {
                nombreUsuario: payload.username,
                passwordHash
            })
            if (!data || data.length === 0) {
                return { success: false, error: 'Credenciales incorrectas.' }
            }
            const base = mapApiUser(data[0])
            const extra = await fetchPersonaData(payload.username, base.email)
            const user: User = { ...base, ...extra }
            saveSession(user)
            return { success: true, user }
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    },

    async register(payload: RegisterPayload): Promise<AuthResult> {
        try {
            const passwordHash = await hashPassword(payload.password)
            await apiCall('POST', '/api/usuarios', {
                nombreUsuario: null,
                identificacion: payload.identification,
                nombreCompleto: payload.fullName,
                telefono: payload.phone,
                correo: payload.email,
                direccion: payload.address,
                newUser: payload.username,
                passwordHash,
                nombreRol: 'Cliente',
                esProveedor: false
            })
            const loginResult = await AuthService.login({ username: payload.username, password: payload.password })
            if (loginResult.success && loginResult.user) {
                const enriched: User = {
                    ...loginResult.user,
                    identification: payload.identification,
                    phone: payload.phone,
                    address: payload.address
                }
                saveSession(enriched)
                return { success: true, user: enriched }
            }
            return loginResult
        } catch (e: unknown) {
            return { success: false, error: (e as Error).message }
        }
    },

    updateUser(updatedUser: User): AuthResult {
        saveSession(updatedUser)
        return { success: true, user: updatedUser }
    },

    getCurrentUser(): User | null {
        try {
            const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
            return raw ? (JSON.parse(raw) as User) : null
        } catch {
            return null
        }
    },

    isAuthenticated(): boolean {
        return AuthService.getCurrentUser() !== null
    },

    logout(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY)
        }
    }
}
