import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Specification from '@/lib/models/Specification';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const spec = await Specification.findById(params.id);
        if (!spec) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(spec);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        await dbConnect();

        const updatedSpec = await Specification.findByIdAndUpdate(
            params.id,
            { ...body },
            { new: true, runValidators: true }
        );

        if (!updatedSpec) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(updatedSpec);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const deletedSpec = await Specification.findByIdAndDelete(params.id);
        if (!deletedSpec) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
