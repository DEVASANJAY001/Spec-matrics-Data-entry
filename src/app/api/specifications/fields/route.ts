import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Specification from '@/lib/models/Specification';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const field = searchParams.get('field'); // e.g. "Car Model", "Variant"
        const query = searchParams.get('q') || '';

        // Optional: filter variants by carModel if provided
        const carModel = searchParams.get('carModel');

        if (!field) {
            return NextResponse.json({ error: 'Field parameter is required' }, { status: 400 });
        }

        await dbConnect();

        let matchFilter: any = {
            [field]: { $regex: query, $options: 'i' }
        };

        if (field === 'Variant' && carModel) {
            matchFilter['Car Model'] = carModel;
        }

        const values = await Specification.distinct(field, matchFilter);

        // Map to standard format for Autocomplete: { name: string }
        const formattedValues = values.slice(0, 10).map(val => ({
            name: val,
            _id: val // use value as ID for simple fields
        }));

        return NextResponse.json(formattedValues);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
