'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Sidebar } from 'primereact/sidebar';
import { Tag } from 'primereact/tag';

import { useCart } from '../../../context/CartContext';
import { Brand, Discount, Product, ProductFilters, ProductService, ProductType } from '../../../service/ProductService';

import CartSidebar from './CartSidebar';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
    value.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' });

// ─── Product Detail ───────────────────────────────────────────────────────────

interface ProductDetailProps {
    product: Product;
    discounts: Discount[];
    onBack: () => void;
    onAddToCart: (product: Product) => void;
}

const ProductDetail = ({ product, discounts, onBack, onAddToCart }: ProductDetailProps) => {
    const discount = discounts.find((d) => d.name === product.discountName);
    const discountedPrice = discount ? product.salePrice * (1 - discount.percentage / 100) : product.salePrice;

    return (
        <div className="col-12">
            <div className="card" style={{ minHeight: '70vh' }}>
                {/* Back button */}
                <div className="flex justify-content-end mb-3">
                    <Button icon="pi pi-times" rounded text severity="secondary" onClick={onBack} tooltip="Volver a la tienda" tooltipOptions={{ position: 'left' }} style={{ fontSize: '1.25rem' }} />
                </div>

                <div className="grid">
                    {/* Image */}
                    <div className="col-12 md:col-6 flex align-items-center justify-content-center" style={{ minHeight: '350px' }}>
                        <div className="flex align-items-center justify-content-center bg-gray-50 border-round-xl w-full" style={{ height: '380px', overflow: 'hidden' }}>
                            <img
                                src={product.imageUrl}
                                alt={product.description}
                                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                onError={(e) => (e.currentTarget.src = 'https://static.thenounproject.com/png/504708-200.png')}
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="col-12 md:col-6 flex flex-column justify-content-center gap-3 px-4">
                        <h2 className="m-0 text-900 font-bold line-height-2">{product.description}</h2>

                        <div className="flex gap-2 flex-wrap">
                            {product.type && <Tag value={product.type} severity="info" rounded />}
                            {product.brand && <Tag value={product.brand} severity="warning" rounded />}
                            {discount && <Tag value={`-${discount.percentage}% DESCUENTO`} severity="danger" rounded />}
                        </div>

                        <Divider />

                        <div className="flex flex-column gap-1">
                            <span className="text-500 text-sm">Precio</span>
                            {discount ? (
                                <div className="flex align-items-center gap-3">
                                    <span className="font-bold" style={{ fontSize: '2rem', color: '#e91e63' }}>
                                        {formatCurrency(discountedPrice)}
                                    </span>
                                    <span className="text-500 line-through" style={{ fontSize: '1.1rem' }}>
                                        {formatCurrency(product.salePrice)}
                                    </span>
                                </div>
                            ) : (
                                <span className="font-bold" style={{ fontSize: '2rem', color: 'var(--primary-color)' }}>
                                    {formatCurrency(product.salePrice)}
                                </span>
                            )}
                        </div>

                        <div className="flex flex-column gap-2 text-700">
                            {product.type && (
                                <div className="flex gap-2">
                                    <span className="font-medium w-6rem">Tipo:</span>
                                    <span>{product.type}</span>
                                </div>
                            )}
                            {product.brand && (
                                <div className="flex gap-2">
                                    <span className="font-medium w-6rem">Marca:</span>
                                    <span>{product.brand}</span>
                                </div>
                            )}
                        </div>

                        <Divider />

                        <div className="flex gap-2">
                            <Button
                                label="Agregar al carrito"
                                icon="pi pi-cart-plus"
                                onClick={() => onAddToCart(product)}
                                style={{ flex: 1 }}
                            />
                            <Button
                                label="Volver"
                                icon="pi pi-arrow-left"
                                outlined
                                severity="secondary"
                                onClick={onBack}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Product Card ─────────────────────────────────────────────────────────────

interface ProductCardProps {
    product: Product;
    discounts: Discount[];
    onView: (product: Product) => void;
    onAddToCart: (product: Product) => void;
}

const ProductCard = ({ product, discounts, onView, onAddToCart }: ProductCardProps) => {
    const discount = discounts.find((d) => d.name === product.discountName);
    const discountedPrice = discount ? product.salePrice * (1 - discount.percentage / 100) : product.salePrice;

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = 'https://static.thenounproject.com/png/504708-200.png';
    };

    const header = (
        <div className="flex align-items-center justify-content-center bg-gray-50 p-3" style={{ height: '220px', borderRadius: '8px 8px 0 0', overflow: 'hidden', flexShrink: 0 }}>
            <img
                src={product.imageUrl}
                alt={product.description}
                onError={handleImageError}
                style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
        </div>
    );

    return (
        <Card header={header} className="shadow-2 border-round-xl" style={{ display: 'flex', flexDirection: 'column', width: '100%', paddingBottom: '0.5rem' }}>
            <div className="flex flex-column gap-2" style={{ flex: 1 }}>
                {/* Título fijo a 2 líneas */}
                <h5 className="m-0 text-900 font-semibold line-height-2" style={{ fontSize: '1rem', minHeight: '2.8rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.description}
                </h5>

                {/* Tags fijos a 1 línea de altura */}
                <div className="flex gap-2 flex-wrap" style={{ minHeight: '2rem' }}>
                    {product.type && <Tag value={product.type} severity="info" rounded />}
                    {product.brand && <Tag value={product.brand} severity="warning" rounded />}
                    {discount && <Tag value={`-${discount.percentage}%`} severity="danger" rounded />}
                </div>

                {/* Descripción del descuento — altura fija para alinear botones */}
                <div style={{ minHeight: '2.5rem' }}>
                    {discount && (
                        <span className="text-sm font-medium" style={{ color: '#e91e63', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            <i className="pi pi-tag mr-1" />
                            {discount.name}{discount.description ? ` — ${discount.description}` : ''}
                        </span>
                    )}
                </div>

                <Divider className="my-1" />

                {/* Precio */}
                <div className="mt-auto">
                    <span className="text-500 text-sm">Precio de venta</span>
                    <div className="flex align-items-center gap-2 mb-3">
                        {discount ? (
                            <>
                                <span className="font-bold text-xl" style={{ color: '#e91e63' }}>
                                    {formatCurrency(discountedPrice)}
                                </span>
                                <span className="text-500 text-sm line-through">
                                    {formatCurrency(product.salePrice)}
                                </span>
                            </>
                        ) : (
                            <span className="font-bold text-xl" style={{ color: 'var(--primary-color)' }}>
                                {formatCurrency(product.salePrice)}
                            </span>
                        )}
                    </div>

                    {/* Botones */}
                    <div className="flex flex-column gap-2">
                        <Button label="Agregar al Carrito" icon="pi pi-cart-plus" className="w-full" onClick={() => onAddToCart(product)} />
                        <Button label="Más Detalles" icon="pi pi-eye" className="w-full" outlined onClick={() => onView(product)} />
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
    selectedType: string | null;
    selectedBrand: string | null;
    onlyWithDiscount: boolean;
    onTypeChange: (name: string | null) => void;
    onBrandChange: (name: string | null) => void;
    onDiscountChange: (value: boolean) => void;
    onClear: () => void;
}

const FilterSidebar = ({ visible, onHide, productTypes, brands, selectedType, selectedBrand, onlyWithDiscount, onTypeChange, onBrandChange, onDiscountChange, onClear }: FilterSidebarProps) => {
    const typeOptions = [{ name: null, label: 'Todos los tipos' }, ...productTypes.map((t) => ({ name: t.name, label: t.name }))];
    const brandOptions = [{ name: null, label: 'Todas las marcas' }, ...brands.map((b) => ({ name: b.name, label: b.name }))];

    return (
        <Sidebar visible={visible} onHide={onHide} header="Filtros" className="w-full md:w-20rem">
            <div className="flex flex-column gap-4 pt-2">
                <div>
                    <label className="block text-900 font-medium mb-2">Tipo de Producto</label>
                    <Dropdown value={selectedType} options={typeOptions} optionLabel="label" optionValue="name" onChange={(e) => onTypeChange(e.value)} placeholder="Selecciona un tipo" className="w-full" />
                </div>
                <div>
                    <label className="block text-900 font-medium mb-2">Marca</label>
                    <Dropdown value={selectedBrand} options={brandOptions} optionLabel="label" optionValue="name" onChange={(e) => onBrandChange(e.value)} placeholder="Selecciona una marca" className="w-full" />
                </div>
                <div className="flex align-items-center justify-content-between">
                    <label className="text-900 font-medium">Solo con descuento</label>
                    <input
                        type="checkbox"
                        checked={onlyWithDiscount}
                        onChange={(e) => onDiscountChange(e.target.checked)}
                        style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary-color)', cursor: 'pointer' }}
                    />
                </div>
                <Divider />
                <Button label="Limpiar Filtros" icon="pi pi-times" severity="secondary" outlined onClick={onClear} />
            </div>
        </Sidebar>
    );
};

// ─── Shop Page ────────────────────────────────────────────────────────────────

const ShopPage = () => {
    const { addToCart, getTotals } = useCart();
    const { totalItems } = getTotals();

    const [products, setProducts] = useState<Product[]>([]);
    const [productTypes, setProductTypes] = useState<ProductType[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(true);

    const [filterVisible, setFilterVisible] = useState(false);
    const [cartVisible, setCartVisible] = useState(false);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
    const [onlyWithDiscount, setOnlyWithDiscount] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortKey, setSortKey] = useState<string | null>(null);

    const [detailProduct, setDetailProduct] = useState<Product | null>(null);

    const sortOptions = [
        { label: 'Precio: Menor a Mayor', value: 'price_asc' },
        { label: 'Precio: Mayor a Menor', value: 'price_desc' },
        { label: 'Nombre: A a Z', value: 'description_asc' },
        { label: 'Nombre: Z a A', value: 'description_desc' }
    ];

    useEffect(() => {
        Promise.all([ProductService.getProductTypes(), ProductService.getBrands(), ProductService.getDiscounts()]).then(([types, brands, discounts]) => {
            setProductTypes(types);
            setBrands(brands);
            setDiscounts(discounts);
        });
    }, []);

    const fetchProducts = useCallback(() => {
        setLoading(true);
        const filters: ProductFilters = {
            type: selectedType ?? undefined,
            brand: selectedBrand ?? undefined,
            search: searchQuery,
            sortBy: sortKey ? (sortKey.split('_')[0] as 'price' | 'description') : undefined,
            sortOrder: sortKey ? (sortKey.split('_')[1] as 'asc' | 'desc') : undefined
        };
        ProductService.getProducts(filters).then((data) => {
            setProducts(data);
            setLoading(false);
        });
    }, [selectedType, selectedBrand, searchQuery, sortKey]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleClearFilters = () => {
        setSelectedType(null);
        setSelectedBrand(null);
        setOnlyWithDiscount(false);
        setSearchQuery('');
        setSortKey(null);
    };

    const hasActiveFilters = selectedType !== null || selectedBrand !== null || onlyWithDiscount || searchQuery !== '' || sortKey !== null;

    const visibleProducts = onlyWithDiscount ? products.filter((p) => !!p.discountName) : products;

    // ─── Detail view ───────────────────────────────────────────────────────────

    if (detailProduct) {
        return (
            <div className="grid">
                <ProductDetail
                    product={detailProduct}
                    discounts={discounts}
                    onBack={() => setDetailProduct(null)}
                    onAddToCart={(p) => { addToCart(p); setDetailProduct(null); }}
                />
            </div>
        );
    }

    // ─── Grid view ─────────────────────────────────────────────────────────────

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

                        <div className="flex align-items-center gap-2 flex-wrap">
                            <span className="p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar por nombre…" className="w-20rem" />
                            </span>
                            <Dropdown value={sortKey} options={sortOptions} onChange={(e) => setSortKey(e.value)} placeholder="Ordenar por…" className="w-15rem" />
                            <Button icon="pi pi-filter" label="Filtros" outlined badge={hasActiveFilters ? '!' : undefined} onClick={() => setFilterVisible(true)} />
                            {hasActiveFilters && (
                                <Button icon="pi pi-times" outlined severity="secondary" tooltip="Limpiar filtros" tooltipOptions={{ position: 'top' }} onClick={handleClearFilters} />
                            )}
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
                ) : visibleProducts.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid">
                        {visibleProducts.map((product) => (
                            <div key={product.id} className="col-12 sm:col-6 lg:col-4 xl:col-3" style={{ display: 'flex' }}>
                                <ProductCard product={product} discounts={discounts} onView={setDetailProduct} onAddToCart={addToCart} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Filter Sidebar */}
            <FilterSidebar
                visible={filterVisible}
                onHide={() => setFilterVisible(false)}
                productTypes={productTypes}
                brands={brands}
                selectedType={selectedType}
                selectedBrand={selectedBrand}
                onlyWithDiscount={onlyWithDiscount}
                onTypeChange={setSelectedType}
                onBrandChange={setSelectedBrand}
                onDiscountChange={setOnlyWithDiscount}
                onClear={handleClearFilters}
            />

            {/* Cart Sidebar */}
            <CartSidebar visible={cartVisible} onHide={() => setCartVisible(false)} />
        </div>
    );
};

export default ShopPage;
