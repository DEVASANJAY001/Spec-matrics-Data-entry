import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Trash from '@/lib/models/Trash';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();
        const deleted = await Trash.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ error: 'Trash item not found' }, { status: 404 });
        return NextResponse.json({ message: 'Permanently deleted from trash' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
