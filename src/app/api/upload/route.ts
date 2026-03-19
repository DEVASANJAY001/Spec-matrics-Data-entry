import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create deep path for organization and to prevent storage limits in single folder
        const timestamp = Date.now();
        const originalName = file.name.replace(/\s+/g, '-');
        const filename = `${timestamp}-${originalName}`;

        const publicDir = join(process.cwd(), 'public');
        const uploadDir = join(publicDir, 'uploads');

        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const path = join(uploadDir, filename);
        await writeFile(path, buffer);

        const url = `/uploads/${filename}`;
        console.log(`[UPLOAD] Saved to ${path}, URL: ${url}`);

        return NextResponse.json({ url });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
