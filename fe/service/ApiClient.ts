const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5210'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
    success: boolean
    message: string
    data: T | null
}

// ─── Base client ──────────────────────────────────────────────────────────────

export async function apiCall<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('xstore-token')
        if (token) headers['Authorization'] = `Bearer ${token}`
    }
    const options: RequestInit = { method, headers }
    if (body !== undefined) options.body = JSON.stringify(body)

    const res = await fetch(`${API_BASE}${path}`, options)

    const text = await res.text()
    if (!text) return null as T

    const json: ApiResponse<T> = JSON.parse(text)

    if (!json.success) throw new Error(json.message)
    return json.data as T
}

// ─── Session username ─────────────────────────────────────────────────────────

export function getCurrentUsername(): string {
    if (typeof window === 'undefined') return ''
    try {
        const session = localStorage.getItem('xstore-session')
        return session ? (JSON.parse(session)?.username ?? '') : ''
    } catch {
        return ''
    }
}

// ─── Health ───────────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<boolean> {
    try {
        const res = await fetch(`${API_BASE}/api/health`)
        const json: ApiResponse = await res.json()
        return json.success === true
    } catch {
        return false
    }
}
