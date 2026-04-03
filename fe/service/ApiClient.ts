const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5210'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
    success: boolean
    message: string
    data: T | null
}

// ─── Base client ──────────────────────────────────────────────────────────────

export async function apiCall<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
    const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' }
    }
    if (body !== undefined) options.body = JSON.stringify(body)

    const res = await fetch(`${API_BASE}${path}`, options)
    const json: ApiResponse<T> = await res.json()

    if (!json.success) throw new Error(json.message)
    return json.data as T
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
