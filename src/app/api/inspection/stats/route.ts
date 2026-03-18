import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Inspection from '@/lib/models/Inspection';

export async function GET() {
    try {
        await dbConnect();

        const totalCars = await Inspection.countDocuments();
        const correctCars = await Inspection.countDocuments({ totalWrong: 0 });
        const wrongCars = await Inspection.countDocuments({ totalWrong: { $gt: 0 } });

        // Aggregate most common wrong parts
        const wrongPartsTrend = await Inspection.aggregate([
            { $unwind: '$items' },
            { $match: { 'items.status': 'wrong' } },
            {
                $group: {
                    _id: '$items.partName',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        return NextResponse.json({
            totalCars,
            correctCars,
            totalWrong: wrongCars,
            wrongPartsTrend
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
