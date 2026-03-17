import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Specification from '@/lib/models/Specification';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        await dbConnect();

        let filter = {};
        if (query) {
            filter = { 'Code': { $regex: query, $options: 'i' } };
        }

        // Get unique codes
        const codes = await Specification.distinct('Code', filter);

        // Format for Autocomplete
        const results = codes.map(code => ({ name: code }));

        return NextResponse.json(results);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
