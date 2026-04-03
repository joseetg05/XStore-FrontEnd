export interface Role {
    name: string
    accesos: string
    status: boolean
}

export interface RoleResult {
    success: boolean
    role?: Role
    error?: string
}
