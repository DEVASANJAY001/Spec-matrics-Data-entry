import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Part from '@/lib/models/Part';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const categoryId = searchParams.get('categoryId');

        if (!query) {
            return NextResponse.json([]);
        }

        await dbConnect();
        const filter: any = {
            name: { $regex: query, $options: 'i' },
        };

        if (categoryId) {
            filter.categoryId = categoryId;
        }

        const parts = await Part.find(filter).limit(10).select('name _id');

        return NextResponse.json(parts);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
