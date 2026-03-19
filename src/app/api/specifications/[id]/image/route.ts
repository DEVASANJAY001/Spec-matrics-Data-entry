import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Specification from '@/lib/models/Specification';

export async function GET(request: Request, context: any) {
    try {
        const { id } = await context.params;

        await dbConnect();

        const spec = await Specification.findById(id)
            .select('Documentation Image')
            .lean();

        if (!spec) {
            return new NextResponse('Specification not found', { status: 404 });
        }

        const imgData = spec['Documentation Image'];

        if (!imgData) {
            // Return an empty image or 404
            return new NextResponse('No image', { status: 404 });
        }

        // If it's a regular URL (e.g. from /api/upload), redirect to it
        if (imgData.startsWith('http') || imgData.startsWith('/')) {
            return NextResponse.redirect(new URL(imgData, request.url));
        }

        // If it's a base64 Data URI, parse it
        if (imgData.startsWith('data:image/')) {
            const matches = imgData.match(/^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const contentType = matches[1];
                const base64Data = matches[2];
                const buffer = Buffer.from(base64Data, 'base64');

                return new NextResponse(buffer, {
                    headers: {
                        'Content-Type': contentType,
                        'Cache-Control': 'public, max-age=31536000, immutable'
                    }
                });
            }
        }

        return new NextResponse('Invalid image data', { status: 400 });

    } catch (error: any) {
        return new NextResponse(error.message, { status: 500 });
    }
}
