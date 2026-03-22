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
import { Brand, Discount, Product, ProductFilters, ProductService, ProductType } from '../../../service/ProductService';
import CartSidebar from './CartSidebar';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
    value.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' });

// ─── Product Card ─────────────────────────────────────────────────────────────

interface ProductCardProps {
    product: Product;
    brands: Brand[];
    productTypes: ProductType[];
    discounts: Discount[];
    onView: (product: Product) => void;
    onAddToCart: (product: Product) => void;
}

const ProductCard = ({ product, brands, productTypes, discounts, onView, onAddToCart }: ProductCardProps) => {
    const brand = brands.find((b) => b.id === product.brandId);
    const type = productTypes.find((t) => t.id === product.productTypeId);
    const discount = discounts.find((d) => d.id === product.discountId);

    const discountedPrice = discount ? product.salePrice * (1 - discount.percentage / 100) : product.salePrice;

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
                    {discount && (
                        <Tag value={`-${discount.percentage}%`} severity="danger" rounded />
                    )}
                </div>

                <Divider className="my-1" />

                <div className="flex align-items-center justify-content-between">
                    <div>
                        <span className="text-500 text-sm">Precio de venta</span>
                        <div className="flex align-items-center gap-2">
                            {discount ? (
                                <>
                                    <span className="text-900 font-bold text-xl" style={{ color: '#e91e63' }}>
                                        {formatCurrency(discountedPrice)}
                                    </span>
                                    <span className="text-500 text-sm line-through">
                                        {formatCurrency(product.salePrice)}
                                    </span>
                                </>
                            ) : (
                                <div className="text-900 font-bold text-xl" style={{ color: 'var(--primary-color)' }}>
                                    {formatCurrency(product.salePrice)}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            icon="pi pi-cart-plus"
                            size="small"
                            tooltip="Agregar al carrito"
                            tooltipOptions={{ position: 'top' }}
                            rounded
                            onClick={() => onAddToCart(product)}
                        />
                        <Button
                            icon="pi pi-eye"
                            size="small"
                            outlined
                            rounded
                            tooltip="Ver detalle"
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
        <h4 className="mt-3 mb-1 text-900">No se encontraron productos</h4>
        <p className="text-500 m-0">Intenta ajustando los filtros o limpiando la búsqueda.</p>
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
    const typeOptions = [{ id: null, name: 'Todos los tipos' }, ...productTypes];
    const brandOptions = [{ id: null, name: 'Todas las marcas' }, ...brands];

    return (
        <Sidebar visible={visible} onHide={onHide} header="Filtros" className="w-full md:w-20rem">
            <div className="flex flex-column gap-4 pt-2">
                <div>
                    <label className="block text-900 font-medium mb-2">Tipo de Producto</label>
                    <Dropdown
                        value={selectedTypeId}
                        options={typeOptions}
                        optionLabel="name"
                        optionValue="id"
                        onChange={(e) => onTypeChange(e.value)}
                        placeholder="Selecciona un tipo"
                        className="w-full"
                    />
                </div>

                <div>
                    <label className="block text-900 font-medium mb-2">Marca</label>
                    <Dropdown
                        value={selectedBrandId}
                        options={brandOptions}
                        optionLabel="name"
                        optionValue="id"
                        onChange={(e) => onBrandChange(e.value)}
                        placeholder="Selecciona una marca"
                        className="w-full"
                    />
                </div>

                <Divider />

                <Button label="Limpiar Filtros" icon="pi pi-times" severity="secondary" outlined onClick={onClear} />
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
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(true);

    const [filterVisible, setFilterVisible] = useState(false);
    const [cartVisible, setCartVisible] = useState(false);
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
    const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortKey, setSortKey] = useState<string | null>(null);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [displayProductDialog, setDisplayProductDialog] = useState(false);

    const sortOptions = [
        { label: 'Precio: Menor a Mayor', value: 'price_asc' },
        { label: 'Precio: Mayor a Menor', value: 'price_desc' },
        { label: 'Nombre: A a Z', value: 'description_asc' },
        { label: 'Nombre: Z a A', value: 'description_desc' }
    ];

    // Load reference data once
    useEffect(() => {
        Promise.all([
            ProductService.getProductTypes(),
            ProductService.getBrands(),
            ProductService.getDiscounts()
        ]).then(([types, brands, discounts]) => {
            setProductTypes(types);
            setBrands(brands);
            setDiscounts(discounts);
        });
    }, []);

    // Fetch products whenever filters change
    const fetchProducts = useCallback(() => {
        setLoading(true);
        const filters: ProductFilters = {
            productTypeId: selectedTypeId ?? undefined,
            brandId: selectedBrandId ?? undefined,
            search: searchQuery,
            sortBy: sortKey ? (sortKey.split('_')[0] as 'price' | 'description') : undefined,
            sortOrder: sortKey ? (sortKey.split('_')[1] as 'asc' | 'desc') : undefined
        };
        ProductService.getProducts(filters).then((data) => {
            setProducts(data);
            setLoading(false);
        });
    }, [selectedTypeId, selectedBrandId, searchQuery, sortKey]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleClearFilters = () => {
        setSelectedTypeId(null);
        setSelectedBrandId(null);
        setSearchQuery('');
        setSortKey(null);
    };

    const hasActiveFilters = selectedTypeId !== null || selectedBrandId !== null || searchQuery !== '' || sortKey !== null;

    const viewProduct = (product: Product) => {
        setSelectedProduct(product);
        setDisplayProductDialog(true);
    };

    return (
        <div className="grid">
            {/* Header */}
            <div className="col-12 sticky" style={{ top: '5rem', zIndex: 1000 }}>
                <div className="card shadow-2">
                    <div className="flex align-items-center justify-content-between flex-wrap gap-3">
                        <div>
                            <h4 className="m-0 text-900 font-bold">Productos</h4>
                            <span className="text-500 text-sm">
                                {loading ? 'Cargando…' : `${products.length} producto${products.length !== 1 ? 's' : ''} activo${products.length !== 1 ? 's' : ''}`}
                            </span>
                        </div>

                        {/* Search + Filters + Cart */}
                        <div className="flex align-items-center gap-2 flex-wrap">
                            <span className="p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Buscar por nombre…"
                                    className="w-20rem"
                                />
                            </span>
                            <Dropdown
                                value={sortKey}
                                options={sortOptions}
                                onChange={(e) => setSortKey(e.value)}
                                placeholder="Ordenar por…"
                                className="w-15rem"
                            />
                            <Button
                                icon="pi pi-filter"
                                label="Filtros"
                                outlined
                                badge={hasActiveFilters ? '!' : undefined}
                                onClick={() => setFilterVisible(true)}
                            />
                            {hasActiveFilters && (
                                <Button
                                    icon="pi pi-times"
                                    outlined
                                    severity="secondary"
                                    tooltip="Limpiar filtros"
                                    tooltipOptions={{ position: 'top' }}
                                    onClick={handleClearFilters}
                                />
                            )}
                            {/* Cart button with badge */}
                            <Button
                                icon="pi pi-shopping-cart"
                                badge={totalItems > 0 ? String(totalItems) : undefined}
                                rounded
                                tooltip="Ver carrito"
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
                                    discounts={discounts}
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
