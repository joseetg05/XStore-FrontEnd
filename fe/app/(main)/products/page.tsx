'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Sidebar } from 'primereact/sidebar';
import { Tag } from 'primereact/tag';

import { CartProvider, useCart } from '../../../context/CartContext';
import { Brand, Product, ProductFilters, ProductService, ProductType } from '../../../service/ProductService';
import CartSidebar from './CartSidebar';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
    value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

// ─── Product Card ─────────────────────────────────────────────────────────────

interface ProductCardProps {
    product: Product;
    brands: Brand[];
    productTypes: ProductType[];
    onView: (product: Product) => void;
    onAddToCart: (product: Product) => void;
}

const ProductCard = ({ product, brands, productTypes, onView, onAddToCart }: ProductCardProps) => {
    const brand = brands.find((b) => b.id === product.brandId);
    const type = productTypes.find((t) => t.id === product.productTypeId);

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = 'https://static.thenounproject.com/png/504708-200.png';
    };

    const header = (
        <div className="flex align-items-center justify-content-center bg-gray-50 p-3" style={{ height: '220px', borderRadius: '8px 8px 0 0', overflow: 'hidden' }}>
            <img
                src={product.imageUrl}
                alt={product.description}
                onError={handleImageError}
                style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
        </div>
    );

    return (
        <Card header={header} className="shadow-2 border-round-xl" style={{ overflow: 'hidden' }}>
            <div className="flex flex-column gap-2">
                <div className="flex align-items-start justify-content-between gap-2">
                    <h5 className="m-0 text-900 font-semibold line-height-2" style={{ fontSize: '1rem' }}>
                        {product.description}
                    </h5>
                </div>

                <div className="flex gap-2 flex-wrap">
                    {type && (
                        <Tag value={type.name} severity="info" rounded />
                    )}
                    {brand && (
                        <Tag value={brand.name} severity="warning" rounded />
                    )}
                </div>

                <Divider className="my-1" />

                <div className="flex align-items-center justify-content-between">
                    <div>
                        <span className="text-500 text-sm">Sale price</span>
                        <div className="text-900 font-bold text-xl" style={{ color: 'var(--primary-color)' }}>
                            {formatCurrency(product.salePrice)}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            icon="pi pi-cart-plus"
                            size="small"
                            tooltip="Add to cart"
                            tooltipOptions={{ position: 'top' }}
                            rounded
                            onClick={() => onAddToCart(product)}
                        />
                        <Button
                            icon="pi pi-eye"
                            size="small"
                            outlined
                            rounded
                            tooltip="Preview"
                            tooltipOptions={{ position: 'top' }}
                            onClick={() => onView(product)}
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = () => (
    <div className="col-12 flex flex-column align-items-center justify-content-center py-8 text-center">
        <i className="pi pi-search" style={{ fontSize: '3rem', color: 'var(--text-color-secondary)' }}></i>
        <h4 className="mt-3 mb-1 text-900">No products found</h4>
        <p className="text-500 m-0">Try adjusting your filters or clearing your search.</p>
    </div>
);

// ─── Filter Sidebar ───────────────────────────────────────────────────────────

interface FilterSidebarProps {
    visible: boolean;
    onHide: () => void;
    productTypes: ProductType[];
    brands: Brand[];
    selectedTypeId: number | null;
    selectedBrandId: number | null;
    onTypeChange: (id: number | null) => void;
    onBrandChange: (id: number | null) => void;
    onClear: () => void;
}

const FilterSidebar = ({
    visible,
    onHide,
    productTypes,
    brands,
    selectedTypeId,
    selectedBrandId,
    onTypeChange,
    onBrandChange,
    onClear
}: FilterSidebarProps) => {
    const typeOptions = [{ id: null, name: 'All types' }, ...productTypes];
    const brandOptions = [{ id: null, name: 'All brands' }, ...brands];

    return (
        <Sidebar visible={visible} onHide={onHide} header="Filters" className="w-full md:w-20rem">
            <div className="flex flex-column gap-4 pt-2">
                <div>
                    <label className="block text-900 font-medium mb-2">Product Type</label>
                    <Dropdown
                        value={selectedTypeId}
                        options={typeOptions}
                        optionLabel="name"
                        optionValue="id"
                        onChange={(e) => onTypeChange(e.value)}
                        placeholder="Select a type"
                        className="w-full"
                    />
                </div>

                <div>
                    <label className="block text-900 font-medium mb-2">Brand</label>
                    <Dropdown
                        value={selectedBrandId}
                        options={brandOptions}
                        optionLabel="name"
                        optionValue="id"
                        onChange={(e) => onBrandChange(e.value)}
                        placeholder="Select a brand"
                        className="w-full"
                    />
                </div>

                <Divider />

                <Button label="Clear Filters" icon="pi pi-times" severity="secondary" outlined onClick={onClear} />
            </div>
        </Sidebar>
    );
};

// ─── Products Page Inner (needs CartProvider above) ───────────────────────────

const ProductsPageInner = () => {
    const { addToCart, getTotals } = useCart();
    const { totalItems } = getTotals();

    const [products, setProducts] = useState<Product[]>([]);
    const [productTypes, setProductTypes] = useState<ProductType[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);

    const [filterVisible, setFilterVisible] = useState(false);
    const [cartVisible, setCartVisible] = useState(false);
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
    const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [displayProductDialog, setDisplayProductDialog] = useState(false);

    // Load reference data once
    useEffect(() => {
        Promise.all([ProductService.getProductTypes(), ProductService.getBrands()]).then(([types, brands]) => {
            setProductTypes(types);
            setBrands(brands);
        });
    }, []);

    // Fetch products whenever filters change
    const fetchProducts = useCallback(() => {
        setLoading(true);
        const filters: ProductFilters = {
            productTypeId: selectedTypeId ?? undefined,
            brandId: selectedBrandId ?? undefined,
            search: searchQuery
        };
        ProductService.getProducts(filters).then((data) => {
            setProducts(data);
            setLoading(false);
        });
    }, [selectedTypeId, selectedBrandId, searchQuery]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleClearFilters = () => {
        setSelectedTypeId(null);
        setSelectedBrandId(null);
        setSearchQuery('');
    };

    const hasActiveFilters = selectedTypeId !== null || selectedBrandId !== null || searchQuery !== '';

    const viewProduct = (product: Product) => {
        setSelectedProduct(product);
        setDisplayProductDialog(true);
    };

    return (
        <div className="grid">
            {/* Header */}
            <div className="col-12">
                <div className="card">
                    <div className="flex align-items-center justify-content-between flex-wrap gap-3">
                        <div>
                            <h4 className="m-0 text-900 font-bold">Products</h4>
                            <span className="text-500 text-sm">
                                {loading ? 'Loading…' : `${products.length} active product${products.length !== 1 ? 's' : ''}`}
                            </span>
                        </div>

                        {/* Search + Filters + Cart */}
                        <div className="flex align-items-center gap-2 flex-wrap">
                            <span className="p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search product name…"
                                    className="w-20rem"
                                />
                            </span>
                            <Button
                                icon="pi pi-filter"
                                label="Filters"
                                outlined
                                badge={hasActiveFilters ? '!' : undefined}
                                onClick={() => setFilterVisible(true)}
                            />
                            {hasActiveFilters && (
                                <Button
                                    icon="pi pi-times"
                                    outlined
                                    severity="secondary"
                                    tooltip="Clear all filters"
                                    tooltipOptions={{ position: 'top' }}
                                    onClick={handleClearFilters}
                                />
                            )}
                            {/* Cart button with badge */}
                            <Button
                                icon="pi pi-shopping-cart"
                                badge={totalItems > 0 ? String(totalItems) : undefined}
                                rounded
                                tooltip="View cart"
                                tooltipOptions={{ position: 'top' }}
                                onClick={() => setCartVisible(true)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="col-12">
                {loading ? (
                    <div className="grid">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="col-12 sm:col-6 lg:col-4 xl:col-3">
                                <div className="border-round h-20rem surface-200 border-1 surface-border" />
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid">
                        {products.map((product) => (
                            <div key={product.id} className="col-12 sm:col-6 lg:col-4 xl:col-3">
                                <ProductCard
                                    product={product}
                                    brands={brands}
                                    productTypes={productTypes}
                                    onView={viewProduct}
                                    onAddToCart={addToCart}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Product Image Dialog */}
            <Dialog
                header={selectedProduct?.description}
                visible={displayProductDialog}
                style={{ width: '50vw' }}
                breakpoints={{ '960px': '75vw', '641px': '90vw' }}
                onHide={() => setDisplayProductDialog(false)}
            >
                <div className="flex align-items-center justify-content-center">
                    <img
                        src={selectedProduct?.imageUrl}
                        alt={selectedProduct?.description}
                        style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                        onError={(e) => (e.currentTarget.src = 'https://static.thenounproject.com/png/504708-200.png')}
                    />
                </div>
            </Dialog>

            {/* Filter Sidebar */}
            <FilterSidebar
                visible={filterVisible}
                onHide={() => setFilterVisible(false)}
                productTypes={productTypes}
                brands={brands}
                selectedTypeId={selectedTypeId}
                selectedBrandId={selectedBrandId}
                onTypeChange={setSelectedTypeId}
                onBrandChange={setSelectedBrandId}
                onClear={handleClearFilters}
            />

            {/* Cart Sidebar */}
            <CartSidebar
                visible={cartVisible}
                onHide={() => setCartVisible(false)}
            />
        </div>
    );
};

// ─── Products Page (wraps with CartProvider) ──────────────────────────────────

const ProductsPage = () => (
    <CartProvider>
        <ProductsPageInner />
    </CartProvider>
);

export default ProductsPage;
