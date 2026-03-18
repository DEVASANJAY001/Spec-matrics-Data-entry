import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Part from '@/lib/models/Part';
import Category from '@/lib/models/Category';

export async function POST(request: Request) {
    try {
        const { name, categoryName } = await request.json();
        await dbConnect();

        let categoryId;
        if (categoryName) {
            let category = await Category.findOne({ name: { $regex: new RegExp(`^${categoryName}$`, 'i') } });
            if (!category) {
                category = await Category.create({ name: categoryName });
            }
            categoryId = category._id;
        }

        // Check if part already exists
        let part = await Part.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (!part) {
            part = await Part.create({ name, categoryId });
        }

        return NextResponse.json(part);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
