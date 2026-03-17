import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Specification from '@/lib/models/Specification';
import CarModel from '@/lib/models/CarModel';
import Variant from '@/lib/models/Variant';
import Region from '@/lib/models/Region';
import Category from '@/lib/models/Category';
import Part from '@/lib/models/Part';

async function getOrCreate(Model: any, name: string, extraData: any = {}) {
    let doc = await Model.findOne({ name, ...extraData });
    if (!doc) {
        doc = await Model.create({ name, ...extraData });
    }
    return doc;
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();
        const spec = await Specification.findById(id);
        if (!spec) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(spec);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await request.json();
        await dbConnect();

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

        // Resolve or Auto-create master data (Same logic as create)
        const carModelDoc = await getOrCreate(CarModel, carModel);
        const variantDoc = await getOrCreate(Variant, variant, { carModelId: carModelDoc._id });
        const regionDoc = await getOrCreate(Region, region);
        const categoryDoc = await getOrCreate(Category, category);
        const partDoc = await getOrCreate(Part, part, { categoryId: categoryDoc._id });

        const updatedSpec = await Specification.findByIdAndUpdate(
            id,
            {
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
            },
            { new: true, runValidators: true }
        );

        if (!updatedSpec) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(updatedSpec);
    } catch (error: any) {
        console.error('Update Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();
        const deletedSpec = await Specification.findByIdAndDelete(id);
        if (!deletedSpec) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
