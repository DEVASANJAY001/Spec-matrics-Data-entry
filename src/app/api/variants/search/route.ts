import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Variant from '@/lib/models/Variant';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const carModelId = searchParams.get('carModelId');

        if (!query) {
            return NextResponse.json([]);
        }

        await dbConnect();
        const filter: any = {
            name: { $regex: query, $options: 'i' },
        };

        if (carModelId) {
            filter.carModelId = carModelId;
        }

        const variants = await Variant.find(filter)
            .limit(10)
            .select('name _id')
            .lean();

        return NextResponse.json(variants);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
