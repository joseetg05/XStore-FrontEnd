'use client'

import React, { useEffect, useRef } from 'react'
import { Toast } from 'primereact/toast'
import { checkHealth } from '@/service/ApiClient'

const Dashboard = () => {
    const toast = useRef<Toast>(null)

    useEffect(() => {
        checkHealth().then((ok) => {
            if (ok) {
                toast.current?.show({ severity: 'success', summary: 'API conectada', detail: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5210', life: 3000 })
            } else {
                toast.current?.show({ severity: 'error', summary: 'API sin conexión', detail: 'No se pudo conectar con el servidor.', life: 5000 })
            }
        })
    }, [])

    return (
        <>
            <Toast ref={toast} />
            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        <h5>Dashboard</h5>
                        <p>Bienvenido a XStore.</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Dashboard
