import { apiCall, getCurrentUsername } from './ApiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuditEntry {
    dateTime: string;
    username: string;
    operationType: string;
    affectedTable: string;
    affectedRow: number;
    description: string;
    before: string;
    after: string;
}

export interface AuditFilters {
    fechaFiltro?: string;
    tablaFiltro?: string;
}

// ─── API shape ────────────────────────────────────────────────────────────────

interface ApiAudit {
    'Responsable': string;
    'Acción': string;
    'Tabla Afectada': string;
    'Fila Afectada': number;
    'Descripción': string;
    'Antes': string;
    'Después': string;
    'Fecha y Hora': string;
}

const fromApi = (a: ApiAudit): AuditEntry => ({
    dateTime: a['Fecha y Hora'] ?? '',
    username: a['Responsable'] ?? '',
    operationType: a['Acción'] ?? '',
    affectedTable: a['Tabla Afectada'] ?? '',
    affectedRow: a['Fila Afectada'] ?? 0,
    description: a['Descripción'] ?? '',
    before: a['Antes'] ?? '',
    after: a['Después'] ?? ''
});

// ─── Service ──────────────────────────────────────────────────────────────────

export const AuditService = {
    async getAll(filters?: AuditFilters): Promise<AuditEntry[]> {
        const u = getCurrentUsername();
        try {
            const params = new URLSearchParams({ nombreUsuario: u });
            if (filters?.fechaFiltro) params.append('fechaFiltro', filters.fechaFiltro);
            if (filters?.tablaFiltro) params.append('tablaFiltro', filters.tablaFiltro);

            const data = await apiCall<ApiAudit[]>('GET', `/api/auditorias?${params}`);
            return (data ?? []).map(fromApi);
        } catch {
            return [];
        }
    }
};
