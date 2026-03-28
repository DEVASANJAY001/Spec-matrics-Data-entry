import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Specification from '@/lib/models/Specification';
import Trash from '@/lib/models/Trash';

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ error: 'Code is required' }, { status: 400 });
        }

        await dbConnect();

        const specs = await Specification.find({ 'Code': code });

        if (specs.length > 0) {
            // Bulk move to Trash
            const trashEntries = specs.map(spec => ({
                originalId: spec._id,
                collectionName: 'specifications',
                data: spec.toObject(),
                type: 'Master',
                identifier: spec['Code'] || code,
                deletedAt: new Date()
            }));
            await Trash.insertMany(trashEntries);
        }

        const result = await Specification.deleteMany({ 'Code': code });

        return NextResponse.json({
            message: `Successfully moved ${result.deletedCount} specifications for code ${code} to trash`,
            deletedCount: result.deletedCount
        });
    } catch (error: any) {
        console.error('Bulk Delete Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
