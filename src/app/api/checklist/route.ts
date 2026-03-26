import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Specification from '@/lib/models/Specification';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const modelId = searchParams.get('modelId');
        const modelName = searchParams.get('modelName');
        const code = searchParams.get('code');

        if (!modelId && !modelName && !code) {
            return NextResponse.json({ error: 'Model ID, Name or Code is required' }, { status: 400 });
        }

        await dbConnect();

        const filter: any = {};
        if (modelId) filter.carModelId = modelId;
        else if (modelName) filter['Car Model'] = modelName;
        else if (code) filter['Code'] = code;

        const specs = await Specification.find(filter)
            .sort({ 'Part Name': 1 })
            .select({ 'Part Name': 1, 'Specification Details': 1, 'Code': 1, 'Car Model': 1, 'Variant': 1, 'Region': 1 })
            .lean();

        return NextResponse.json(specs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
