import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { login } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { userId, password } = body || {};

        if (!userId || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const user = await User.findOne({ userId });
        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        if (user.status === 'deactivated') {
            return NextResponse.json({ error: 'Account deactivated. Please contact admin.' }, { status: 403 });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Create session
        const sessionUser = {
            id: user._id.toString(),
            userId: user.userId,
            name: user.name,
            role: user.role,
            restrictedPages: Array.from(user.restrictedPages || []),
        };

        await login(sessionUser);

        return NextResponse.json({
            message: 'Login successful',
            user: sessionUser
        }, { status: 200 });

    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
