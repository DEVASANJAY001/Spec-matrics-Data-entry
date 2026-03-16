import mongoose, { Schema, Document } from 'mongoose';

export interface IRegion extends Document {
    name: string;
    createdAt: Date;
}

const RegionSchema = new Schema<IRegion>({
    name: { type: String, required: true, unique: true, trim: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Region || mongoose.model<IRegion>('Region', RegionSchema);
