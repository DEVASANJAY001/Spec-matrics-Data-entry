import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CarModel from '@/lib/models/CarModel';
import Variant from '@/lib/models/Variant';
import Region from '@/lib/models/Region';
import Category from '@/lib/models/Category';
import Part from '@/lib/models/Part';
import Specification from '@/lib/models/Specification';

async function getOrCreate(Model: any, name: string, extraData: any = {}) {
    let doc = await Model.findOne({ name, ...extraData });
    if (!doc) {
        doc = await Model.create({ name, ...extraData });
    }
    return doc;
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const data = await request.json();

        const {
            carModel,
            variant,
            region,
            category,
            part,
            code,
            spec,
            imageUrl,
        } = data;

        // Resolve or Auto-create master data
        const carModelDoc = await getOrCreate(CarModel, carModel);
        const variantDoc = await getOrCreate(Variant, variant, { carModelId: carModelDoc._id });
        const regionDoc = await getOrCreate(Region, region);
        const categoryDoc = await getOrCreate(Category, category);
        const partDoc = await getOrCreate(Part, part, { categoryId: categoryDoc._id });

        // Create final specification entry
        const newSpec = await Specification.create({
            carModelId: carModelDoc._id,
            variantId: variantDoc._id,
            regionId: regionDoc._id,
            categoryId: categoryDoc._id,
            partId: partDoc._id,

            'Car Model': carModelDoc.name,
            'Variant': variantDoc.name,
            'Region': regionDoc.name,
            'Category': categoryDoc.name,
            'Part Name': partDoc.name,
            'Code': code,
            'Specification Details': spec,
            'Documentation Image': imageUrl,
        });

        return NextResponse.json(newSpec, { status: 201 });
    } catch (error: any) {
        console.error('Save Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
