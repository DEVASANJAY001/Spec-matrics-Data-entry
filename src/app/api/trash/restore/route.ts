import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Trash from '@/lib/models/Trash';
import Specification from '@/lib/models/Specification';
import Inspection from '@/lib/models/Inspection';

export async function POST(request: Request) {
    try {
        const { id } = await request.json();
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await dbConnect();
        const trashItem = await Trash.findById(id);
        if (!trashItem) return NextResponse.json({ error: 'Trash item not found' }, { status: 404 });

        const { collectionName, data } = trashItem;

        // Restore to original collection
        if (collectionName === 'specifications') {
            await Specification.create(data);
        } else if (collectionName === 'inspections') {
            await Inspection.create(data);
        } else {
            return NextResponse.json({ error: 'Unknown collection' }, { status: 400 });
        }

        // Remove from Trash
        await Trash.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Successfully restored' });
    } catch (error: any) {
        console.error('Restore Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
