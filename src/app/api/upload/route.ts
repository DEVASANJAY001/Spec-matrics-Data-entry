import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Convert to Base64 Data URI
        const base64 = buffer.toString('base64');
        const mimeType = file.type || 'image/jpeg';
        const dataUri = `data:${mimeType};base64,${base64}`;

        console.log(`[UPLOAD] Converting to Base64 (${Math.round(dataUri.length / 1024)} KB)`);

        return NextResponse.json({ url: dataUri });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
