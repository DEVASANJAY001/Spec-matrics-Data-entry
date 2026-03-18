import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Inspection from '@/lib/models/Inspection';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();
        const data = await request.json();
        
        // Ensure totals are recalculated if items are provided
        if (data.items) {
            data.totalCorrect = data.items.filter((i: any) => i.status === 'correct').length;
            data.totalWrong = data.items.filter((i: any) => i.status === 'wrong').length;
        }

        const inspection = await Inspection.findByIdAndUpdate(id, data, { new: true });
        if (!inspection) {
            return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
        }
        return NextResponse.json(inspection);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();
        const inspection = await Inspection.findByIdAndDelete(id);
        if (!inspection) {
            return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Inspection deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
