import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CarModel from '@/lib/models/CarModel';
import Specification from '@/lib/models/Specification';
import Category from '@/lib/models/Category';
import Part from '@/lib/models/Part';

export async function GET() {
    try {
        await dbConnect();

        const [
            totalSpecs,
            totalModels,
            totalCategories,
            totalParts,
            recentSpecs
        ] = await Promise.all([
            Specification.countDocuments(),
            CarModel.countDocuments(),
            Category.countDocuments(),
            Part.countDocuments(),
            Specification.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('carModelId', 'name')
                .populate('variantId', 'name')
                .populate('partId', 'name')
        ]);

        return NextResponse.json({
            stats: {
                totalSpecs,
                totalModels,
                totalCategories,
                totalParts
            },
            recentActivity: recentSpecs
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
