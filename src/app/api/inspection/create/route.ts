import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Inspection from '@/lib/models/Inspection';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('[CREATE INSPECTION] duration:', body.duration, 'startedAt:', body.startedAt, 'endedAt:', body.endedAt);
        await dbConnect();
        const inspection = await Inspection.create(body);
        return NextResponse.json(inspection);
    } catch (error: any) {
        console.error('Inspection save error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
