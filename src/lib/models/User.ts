import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    userId: string; // Worker ID or Admin Username
    password: string;
    plainPassword?: string; // specific requirement to allow admins to view worker passwords
    role: 'admin' | 'worker';
    name: string;
    dob?: Date; // For workers
    status: 'active' | 'deactivated';
    restrictedPages: string[]; // List of routes worker cannot access
    createdAt: Date;
}

const UserSchema = new Schema<IUser>({
    userId: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    plainPassword: { type: String }, // specific requirement
    role: { type: String, enum: ['admin', 'worker'], required: true },
    name: { type: String, required: true },
    dob: { type: Date },
    status: { type: String, enum: ['active', 'deactivated'], default: 'active' },
    restrictedPages: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
});

// Avoid re-compiling the model if it already exists
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
