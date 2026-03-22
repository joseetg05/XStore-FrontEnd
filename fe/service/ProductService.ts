// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ProductType {
    id: number;
    name: string;
}

export interface Brand {
    id: number;
    name: string;
}

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
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PRODUCT_TYPES: ProductType[] = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Clothing' },
    { id: 3, name: 'Accessories' },
    { id: 4, name: 'Home & Garden' }
];

const MOCK_BRANDS: Brand[] = [
    { id: 1, name: 'Apple' },
    { id: 2, name: 'Samsung' },
    { id: 3, name: 'Nike' },
    { id: 4, name: 'Adidas' },
    { id: 5, name: 'IKEA' },
    { id: 6, name: 'Sony' }
];

const MOCK_PRODUCTS: Product[] = [
    {
        id: 1,
        productTypeId: 1,
        brandId: 1,
        imageUrl: '/layout/images/products/iPhone 15 Pro 8GB + 256GB Negro.png',
        description: 'iPhone 15 Pro 8GB + 256GB Negro',
        discountId: 0,
        purchasePrice: 700,
        salePrice: 999,
        status: true
    },
    {
        id: 2,
        productTypeId: 1,
        brandId: 2,
        imageUrl: 'https://via.placeholder.com/300x200?text=Galaxy+S24',
        description: 'Galaxy S24',
        discountId: 0,
        purchasePrice: 550,
        salePrice: 849,
        status: true
    },
    {
        id: 3,
        productTypeId: 1,
        brandId: 6,
        imageUrl: 'https://via.placeholder.com/300x200?text=Sony+WH-1000XM5',
        description: 'Sony WH-1000XM5',
        discountId: 0,
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
        description: 'Nike Cap',
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
        status: false // inactive — should NOT appear
    },
    {
        id: 10,
        productTypeId: 2,
        brandId: 4,
        imageUrl: 'https://via.placeholder.com/300x200?text=Adidas+T-Shirt',
        description: 'Adidas T-Shirt',
        discountId: 0,
        purchasePrice: 15,
        salePrice: 35,
        status: true
    }
];

// ─── Service ──────────────────────────────────────────────────────────────────

export const ProductService = {
    /**
     * Returns all available product types.
     */
    getProductTypes(): Promise<ProductType[]> {
        // TODO: habilitar cuando exista backend
        // return fetch(`${process.env.NEXT_PUBLIC_API_URL}/product-types`).then(r => r.json());
        return Promise.resolve(MOCK_PRODUCT_TYPES);
    },

    /**
     * Returns all available brands.
     */
    getBrands(): Promise<Brand[]> {
        // TODO: habilitar cuando exista backend
        // return fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands`).then(r => r.json());
        return Promise.resolve(MOCK_BRANDS);
    },

    /**
     * Returns products applying the given filters.
     * Only active products (status === true) are returned.
     *
     * @param filters - Optional filters for productTypeId, brandId, and search query.
     */
    getProducts(filters?: ProductFilters): Promise<Product[]> {
        // TODO: habilitar cuando exista backend
        // const params = new URLSearchParams();
        // if (filters?.productTypeId) params.append('productTypeId', String(filters.productTypeId));
        // if (filters?.brandId) params.append('brandId', String(filters.brandId));
        // if (filters?.search) params.append('search', filters.search);
        // return fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${params}`).then(r => r.json());

        let results = MOCK_PRODUCTS.filter((p) => p.status === true);

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

        return Promise.resolve(results);
    }
};
