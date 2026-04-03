import { BrandService } from './BrandService'
import { ProductTypeService } from './ProductTypeService'

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ProductType {
    id: number;
    name: string;
}

export interface Brand {
    id: number;
    name: string;
}

export interface Discount {
    id: number;
    name: string;
    percentage: number; // e.g., 20 for 20%
}

/**
 * Maps to the backend table columns:
 * PRD_ID, PRD_TIPO_PRD_ID, PRD_MARCA_PRD_ID, PRD_RutaImagen,
 * PRD_Descripcion, PRD_DESC_ID, PRD_PrecioCompra, PRD_PrecioVenta, PRD_Estado
 */
export interface Product {
    id: number;
    productTypeId: number;
    brandId: number;
    imageUrl: string;
    description: string;
    discountId: number;
    purchasePrice: number;
    salePrice: number;
    status: boolean;
}

export interface ProductFilters {
    productTypeId?: number | null;
    brandId?: number | null;
    search?: string;
    sortBy?: 'price' | 'description';
    sortOrder?: 'asc' | 'desc';
}

export interface ProductResult {
    success: boolean;
    product?: Product;
    error?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PRODUCT_TYPES: ProductType[] = [
    { id: 1, name: 'Celulares' },
    { id: 2, name: 'Ropa' },
    { id: 3, name: 'Accesorios' },
    { id: 4, name: 'Hogar y Jardín' }
];

const MOCK_BRANDS: Brand[] = [
    { id: 1, name: 'Apple' },
    { id: 2, name: 'Motorola' },
    { id: 3, name: 'Nike' },
    { id: 4, name: 'Adidas' },
    { id: 5, name: 'IKEA' },
    { id: 6, name: 'Sony' }
];

const MOCK_DISCOUNTS: Discount[] = [
    { id: 1, name: 'Oferta de Lanzamiento', percentage: 10 },
    { id: 2, name: 'Liquidación de Temporada', percentage: 25 },
    { id: 3, name: 'Descuento Especial', percentage: 50 }
];

const MOCK_PRODUCTS: Product[] = [
    {
        id: 1,
        productTypeId: 1,
        brandId: 1,
        imageUrl: '/layout/images/products/iPhone 15 Pro 8GB + 256GB Negro.png',
        description: 'iPhone 15 Pro 8GB + 256GB Negro',
        discountId: 1,
        purchasePrice: 700000,
        salePrice: 1009900,
        status: true
    },
    {
        id: 2,
        productTypeId: 1,
        brandId: 2,
        imageUrl: '/layout/images/products/Motorola G56 8GB + 256GB Verde.png',
        description: 'Motorola G56 8GB + 256GB Verde',
        discountId: 2,
        purchasePrice: 60000,
        salePrice: 99895,
        status: true
    },
    {
        id: 3,
        productTypeId: 2,
        brandId: 6,
        imageUrl: 'https://via.placeholder.com/300x200?text=Sony+WH-1000XM5',
        description: 'Sony WH-1000XM5',
        discountId: 2,
        purchasePrice: 200,
        salePrice: 349,
        status: true
    },
    {
        id: 4,
        productTypeId: 2,
        brandId: 3,
        imageUrl: 'https://via.placeholder.com/300x200?text=Nike+Air+Max',
        description: 'Nike Air Max',
        discountId: 0,
        purchasePrice: 60,
        salePrice: 120,
        status: true
    },
    {
        id: 5,
        productTypeId: 2,
        brandId: 4,
        imageUrl: 'https://via.placeholder.com/300x200?text=Adidas+Ultraboost',
        description: 'Adidas Ultraboost',
        discountId: 1,
        purchasePrice: 80,
        salePrice: 180,
        status: true
    },
    {
        id: 6,
        productTypeId: 3,
        brandId: 1,
        imageUrl: 'https://via.placeholder.com/300x200?text=Apple+Watch+S9',
        description: 'Apple Watch S9',
        discountId: 0,
        purchasePrice: 250,
        salePrice: 399,
        status: true
    },
    {
        id: 7,
        productTypeId: 3,
        brandId: 3,
        imageUrl: 'https://via.placeholder.com/300x200?text=Nike+Cap',
        description: 'Gorra Nike',
        discountId: 0,
        purchasePrice: 12,
        salePrice: 30,
        status: true
    },
    {
        id: 8,
        productTypeId: 4,
        brandId: 5,
        imageUrl: 'https://via.placeholder.com/300x200?text=IKEA+KALLAX',
        description: 'IKEA KALLAX',
        discountId: 0,
        purchasePrice: 40,
        salePrice: 79,
        status: true
    },
    {
        id: 9,
        productTypeId: 1,
        brandId: 2,
        imageUrl: 'https://via.placeholder.com/300x200?text=Samsung+TV+55',
        description: 'Samsung TV 55"',
        discountId: 0,
        purchasePrice: 350,
        salePrice: 699,
        status: false // inactive — should NOT appear in catalog
    },
    {
        id: 10,
        productTypeId: 2,
        brandId: 4,
        imageUrl: 'https://via.placeholder.com/300x200?text=Adidas+T-Shirt',
        description: 'Camiseta Adidas',
        discountId: 3,
        purchasePrice: 15,
        salePrice: 35,
        status: true
    }
];

// ─── localStorage Helpers ─────────────────────────────────────────────────────

const PRODUCTS_STORAGE_KEY = 'xstore-products';

const loadProducts = (): Product[] => {
    try {
        if (typeof window === 'undefined') return MOCK_PRODUCTS;
        const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
        if (!raw) {
            // Seed localStorage with mock data on first load
            localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(MOCK_PRODUCTS));
            return MOCK_PRODUCTS;
        }
        return JSON.parse(raw) as Product[];
    } catch {
        return MOCK_PRODUCTS;
    }
};

const saveProducts = (products: Product[]): void => {
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
        }
    } catch {
        // Silently fail if localStorage is unavailable
    }
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const ProductService = {
    getProductTypes(): Promise<ProductType[]> {
        return ProductTypeService.getActiveProductTypes()
    },

    getBrands(): Promise<Brand[]> {
        return BrandService.getActiveBrands()
    },

    /**
     * Retorna todos los descuentos disponibles.
     */
    getDiscounts(): Promise<Discount[]> {
        // TODO: habilitar cuando exista backend real
        // return fetch(`${process.env.NEXT_PUBLIC_API_URL}/discounts`).then(r => r.json());
        return Promise.resolve(MOCK_DISCOUNTS);
    },

    /**
     * Retorna TODOS los productos (activos e inactivos).
     * Usado por el panel de administración.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products`).then(r => r.json());
     */
    getAllProducts(): Promise<Product[]> {
        return Promise.resolve(loadProducts());
    },

    /**
     * Retorna solo los productos activos (status === true).
     * Usado por el catálogo público.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?status=active`).then(r => r.json());
     */
    getActiveProducts(filters?: ProductFilters): Promise<Product[]> {
        let results = loadProducts().filter((p) => p.status === true);

        if (filters?.productTypeId) {
            results = results.filter((p) => p.productTypeId === filters.productTypeId);
        }
        if (filters?.brandId) {
            results = results.filter((p) => p.brandId === filters.brandId);
        }
        if (filters?.search && filters.search.trim() !== '') {
            const query = filters.search.trim().toLowerCase();
            results = results.filter((p) => p.description.toLowerCase().includes(query));
        }
        if (filters?.sortBy) {
            const order = filters.sortOrder === 'desc' ? -1 : 1;
            const field = filters.sortBy === 'price' ? 'salePrice' : 'description';
            results.sort((a, b) => {
                const valA = a[field as keyof Product];
                const valB = b[field as keyof Product];
                if (typeof valA === 'string' && typeof valB === 'string') return valA.localeCompare(valB) * order;
                if (typeof valA === 'number' && typeof valB === 'number') return (valA - valB) * order;
                return 0;
            });
        }

        return Promise.resolve(results);
    },

    /**
     * Alias for backwards compatibility — delegates to getActiveProducts with filters.
     */
    getProducts(filters?: ProductFilters): Promise<Product[]> {
        return ProductService.getActiveProducts(filters);
    },

    /**
     * Creates a new product and persists it.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products`, {
     *   method: 'POST', headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify(productData)
     * }).then(r => r.json());
     */
    createProduct(productData: Omit<Product, 'id'>): Promise<ProductResult> {
        const products = loadProducts();
        const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
        const newProduct: Product = { id: newId, ...productData };
        products.push(newProduct);
        saveProducts(products);
        return Promise.resolve({ success: true, product: newProduct });
    },

    /**
     * Updates an existing product and persists the change.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/${product.id}`, {
     *   method: 'PUT', headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify(product)
     * }).then(r => r.json());
     */
    updateProduct(product: Product): Promise<ProductResult> {
        const products = loadProducts();
        const index = products.findIndex((p) => p.id === product.id);
        if (index === -1) return Promise.resolve({ success: false, error: 'Producto no encontrado.' });
        products[index] = product;
        saveProducts(products);
        return Promise.resolve({ success: true, product });
    },

    /**
     * Deletes a product by ID.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/${id}`, {
     *   method: 'DELETE'
     * }).then(r => r.json());
     */
    deleteProduct(id: number): Promise<{ success: boolean; error?: string }> {
        const products = loadProducts();
        const index = products.findIndex((p) => p.id === id);
        if (index === -1) return Promise.resolve({ success: false, error: 'Producto no encontrado.' });
        products.splice(index, 1);
        saveProducts(products);
        return Promise.resolve({ success: true });
    },

    /**
     * Toggles the status (active/inactive) of a product.
     *
     * TODO: habilitar cuando exista backend real
     * return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/products/${id}/toggle-status`, {
     *   method: 'PATCH'
     * }).then(r => r.json());
     */
    toggleProductStatus(id: number): Promise<ProductResult> {
        const products = loadProducts();
        const index = products.findIndex((p) => p.id === id);
        if (index === -1) return Promise.resolve({ success: false, error: 'Producto no encontrado.' });
        products[index] = { ...products[index], status: !products[index].status };
        saveProducts(products);
        return Promise.resolve({ success: true, product: products[index] });
    }
};
