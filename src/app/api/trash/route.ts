import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Trash from '@/lib/models/Trash';

export async function GET() {
    try {
        await dbConnect();
        const items = await Trash.find().sort({ deletedAt: -1 }).lean();
        return NextResponse.json(items);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Clear all trash
export async function DELETE() {
    try {
        await dbConnect();
        await Trash.deleteMany({});
        return NextResponse.json({ message: 'Trash cleared successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
