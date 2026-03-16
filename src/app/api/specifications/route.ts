import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Specification from '@/lib/models/Specification';
import '@/lib/models/CarModel';
import '@/lib/models/Variant';
import '@/lib/models/Region';
import '@/lib/models/Category';
import '@/lib/models/Part';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        await dbConnect();

        let filter = {};
        if (query) {
            filter = {
                $or: [
                    { 'Code': { $regex: query, $options: 'i' } },
                    { 'Specification Details': { $regex: query, $options: 'i' } },
                    { 'Car Model': { $regex: query, $options: 'i' } },
                    { 'Variant': { $regex: query, $options: 'i' } },
                    { 'Region': { $regex: query, $options: 'i' } },
                    { 'Category': { $regex: query, $options: 'i' } },
                    { 'Part Name': { $regex: query, $options: 'i' } }
                ]
            };
        }

        const specs = await Specification.find(filter)
            .sort({ createdAt: -1 })
            .populate('carModelId', 'name')
            .populate('variantId', 'name')
            .populate('regionId', 'name')
            .populate('categoryId', 'name')
            .populate('partId', 'name');

        return NextResponse.json(specs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
