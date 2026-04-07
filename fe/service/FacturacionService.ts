import { apiCall, getCurrentUsername } from './ApiClient'
import { CartItem } from '../context/CartContext'
import { User } from './AuthService'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FacturaPayload {
    nombreUsuario: string
    identificacionCliente: string
    nombreUbicacion: string
    productosJSON: string
    direccionEntrega?: string | null
    observacionesEntrega?: string | null
    diasEntrega?: number
    costoPorDiaEnvio?: number
}

export interface FacturaEncabezado {
    'Número Factura': string
    'Fecha y Hora': string
    'Sucursal': string
    'Cliente': string
    'Identificación': string
    'Tipo Cliente': string
    'Atendido por': string
    'Subtotal': number
    'Descuento Total': number
    'IVA %': number
    'IVA': number
    'Costo Envío': number
    'Total': number
    'Con Entrega': string
    'Fecha Entrega'?: string
    'Dirección Entrega'?: string
    'Observaciones'?: string
    'Estado Entrega': string
    'Categoría Anterior': string
    'Categoría Actual': string
    'Upgrade'?: string
}

export interface FacturaDetalle {
    'Cantidad': number
    'Producto': string
    'Tipo': string
    'Marca': string
    'Precio Unitario': number
    'Descuento Producto': string
    'Descuento Cliente %': number
    'Monto Descuento': number
    'Subtotal Línea': number
    'Total Línea': number
}

export interface FacturaResult {
    encabezado: FacturaEncabezado
    detalle: FacturaDetalle[]
}

// ─── Helper ───────────────────────────────────────────────────────────────────

export function buildFacturaPayload(cartItems: CartItem[], customer: User): FacturaPayload {
    const nombreUbicacion = cartItems[0]?.product.location || 'Bodega Central'

    const productos = cartItems.map((item) => ({
        PRD_Descripcion: item.product.description,
        TipoProducto: item.product.type,
        Marca: item.product.brand,
        Proveedor: item.product.provider,
        Cantidad: item.quantity
    }))

    return {
        nombreUsuario: getCurrentUsername(),
        identificacionCliente: customer.identification,
        nombreUbicacion,
        productosJSON: JSON.stringify(productos),
        direccionEntrega: customer.address || null
    }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const FacturacionService = {
    async emitirFactura(payload: FacturaPayload): Promise<FacturaResult> {
        return apiCall<FacturaResult>('POST', '/api/facturas', payload)
    }
}
