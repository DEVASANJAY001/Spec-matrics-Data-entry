import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Inspection from '@/lib/models/Inspection';
import Specification from '@/lib/models/Specification';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();
        const inspection: any = await Inspection.findById(id).lean();
        if (!inspection) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        // Fallback: If metadata is missing, look it up from Specifications using the code
        if (!inspection.carModel || !inspection.variant || !inspection.region) {
            const spec = await Specification.findOne({ 'Code': inspection.code }).lean();
            if (spec) {
                inspection.carModel = inspection.carModel || spec['Car Model'];
                inspection.variant = inspection.variant || spec['Variant'];
                inspection.region = inspection.region || spec['Region'];
            }
        }

        return NextResponse.json(inspection);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();
        const data = await request.json();

        // Remove timestamps from incoming data to allow Mongoose to manage them
        delete data.createdAt;
        delete data.updatedAt;

        // Ensure totals are recalculated if items are provided
        if (data.items) {
            data.totalCorrect = data.items.filter((i: any) => i.status === 'correct').length;
            data.totalWrong = data.items.filter((i: any) => i.status === 'wrong').length;
        }

        const inspection = await Inspection.findById(id);
        if (!inspection) {
            return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
        }

        // Apply updates
        Object.assign(inspection, data);

        // Save to trigger timestamps
        await inspection.save();

        return NextResponse.json(inspection);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import Trash from '@/lib/models/Trash';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await dbConnect();

        const inspection = await Inspection.findById(id);
        if (!inspection) {
            return NextResponse.json({ error: 'Inspection not found' }, { status: 404 });
        }

        // Move to Trash
        await Trash.create({
            originalId: inspection._id,
            collectionName: 'inspections',
            data: inspection.toObject(),
            type: 'Log',
            identifier: `${inspection.vin}:${inspection.code}`,
            deletedAt: new Date()
        });

        await Inspection.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Inspection moved to trash' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
