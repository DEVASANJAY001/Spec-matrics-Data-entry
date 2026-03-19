import dbConnect from './src/lib/mongodb';
import Specification from './src/lib/models/Specification';

async function test() {
    await dbConnect();
    console.log('DB Connected');

    const specs = await Specification.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .select({ '__v': 0, 'Documentation Image': 0 })
        .lean();

    console.log('Found specs count:', specs.length);
    if (specs.length > 0) {
        console.log('Sample spec keys:', Object.keys(specs[0]));
        console.log('Sample spec:', JSON.stringify(specs[0], null, 2));
    }
    process.exit(0);
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
