import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { getSession, login } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }
        return NextResponse.json(session.user);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        await dbConnect();
        const { name, password } = await req.json();

        const updateData: any = { name };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
            updateData.plainPassword = password;
        }

        const updatedUser = await User.findByIdAndUpdate(session.user.id, updateData, { new: true });

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update session
        const newSessionUser = {
            id: updatedUser._id.toString(),
            userId: updatedUser.userId,
            name: updatedUser.name,
            role: updatedUser.role,
            restrictedPages: Array.from(updatedUser.restrictedPages || []),
        };
        await login(newSessionUser);

        return NextResponse.json({ message: 'Profile updated successfully', user: newSessionUser });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
