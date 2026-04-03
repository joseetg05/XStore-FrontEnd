'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { InputSwitch } from 'primereact/inputswitch'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { Toolbar } from 'primereact/toolbar'
import { classNames } from 'primereact/utils'

import { InventoryLocation } from '@/types/inventorylocation'
import { InventoryLocationService } from '@/service/InventoryLocationService'

const emptyLocation: Omit<InventoryLocation, 'id'> = {
    name: '',
    status: true
}

const AdminInventoryLocationsPage = () => {
    const [locations, setLocations] = useState<InventoryLocation[]>([])
    const [locationDialog, setLocationDialog] = useState(false)
    const [deleteDialog, setDeleteDialog] = useState(false)
    const [location, setLocation] = useState<Partial<InventoryLocation>>(emptyLocation)
    const [submitted, setSubmitted] = useState(false)
    const [globalFilter, setGlobalFilter] = useState('')
    const toast = useRef<Toast>(null)
    const dt = useRef<DataTable<InventoryLocation[]>>(null)
    const originalName = useRef<string>('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        InventoryLocationService.getAll().then((data) => setLocations(data))
    }

    // ─── CRUD Actions ──────────────────────────────────────────────────────────

    const openNew = () => {
        setLocation(emptyLocation)
        setSubmitted(false)
        setLocationDialog(true)
    }

    const hideDialog = () => {
        setSubmitted(false)
        setLocationDialog(false)
    }

    const hideDeleteDialog = () => {
        setDeleteDialog(false)
    }

    const saveLocation = async () => {
        setSubmitted(true)

        if (!location.name?.trim()) return

        let result
        if (location.id) {
            result = await InventoryLocationService.update(originalName.current, location as InventoryLocation)
            if (result.success) {
                toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Ubicación actualizada correctamente', life: 3000 })
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error, life: 3000 })
                return
            }
        } else {
            result = await InventoryLocationService.create(location as Omit<InventoryLocation, 'id'>)
            if (result.success) {
                toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Ubicación creada correctamente', life: 3000 })
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: result.error, life: 3000 })
                return
            }
        }

        setLocationDialog(false)
        setLocation(emptyLocation)
        loadData()
    }

    const editLocation = (loc: InventoryLocation) => {
        originalName.current = loc.name
        setLocation({ ...loc })
        setSubmitted(false)
        setLocationDialog(true)
    }

    const confirmDelete = (loc: InventoryLocation) => {
        setLocation({ ...loc })
        setDeleteDialog(true)
    }

    const deleteLocation = async () => {
        if (!location.name) return
        const res = await InventoryLocationService.delete(location.name)
        if (res.success) {
            toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Ubicación eliminada correctamente', life: 3000 })
            loadData()
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: res.error, life: 3000 })
        }
        setDeleteDialog(false)
        setLocation(emptyLocation)
    }

    const toggleStatus = async (loc: InventoryLocation) => {
        const res = await InventoryLocationService.toggleStatus(loc.name, loc.status)
        if (res.success) {
            toast.current?.show({ severity: 'info', summary: 'Estado actualizado', detail: `"${loc.name}" ahora está ${res.location?.status ? 'activa' : 'inactiva'}`, life: 2500 })
            loadData()
        } else {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: res.error, life: 3000 })
        }
    }

    // ─── Column Templates ──────────────────────────────────────────────────────

    const statusBodyTemplate = (rowData: InventoryLocation) => (
        <InputSwitch
            checked={rowData.status}
            onChange={() => toggleStatus(rowData)}
        />
    )

    const actionBodyTemplate = (rowData: InventoryLocation) => (
        <>
            <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editLocation(rowData)} />
            <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDelete(rowData)} />
        </>
    )

    const leftToolbarTemplate = () => (
        <div className="my-2">
            <Button label="Nueva" icon="pi pi-plus" severity="success" onClick={openNew} />
        </div>
    )

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Gestión de Ubicaciones de Inventario</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Buscar..." />
            </span>
        </div>
    )

    const locationDialogFooter = (
        <>
            <Button label="Cancelar" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Guardar" icon="pi pi-check" text onClick={saveLocation} />
        </>
    )

    const deleteDialogFooter = (
        <>
            <Button label="No" icon="pi pi-times" text onClick={hideDeleteDialog} />
            <Button label="Sí" icon="pi pi-check" text onClick={deleteLocation} />
        </>
    )

    // ─── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="grid crud-demo">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} />

                    <DataTable
                        ref={dt}
                        value={locations}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} ubicaciones"
                        globalFilter={globalFilter}
                        globalFilterFields={['name']}
                        emptyMessage="No se encontraron ubicaciones."
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column field="name" header="Nombre" sortable headerStyle={{ minWidth: '15rem' }} />
                        <Column field="status" header="Activa" body={statusBodyTemplate} sortable headerStyle={{ minWidth: '8rem' }} />
                        <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} />
                    </DataTable>

                    {/* CREATE / EDIT DIALOG */}
                    <Dialog
                        visible={locationDialog}
                        style={{ width: '450px' }}
                        header={location.id ? 'Editar Ubicación' : 'Nueva Ubicación'}
                        modal
                        className="p-fluid"
                        footer={locationDialogFooter}
                        onHide={hideDialog}
                    >
                        <div className="field">
                            <label htmlFor="name">Nombre</label>
                            <InputText
                                id="name"
                                value={location.name || ''}
                                onChange={(e) => setLocation({ ...location, name: e.target.value })}
                                required
                                autoFocus
                                className={classNames({ 'p-invalid': submitted && !location.name?.trim() })}
                            />
                            {submitted && !location.name?.trim() && <small className="p-error">El nombre es obligatorio.</small>}
                        </div>

                        <div className="field flex align-items-center gap-3">
                            <label htmlFor="status" className="mb-0">Activa</label>
                            <InputSwitch
                                id="status"
                                checked={location.status ?? true}
                                onChange={(e) => setLocation({ ...location, status: e.value })}
                            />
                        </div>
                    </Dialog>

                    {/* DELETE CONFIRM DIALOG */}
                    <Dialog
                        visible={deleteDialog}
                        style={{ width: '450px' }}
                        header="Confirmar eliminación"
                        modal
                        footer={deleteDialogFooter}
                        onHide={hideDeleteDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {location && (
                                <span>
                                    ¿Estás seguro de que quieres eliminar <b>{location.name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}

export default AdminInventoryLocationsPage
