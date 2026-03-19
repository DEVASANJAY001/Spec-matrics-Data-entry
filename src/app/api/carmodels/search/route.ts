import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CarModel from '@/lib/models/CarModel';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json([]);
        }

        await dbConnect();
        const carModels = await CarModel.find({
            name: { $regex: query, $options: 'i' },
        }).limit(10).select('name _id').lean();

        return NextResponse.json(carModels);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
