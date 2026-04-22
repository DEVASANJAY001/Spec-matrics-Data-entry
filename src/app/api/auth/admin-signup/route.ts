import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

const SECURITY_CODE = "STELLANTIS@25";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { userId, password, name, securityCode } = body;

        if (!userId || !password || !name || !securityCode) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (securityCode !== SECURITY_CODE) {
            return NextResponse.json({ error: 'Invalid security code' }, { status: 403 });
        }

        const email = userId.toLowerCase();
        if (!email.endsWith('@stellantis.com') && !email.endsWith('@external.stellantis.com')) {
            return NextResponse.json({ error: 'Only Stellantis email addresses are allowed' }, { status: 400 });
        }

        const existingUser = await User.findOne({ userId });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await User.create({
            userId,
            password: hashedPassword,
            name,
            role: 'admin',
            status: 'active',
        });

        return NextResponse.json({
            message: 'Admin created successfully',
            user: { userId: admin.userId, name: admin.name }
        }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
