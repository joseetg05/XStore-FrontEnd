import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'imagenes-productos')

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File | null
        if (!file) {
            return NextResponse.json({ error: 'No se envió archivo' }, { status: 400 })
        }

        const ext = path.extname(file.name) || '.png'
        const fileName = `${randomUUID()}${ext}`
        const filePath = path.join(UPLOAD_DIR, fileName)

        const buffer = Buffer.from(await file.arrayBuffer())
        await writeFile(filePath, buffer)

        const url = `/imagenes-productos/${fileName}`
        return NextResponse.json({ url })
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { url } = await req.json()
        if (!url || !url.startsWith('/imagenes-productos/')) {
            return NextResponse.json({ error: 'URL inválida' }, { status: 400 })
        }

        const fileName = path.basename(url)
        const filePath = path.join(UPLOAD_DIR, fileName)
        await unlink(filePath)

        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ success: true })
    }
}
