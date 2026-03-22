// ─── Interfaces ───────────────────────────────────────────────────────────────

/**
 * Maps to the backend table columns:
 * PER_ID, PER_Identificacion, PER_NombreCompleto, PER_Telefono,
 * PER_Correo, PER_Direccion, PER_FechaRegistro, FK PER_TIPO_PER_ID, PER_Estado
 */
export interface User {
    id: number;
    identification: string;
    fullName: string;
    phone: string;
    email: string;
    address: string;
    registrationDate: string;
    personTypeId: number;
    status: boolean;
    /** Only used to simulate login validation — never sent to a real backend in plaintext */
    password?: string;
}

const STORAGE_KEY = 'xstore-session';

// ─── Mock Seed Users ──────────────────────────────────────────────────────────

const MOCK_USERS: User[] = [
    {
        id: 1,
        identification: '1-0234-0567',
        fullName: 'José Alberto Torres Ramírez',
        phone: '+506 8888-1234',
        email: 'jose@xstore.cr',
        address: 'San José, Escazú, Trejos Montealegre, residencial Las Palmas #24',
        registrationDate: '2024-01-15T08:00:00Z',
        personTypeId: 1,
        status: true,
        password: '1234'
    }
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const loadUsers = (): User[] => {
    try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('xstore-users') : null;
        if (!raw) return MOCK_USERS;
        const parsed: User[] = JSON.parse(raw);
        // Merge seed users in case localStorage was cleared of them
        const ids = new Set(parsed.map((u) => u.email));
        for (const seed of MOCK_USERS) {
            if (!ids.has(seed.email)) parsed.push(seed);
        }
        return parsed;
    } catch {
        return MOCK_USERS;
    }
};

const saveUsers = (users: User[]): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('xstore-users', JSON.stringify(users));
    }
};

// ─── AuthService ──────────────────────────────────────────────────────────────

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    identification: string;
    fullName: string;
    phone: string;
    email: string;
    address: string;
    password: string;
}

export interface AuthResult {
    success: boolean;
    user?: User;
    error?: string;
}

export const AuthService = {
    /**
     * Validates credentials against mock user list.
     *
     * TODO: habilitar cuando exista backend real
     * const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
     *   method: 'POST',
     *   headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify(payload)
     * });
     * const data = await response.json();
     * if (!response.ok) return { success: false, error: data.message };
     * localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
     * return { success: true, user: data.user };
     */
    login(payload: LoginPayload): Promise<AuthResult> {
        const users = loadUsers();
        const user = users.find(
            (u) => u.email.toLowerCase() === payload.email.toLowerCase() && u.password === payload.password
        );
        if (!user) {
            return Promise.resolve({ success: false, error: 'Correo o contraseña incorrectos.' });
        }
        const { password, ...safeUser } = user;
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
        }
        return Promise.resolve({ success: true, user: safeUser });
    },

    /**
     * Creates a new mock user account and auto-authenticates them.
     *
     * TODO: habilitar cuando exista backend real
     * const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
     *   method: 'POST',
     *   headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify(payload)
     * });
     * const data = await response.json();
     * if (!response.ok) return { success: false, error: data.message };
     * localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
     * return { success: true, user: data.user };
     */
    register(payload: RegisterPayload): Promise<AuthResult> {
        const users = loadUsers();
        const exists = users.find((u) => u.email.toLowerCase() === payload.email.toLowerCase());
        if (exists) {
            return Promise.resolve({ success: false, error: 'Ya existe una cuenta con ese correo.' });
        }
        const newUser: User = {
            id: Date.now(),
            identification: payload.identification,
            fullName: payload.fullName,
            phone: payload.phone,
            email: payload.email,
            address: payload.address,
            registrationDate: new Date().toISOString(),
            personTypeId: 1,
            status: true,
            password: payload.password
        };
        users.push(newUser);
        saveUsers(users);
        const { password, ...safeUser } = newUser;
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
        }
        return Promise.resolve({ success: true, user: safeUser });
    },

    /**
     * Returns the currently authenticated user from localStorage, or null.
     */
    getCurrentUser(): User | null {
        try {
            const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
            return raw ? (JSON.parse(raw) as User) : null;
        } catch {
            return null;
        }
    },

    /**
     * Returns true if a session is active.
     */
    isAuthenticated(): boolean {
        return AuthService.getCurrentUser() !== null;
    },

    /**
     * Updates an existing mock user's information.
     *
     * TODO: habilitar cuando exista backend real
     * const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${user.id}`, {
     *   method: 'PUT',
     *   headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify(user)
     * });
     * const data = await response.json();
     * if (!response.ok) return { success: false, error: data.message };
     * localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
     * return { success: true, user: data.user };
     */
    updateUser(updatedUser: User): Promise<AuthResult> {
        const users = loadUsers();
        const index = users.findIndex((u) => u.id === updatedUser.id);
        if (index === -1) {
            return Promise.resolve({ success: false, error: 'Usuario no encontrado.' });
        }
        
        // Preserve password if not provided in updatedUser
        const currentPassword = users[index].password;
        users[index] = { ...updatedUser, password: updatedUser.password || currentPassword };
        
        saveUsers(users);
        
        if (typeof window !== 'undefined') {
            const currentSession = AuthService.getCurrentUser();
            if (currentSession && currentSession.id === updatedUser.id) {
                const { password, ...safeUser } = users[index];
                localStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
            }
        }
        
        return Promise.resolve({ success: true, user: updatedUser });
    },

    /**
     * Clears the current session.
     *
     * TODO: habilitar cuando exista backend real
     * await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { method: 'POST' });
     */
    logout(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
        }
    }
};
