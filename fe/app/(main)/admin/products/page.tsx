'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';

import { Brand, Discount, Product, ProductService, ProductType } from '../../../../service/ProductService';

const emptyProduct: Omit<Product, 'id'> = {
    productTypeId: 1,
    brandId: 1,
    imageUrl: '',
    description: '',
    discountId: 0,
    purchasePrice: 0,
    salePrice: 0,
    status: true
};

const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' });
};

const AdminProductsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [productDialog, setProductDialog] = useState(false);
    const [deleteProductDialog, setDeleteProductDialog] = useState(false);
    
    // We use a partial object when editing because ID might be missing for new ones
    const [product, setProduct] = useState<Partial<Product>>(emptyProduct);
    
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<Product[]>>(null);

    const [types, setTypes] = useState<ProductType[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [discounts, setDiscounts] = useState<Discount[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        ProductService.getAllProducts().then(data => setProducts(data));
        ProductService.getProductTypes().then(data => setTypes(data));
        ProductService.getBrands().then(data => setBrands(data));
        ProductService.getDiscounts().then(data => setDiscounts(data));
    };

    const openNew = () => {
        setProduct(emptyProduct);
        setSubmitted(false);
        setProductDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setProductDialog(false);
    };

    const hideDeleteProductDialog = () => {
        setDeleteProductDialog(false);
    };

    const saveProduct = async () => {
        setSubmitted(true);

        if (product.description?.trim() && product.salePrice !== undefined && product.salePrice >= 0) {
            let result;
            if (product.id) {
                // Update
                result = await ProductService.updateProduct(product as Product);
                if (result.success) {
                    toast.current?.show({ severity: 'success', summary: 'Exitosa', detail: 'Producto Actualizado', life: 3000 });
                } else {
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error, life: 3000 });
                    return;
                }
            } else {
                // Create
                result = await ProductService.createProduct(product as Omit<Product, 'id'>);
                if (result.success) {
                    toast.current?.show({ severity: 'success', summary: 'Exitosa', detail: 'Producto Creado', life: 3000 });
                } else {
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error, life: 3000 });
                    return;
                }
            }

            setProductDialog(false);
            setProduct(emptyProduct);
            loadData();
        }
    };

    const editProduct = (p: Product) => {
        setProduct({ ...p });
        setProductDialog(true);
    };

    const confirmDeleteProduct = (p: Product) => {
        setProduct({ ...p });
        setDeleteProductDialog(true);
    };

    const deleteProductAction = async () => {
        if (product.id) {
            const res = await ProductService.deleteProduct(product.id);
            if (res.success) {
                toast.current?.show({ severity: 'success', summary: 'Exitosa', detail: 'Producto Eliminado', life: 3000 });
                loadData();
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: res.error, life: 3000 });
            }
        }
        setDeleteProductDialog(false);
        setProduct(emptyProduct);
    };

    // ─── Templates ────────────────────────────────────────────────────────────

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Nuevo" icon="pi pi-plus" severity="success" className="mr-2" onClick={openNew} />
                </div>
            </React.Fragment>
        );
    };

    const imageBodyTemplate = (rowData: Product) => {
        return (
            <img 
                src={rowData.imageUrl} 
                alt={rowData.description} 
                className="shadow-2" 
                width="64"
                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/64?text=XStore')} 
            />
        );
    };

    const priceBodyTemplate = (rowData: Product) => {
        return formatCurrency(rowData.salePrice);
    };

    const statusBodyTemplate = (rowData: Product) => {
        return (
            <i 
                className={classNames('pi', {
                    'pi-check-circle text-green-500': rowData.status,
                    'pi-times-circle text-red-500': !rowData.status
                })}
                style={{ fontSize: '1.5rem' }}
            ></i>
        );
    };

    const actionBodyTemplate = (rowData: Product) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editProduct(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteProduct(rowData)} />
            </>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gestión de Productos</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar..." />
            </span>
        </div>
    );

    const productDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" text onClick={saveProduct} />
        </>
    );

    const deleteProductDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteProductDialog} />
            <Button label="Sí" icon="pi pi-check" text onClick={deleteProductAction} />
        </>
    );

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={products}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos"
                        globalFilter={globalFilter}
                        globalFilterFields={['description', 'id']}
                        emptyMessage="No se encontraron productos."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column field="id" header="ID" sortable headerStyle={{ minWidth: '5rem' }}></Column>
                        <Column header="Imagen" body={imageBodyTemplate}></Column>
                        <Column field="description" header="Descripción" sortable headerStyle={{ minWidth: '15rem' }}></Column>
                        <Column field="salePrice" header="Precio" body={priceBodyTemplate} sortable headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column field="status" header="Activo" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '8rem' }}></Column>
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    {/* CREATE / EDIT DIALOG */}
                    <Dialog visible={productDialog} style={{ width: '600px' }} header="Detalles del Producto" modal className="p-fluid" footer={productDialogFooter} onHide={hideDialog}>
                        {product.imageUrl && (
                            <img 
                                src={product.imageUrl} 
                                alt={product.imageUrl} 
                                width="150" 
                                className="mt-0 mx-auto mb-5 block shadow-2"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                        )}

                        <div className="field">
                            <label htmlFor="description">Descripción</label>
                            <InputText
                                id="description"
                                value={product.description || ''}
                                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                                required
                                autoFocus
                                className={classNames({ 'p-invalid': submitted && !product.description })}
                            />
                            {submitted && !product.description && <small className="p-error">La descripción es obligatoria.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="imageUrl">URL de la Imagen</label>
                            <InputText
                                id="imageUrl"
                                value={product.imageUrl || ''}
                                onChange={(e) => setProduct({ ...product, imageUrl: e.target.value })}
                                placeholder="http://..."
                            />
                        </div>

                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="productTypeId">Categoría (Tipo)</label>
                                <Dropdown
                                    id="productTypeId"
                                    value={product.productTypeId}
                                    options={types}
                                    onChange={(e) => setProduct({ ...product, productTypeId: e.value })}
                                    optionLabel="name"
                                    optionValue="id"
                                    placeholder="Seleccione uno"
                                />
                            </div>
                            <div className="field col">
                                <label htmlFor="brandId">Marca</label>
                                <Dropdown
                                    id="brandId"
                                    value={product.brandId}
                                    options={brands}
                                    onChange={(e) => setProduct({ ...product, brandId: e.value })}
                                    optionLabel="name"
                                    optionValue="id"
                                    placeholder="Seleccione una"
                                />
                            </div>
                        </div>

                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="purchasePrice">Precio de Compra</label>
                                <InputNumber
                                    id="purchasePrice"
                                    value={product.purchasePrice || 0}
                                    onValueChange={(e) => setProduct({ ...product, purchasePrice: e.value || 0 })}
                                    mode="currency"
                                    currency="CRC"
                                    locale="es-CR"
                                />
                            </div>
                            <div className="field col">
                                <label htmlFor="salePrice">Precio de Venta</label>
                                <InputNumber
                                    id="salePrice"
                                    value={product.salePrice || 0}
                                    onValueChange={(e) => setProduct({ ...product, salePrice: e.value || 0 })}
                                    mode="currency"
                                    currency="CRC"
                                    locale="es-CR"
                                    required
                                    className={classNames({ 'p-invalid': submitted && (!product.salePrice || product.salePrice < 0) })}
                                />
                                {submitted && (!product.salePrice || product.salePrice < 0) && <small className="p-error">Precio de venta es obligatorio y no negativo.</small>}
                            </div>
                        </div>

                        <div className="formgrid grid">
                            <div className="field col-6">
                                <label htmlFor="discountId">Descuento</label>
                                <Dropdown
                                    id="discountId"
                                    value={product.discountId}
                                    options={[{ id: 0, name: 'Ninguno' }, ...discounts]}
                                    onChange={(e) => setProduct({ ...product, discountId: e.value })}
                                    optionLabel="name"
                                    optionValue="id"
                                />
                            </div>
                            <div className="field col-6 flex align-items-center mt-4">
                                <label htmlFor="status" className="mr-3 mb-0">Activo</label>
                                <InputSwitch 
                                    id="status" 
                                    checked={product.status || false} 
                                    onChange={(e) => setProduct({ ...product, status: e.value })} 
                                />
                            </div>
                        </div>
                    </Dialog>

                    {/* DELETE DIALOG */}
                    <Dialog visible={deleteProductDialog} style={{ width: '450px' }} header="Confirmar" modal footer={deleteProductDialogFooter} onHide={hideDeleteProductDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {product && (
                                <span>
                                    ¿Estás seguro de que quieres eliminar <b>{product.description}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default AdminProductsPage;
