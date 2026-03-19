import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            console.error('[UPLOAD] No file in formData');
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        console.log(`[UPLOAD] Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`);

        let buffer: Buffer;
        try {
            const bytes = await file.arrayBuffer();
            buffer = Buffer.from(bytes);
        } catch (e: any) {
            console.error('[UPLOAD] Failed to read arrayBuffer:', e);
            return NextResponse.json({ error: `Failed to read file data: ${e.message}` }, { status: 500 });
        }

        const timestamp = Date.now();
        const safeName = (file.name || 'image.jpg').replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
        const filename = `${timestamp}-${safeName}`;

        const publicDir = join(process.cwd(), 'public');
        const uploadDir = join(publicDir, 'uploads');

        try {
            if (!existsSync(uploadDir)) {
                await mkdir(uploadDir, { recursive: true });
            }
        } catch (e: any) {
            console.error('[UPLOAD] Failed to create directory:', e);
            return NextResponse.json({ error: `Storage error (mkdir): ${e.message}` }, { status: 500 });
        }

        const path = join(uploadDir, filename);
        try {
            await writeFile(path, buffer);
        } catch (e: any) {
            console.error('[UPLOAD] Failed to write file:', e);
            return NextResponse.json({ error: `Storage error (write): ${e.message}` }, { status: 500 });
        }

        const url = `/uploads/${filename}`;
        console.log(`[UPLOAD] Success: ${url}`);

        return NextResponse.json({ url });
    } catch (error: any) {
        console.error('[UPLOAD] Critical error:', error);
        return NextResponse.json({ error: `Internal error: ${error.message}` }, { status: 500 });
    }
}
