import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const workers = await User.find({ role: 'worker' }).sort({ createdAt: -1 });
        return NextResponse.json(workers);
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { userId, password, name, dob } = await req.json();

        if (!userId || !password || !name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingUser = await User.findOne({ userId });
        if (existingUser) {
            return NextResponse.json({ error: 'Worker ID already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const worker = await User.create({
            userId,
            password: hashedPassword,
            plainPassword: password, // Store plain text as requested
            name,
            dob: dob ? new Date(dob) : undefined,
            role: 'worker',
            status: 'active',
            restrictedPages: [],
        });

        return NextResponse.json({ message: 'Worker created successfully', worker }, { status: 201 });
    } catch (error: any) {
        console.error('Worker creation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
