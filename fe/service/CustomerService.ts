// ─── Interfaces ───────────────────────────────────────────────────────────────

/**
 * Maps to the backend table columns:
 * PER_ID, PER_Identificacion, PER_NombreCompleto, PER_Telefono,
 * PER_Correo, PER_Direccion, PER_FechaRegistro, FK PER_TIPO_PER_ID, PER_Estado
 */
export interface Customer {
    id: number;
    identification: string;
    fullName: string;
    phone: string;
    email: string;
    address: string;
    registrationDate: string;
    personTypeId: number;
    status: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_CUSTOMER: Customer = {
    id: 1,
    identification: '1-0234-0567',
    fullName: 'José Alberto Torres Ramírez',
    phone: '+506 8888-1234',
    email: 'jose.torres@correo.cr',
    address: 'San José, Escazú, Trejos Montealegre, residencial Las Palmas #24',
    registrationDate: '2024-01-15T08:00:00Z',
    personTypeId: 1,
    status: true
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const CustomerService = {
    /**
     * Retorna la información del cliente autenticado actualmente.
     *
     * TODO: habilitar cuando exista backend/autenticación real
     * const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
     *   headers: { Authorization: `Bearer ${token}` }
     * });
     * return response.json() as Promise<Customer>;
     */
    getCustomer(): Promise<Customer> {
        return Promise.resolve(MOCK_CUSTOMER);
    }
};
