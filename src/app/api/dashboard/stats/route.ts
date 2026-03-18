import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CarModel from '@/lib/models/CarModel';
import Specification from '@/lib/models/Specification';
import Category from '@/lib/models/Category';
import Part from '@/lib/models/Part';
import Inspection from '@/lib/models/Inspection';

export async function GET() {
    try {
        await dbConnect();

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const [
            totalSpecs,
            totalModels,
            totalCategories,
            totalParts,
            recentSpecs,
            todayInspections
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
                .populate('partId', 'name'),
            Inspection.find({ createdAt: { $gte: startOfDay } }).lean()
        ]);

        const todayVehicleCount = new Set(todayInspections.map(i => i.vin)).size;
        const todayInspectionCount = todayInspections.length;
        const totalDuration = todayInspections.reduce((sum, i) => sum + (i.duration || 0), 0);
        const avgInspectionTime = todayInspectionCount > 0 ? Math.round(totalDuration / todayInspectionCount) : 0;

        return NextResponse.json({
            stats: {
                totalSpecs,
                totalModels,
                totalCategories,
                totalParts,
                todayVehicleCount,
                todayInspectionCount,
                avgInspectionTime
            },
            recentActivity: recentSpecs
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
