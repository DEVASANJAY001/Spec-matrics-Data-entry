import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Specification from '@/lib/models/Specification';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const carModel = searchParams.get('carModel');
        const variant = searchParams.get('variant');
        const region = searchParams.get('region');
        const code = searchParams.get('code');

        await dbConnect();

        let filter: any = {};

        if (query) {
            filter.$or = [
                { 'Code': { $regex: query, $options: 'i' } },
                { 'Specification Details': { $regex: query, $options: 'i' } },
                { 'Car Model': { $regex: query, $options: 'i' } },
                { 'Variant': { $regex: query, $options: 'i' } },
                { 'Region': { $regex: query, $options: 'i' } },
                { 'Category': { $regex: query, $options: 'i' } },
                { 'Part Name': { $regex: query, $options: 'i' } }
            ];
        }

        if (carModel) filter['Car Model'] = carModel;
        if (variant) filter['Variant'] = variant;
        if (region) filter['Region'] = region;
        if (code) filter['Code'] = { $regex: code, $options: 'i' };

        const limitStr = searchParams.get('limit');
        const limit = limitStr ? parseInt(limitStr, 10) : null;

        let queryBuilder = Specification.find(filter)
            .sort({ createdAt: -1 });

        if (limit) {
            queryBuilder = queryBuilder.limit(limit);
        }

        const specs = await queryBuilder
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
