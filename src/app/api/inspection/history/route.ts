import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Inspection from '@/lib/models/Inspection';

export async function GET(request: Request) {
    try {
        await dbConnect();

        // Fetch all - no sort in DB to avoid Atlas M0 32MB memory limit.
        // Sorting is done in Node.js after fetch.
        // Fetch only necessary fields for the summary table
        const raw = await Inspection.find({})
            .select('-items -__v')
            .lean();

        // Sort by createdAt descending in JS
        const inspections = (raw as any[]).sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json(inspections);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
