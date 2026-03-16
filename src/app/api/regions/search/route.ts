import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Region from '@/lib/models/Region';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json([]);
        }

        await dbConnect();
        const regions = await Region.find({
            name: { $regex: query, $options: 'i' },
        }).limit(10).select('name _id');

        return NextResponse.json(regions);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
